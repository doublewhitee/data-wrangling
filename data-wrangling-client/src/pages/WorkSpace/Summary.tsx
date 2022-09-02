import React, { Fragment, useEffect, useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import LinearProgress from '@material-ui/core/LinearProgress';

import Empty from '../../components/Empty';

interface summaryProps {
  currentColumn: {
    _id: string,
    name: string,
    datatype: string
  },
  rows: {
    row: { [key: string]: any },
    _id: string,
  }[],
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 160px)',
    },
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100vh - 152px)',
    },
    overflowY: 'auto',
    padding: theme.spacing(1, 1.5),
  },
  title: {
    fontWeight: 'bold',
    margin: theme.spacing(1, 0),
  },
  progress: {
    margin: theme.spacing(1, 0),
  }
}));

const Summary: React.FC<summaryProps> = props => {
  const classes = useStyles()
  const { currentColumn, rows } = props
  const [emptyNum, setEmptyNum] = useState(0)
  const [rowValMap, setRowValMap] = useState<{ [key: string]: number }>({})
  const [topKey, setTopKey] = useState<string[]>([])

  useEffect(() => {
    if (currentColumn._id !== '') {
      const map = {} as { [key: string]: number }
      let empty = 0
      rows.forEach(r => {
        if (r && r.row && r.row[currentColumn._id] && r.row[currentColumn._id].toString().trim().length > 0) {
          if (map[r.row[currentColumn._id].toString().trim()]) {
            map[r.row[currentColumn._id].toString().trim()] += 1
          } else {
            map[r.row[currentColumn._id].toString().trim()] = 1
          }
        } else {
          empty += 1
        }
      })
      // sort
      const top = Object.keys(map).sort((a, b) => map[b] - map[a]).slice(0, 5)
      setEmptyNum(empty)
      setRowValMap(map)
      setTopKey(top)
    }
  }, [currentColumn._id, rows])

  return (
    <div className={classes.container}>
      {
        currentColumn._id && currentColumn._id.length > 0 ?
        (
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap className={classes.title}>
                Column Name
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap>
                {currentColumn.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap className={classes.title}>
                Rows
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap>
                {rows.length}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap className={classes.title}>
                Empty
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap>
                {emptyNum}
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.progress}>
              <Tooltip title={`valid cell: ${rows.length - emptyNum} / ${rows.length}`} placement="top">
                <LinearProgress variant="determinate" value={Math.floor((rows.length - emptyNum) * 100 / rows.length)} />
              </Tooltip>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap className={classes.title}>
                Categories
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="inherit" noWrap>
                {Object.keys(rowValMap).length}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="inherit" noWrap className={classes.title}>
                Top {topKey.length} Keys
              </Typography>
            </Grid>
            <Grid item container xs={12} alignItems="center">
              {
                topKey.map(key => (
                  <Fragment key={key}>
                    <Grid item xs={4} className={classes.progress}>
                      <Typography variant="subtitle2" color="inherit" noWrap>
                        {key}
                      </Typography>
                    </Grid>
                    <Grid item xs={8} className={classes.progress}>
                      <Tooltip title={`${rowValMap[key]} / ${rows.length}`} placement="top">
                        <LinearProgress variant="determinate" value={Math.floor(rowValMap[key] * 100 / rows.length)} />
                      </Tooltip>
                    </Grid>
                  </Fragment>
                ))
              }
            </Grid>
          </Grid>
        ) :
        <Empty content='No column is currently selected, please view column info through "Column Detail"' />
      }
    </div>
  );
};

export default Summary;
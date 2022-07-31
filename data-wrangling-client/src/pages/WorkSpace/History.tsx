import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Pagination from '@material-ui/lab/Pagination';

interface historyProps {
  historyList: {
    _id: string,
    type: string,
    action: string,
    comment: string
  }[],
  currentPage: number,
  totalPage: number,
  setCurrentPage: (val: number) => void
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 160px)',
    },
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100vh - 152px)',
    },
  },
  list: {
    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 210px)',
    },
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100vh - 202px)',
    },
    overflowY: 'auto',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(1, 0)
  }
}));

const History: React.FC<historyProps> = props => {
  const classes = useStyles()
  const { historyList, currentPage, totalPage, setCurrentPage } = props

  return (
    <div className={classes.container}>
      <List className={classes.list}>
        {
          historyList.map(item => (
            <ListItem button id={item._id} key={item._id}>
              <ListItemText
                primary={item.action}
                // secondary={item.comment}
              />
              <Chip label={item.type} variant="outlined" size="small" />
            </ListItem>
          ))
        }
      </List>

      <div className={classes.pagination}>
        <Pagination
          size="small"
          variant="outlined"
          count={totalPage}
          page={currentPage}
          onChange={(_, val) => setCurrentPage(val)}
        />
      </div>
    </div>
  );
};

export default History;
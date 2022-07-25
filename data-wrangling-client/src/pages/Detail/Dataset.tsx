import React, { Fragment, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import datasetImg from '../../assets/dataset.png';

interface dataset {
  _id: string,
  name: string
}

interface datasetProps {
  handleClickActionArea: (dataset: dataset) => void
}

const datasets = [
  { _id: '1', name: 'aaaa' },
  { _id: '2', name: 'bbbb' },
]

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(1),
  },
  btnBar: {
    textAlign: 'center',
  },
  media: {
    height: 120,
  },
}));

const Dataset: React.FC<datasetProps> = props => {
  const classes = useStyles()
  const { handleClickActionArea } = props
  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const popoverOpen = Boolean(anchorEl)

  // click more button, show popover
  const handleClickMoreBtn = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Fragment>
      <Grid container justifyContent="flex-start" alignItems="center">
        {datasets.map((item) => (
          <Grid item xs={6} sm={4} md={3} lg={2} className={classes.card} key={item._id}>
            <Card variant="outlined">
              <CardActionArea onClick={() => handleClickActionArea(item)}>
                <CardMedia
                  className={classes.media}
                  image={datasetImg}
                  title="Contemplative Reptile"
                />
                <CardContent>
                  <Typography gutterBottom variant="subtitle1" noWrap>
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Grid container className={classes.btnBar}>
                  <Grid item xs={6}>
                    <Button size="small" color="primary">
                      Detail
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button size="small" color="primary" onClick={handleClickMoreBtn}>
                      More
                    </Button>
                  </Grid>
                </Grid>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List dense>
          <ListItem button>
            <ListItemText primary="Rename Dataset" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Unoin" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Inner Join" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Outer Join" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Split By Columns" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Split By Rows" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Delete" />
          </ListItem>
        </List>
      </Popover>
    </Fragment>
  );
};

export default Dataset;
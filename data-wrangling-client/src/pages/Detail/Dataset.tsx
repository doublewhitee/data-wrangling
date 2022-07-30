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

import Confirm from '../../components/Confirm';

interface dataset {
  _id: string,
  name: string,
  rows: number,
  columns: {
    _id: string,
    name: string,
    datatype: string,
  }[],
  user_info: {
    _id: string,
    first_name: string,
    last_name: string
  },
  create_at: Date,
  update_at: Date
}

interface datasetProps {
  datasets: dataset[],
  handleClickActionArea: (dataset: dataset) => void,
  handleSetDataset: (dataset: dataset) => void,
  handleRename: () => void,
  handleDelete: () => void,
  handleDetail: () => void,
}

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
  title: {
    fontWeight: 'bold',
    marginBottom: -theme.spacing(2)
  }
}));

const Dataset: React.FC<datasetProps> = props => {
  const classes = useStyles()
  const {
    datasets,
    handleClickActionArea,
    handleSetDataset,
    handleRename,
    handleDelete,
    handleDetail
  } = props
  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const popoverOpen = Boolean(anchorEl)
  // confirm dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // click more button, show popover
  const handleClickMoreBtn = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // click rename button
  const handleClickRename = () => {
    setAnchorEl(null)
    handleRename()
  }

  // confirm delete
  const handleConfirmDelete = () => {
    setAnchorEl(null)
    handleDelete()
    setIsDialogOpen(false)
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
                  title="Dataset"
                />
                <CardContent>
                  <Typography gutterBottom variant="subtitle1" className={classes.title} noWrap>
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions onClick={() => handleSetDataset(item)}>
                <Grid container className={classes.btnBar}>
                  <Grid item xs={6}>
                    <Button size="small" color="primary" onClick={handleDetail}>
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
            <ListItemText primary="Rename dataset" onClick={handleClickRename} />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Unoin" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Inner join" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Outer join" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Split by columns" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Split by rows" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Delete" onClick={() => setIsDialogOpen(true)} />
          </ListItem>
        </List>
      </Popover>

      <Confirm
        isDialogOpen={isDialogOpen}
        content={'Are you sure to delete this dataset?'}
        handleClose={() => setIsDialogOpen(false)}
        handleConfirm={handleConfirmDelete}
      />
    </Fragment>
  );
};

export default Dataset;
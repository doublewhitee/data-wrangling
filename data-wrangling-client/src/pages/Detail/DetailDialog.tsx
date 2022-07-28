import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { formatDate } from '../../utils/time';

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

interface uploadDialogProps {
  dataset: dataset | undefined,
  isDialogOpen: boolean,
  handleClose: () => void,
}

const useStyles = makeStyles((theme) => ({
  listContainer: {
    maxHeight: 500,
    maxWidth: 600,
    padding: theme.spacing(1, 2)
  },
  title: {
    fontWeight: 'bold',
    margin: theme.spacing(1, 0)
  }
}));

const DetailDialog: React.FC<uploadDialogProps> = props => {
  const classes = useStyles()
  const { isDialogOpen, handleClose, dataset } = props

  return (
    <Dialog onClose={handleClose} open={isDialogOpen} fullWidth maxWidth="sm">
      <DialogTitle>
        Dataset Detail
      </DialogTitle>

      <DialogContent dividers>
        <div className={classes.listContainer}>
          {
            dataset ?
            <Grid container alignItems="center">
              <Grid item xs={6} className={classes.title}>Dataset Name</Grid>
              <Grid item xs={6}>{dataset.name}</Grid>
              <Grid item xs={6} className={classes.title}>Create By</Grid>
              <Grid item xs={6}>{`${dataset.user_info.first_name} ${dataset.user_info.last_name}`}</Grid>
              <Grid item xs={6} className={classes.title}>Columns</Grid>
              <Grid item xs={6}>{dataset.columns.length}</Grid>
              <Grid item xs={6} className={classes.title}>Rows</Grid>
              <Grid item xs={6}>{dataset.rows}</Grid>
              <Grid item xs={6} className={classes.title}>Create At</Grid>
              <Grid item xs={6}>{formatDate(dataset.create_at, 'yyyy-MM-dd mm:ss')}</Grid>
              <Grid item xs={6} className={classes.title}>Update At</Grid>
              <Grid item xs={6}>{formatDate(dataset.update_at, 'yyyy-MM-dd mm:ss')}</Grid>
            </Grid> : ''
          }
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;
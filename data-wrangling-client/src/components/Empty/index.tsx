import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import FolderOpenIcon from '@material-ui/icons/FolderOpen';

interface emptyProps {
  content?: string
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    textAlign: 'center',
  },
  icon: {
    fontSize: '100px',
    color: theme.palette.grey[600],
  },
  text: {
    color: theme.palette.grey[600],
  },
}));

const Empty: React.FC<emptyProps> = props => {
  const classes = useStyles()
  const { content } = props

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <FolderOpenIcon className={classes.icon} />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom className={classes.text}>
          {content}
        </Typography>
      </Grid>
    </Grid>
  );
};

Empty.defaultProps = {
  content: 'No data here.'
}

export default Empty;
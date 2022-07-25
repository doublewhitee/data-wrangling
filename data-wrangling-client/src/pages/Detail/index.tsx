import React from 'react';
import { useNavigate } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import NoteAddIcon from '@material-ui/icons/NoteAdd';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import Dataset from './Dataset';

interface dataset {
  _id: string,
  name: string
}

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  topBar: {
    marginBottom: theme.spacing(1)
  },
  btnBar: {
    margin: theme.spacing(1, 0)
  },
  subtext: {
    margin: theme.spacing(1, 0),
    fontSize: '12px'
  },
  descText: {
    color: theme.palette.grey[600],
  },
  button: {
    marginLeft: theme.spacing(1),
  }
}));

const Detail: React.FC = () => {
  const classes = useStyles()
  const navigate = useNavigate()

  // navigate to table page
  const handleNavToTablePage = (dataset: dataset) => {
    navigate(`/table/${dataset._id}`)
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container justifyContent="space-between" alignItems="center" className={classes.topBar}>
        <Grid item xs={12}>
          <Typography variant="h6" color="inherit" noWrap>
            Project Name
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Breadcrumbs aria-label="breadcrumb" className={classes.subtext}>
            <Link color="inherit" href="/project">
              Projects
            </Link>
            <div style={{ color: '#000' }}>Detail</div>
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="inherit" noWrap>
            Created by Zhuo Chen
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.descText}>
          <Typography variant="caption" color="inherit" noWrap>
            aaa
          </Typography>
        </Grid>
      </Grid>

      <Divider />

      <Grid container justifyContent="flex-end" alignItems="center" className={classes.btnBar}>
        <Button
          variant="outlined"
          size="medium"
          color="primary"
          startIcon={<NoteAddIcon />}
        >
          Create
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
        >
          Import
        </Button>
      </Grid>

      <Dataset
        handleClickActionArea={handleNavToTablePage}
      />
    </Container>
  );
};

export default Detail;
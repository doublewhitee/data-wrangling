import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import NoteAddIcon from '@material-ui/icons/NoteAdd';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { useAppSelector } from '../../redux/hooks';
import message from '../../components/Message';
import Empty from '../../components/Empty';
import { reqProjectDetail } from '../../api/project';
import { reqDatasetList, reqCreateDataset, reqRenameDataset, reqDeleteDataset } from '../../api/dataset';
import Dataset from './Dataset';
import UploadDialog from './UploadDialog';
import DetailDialog from './DetailDialog';

interface dataset {
  _id: string,
  name: string,
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
  },
  circularProgress: {
    marginRight: theme.spacing(2),
  },
}));

const Detail: React.FC = () => {
  const classes = useStyles()
  const user = useAppSelector((state) => state.user._id)
  const navigate = useNavigate()
  const params = useParams()
  // project info
  const [projectInfo, setProjectInfo] = useState({
    _id: '',
    name: 'Project Name',
    create_by: {
      first_name: '',
      last_name: ''
    },
    desc: 'Description'
  })
  // dataset list
  const [datasetList, setDatasetList] = useState()
  // current dataset
  const [currentDataset, setCurrentDataset] = useState<dataset>()
  // creat / rename dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  // dialogLoading
  const [dialogLoading, setDialogLoading] = useState(false)
  // dataset name for create & edit
  const [inputDatasetName, setInputDatasetName] = useState('')
  const [inputDatasetNameState, setInputDatasetNameState] = useState({ error: false, helperText: '' })
  // upload file dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  // detail dialog
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  useEffect(() => {
    if (params.projectId) {
      handleReqProjectDetail()
      handleReqDatasetList()
    } else {
      message.error('Params error!')
    }
  }, [])

  // req project detial
  const handleReqProjectDetail = async () => {
    const res = await reqProjectDetail(params.projectId!)
    if (res && res.code === 200) {
      setProjectInfo({ ...res.data })
    } else {
      navigate('/project', { replace: true })
      message.error(res.message)
    }
  }

  // req dataset list
  const handleReqDatasetList = async () => {
    const res = await reqDatasetList(params.projectId!)
    if (res && res.code === 200) {
      setDatasetList(res.data)
    } else {
      message.error(res.message)
    }
  }

  // show dialog
  const handleShowDialog = (type: string) => {
    setIsDialogOpen(true)
    if (type === 'create') {
      setDialogTitle('Create Dataset')
      setInputDatasetName('')
    } else {
      setDialogTitle('Rename Dataset')
      setInputDatasetName(currentDataset!.name)
    }
    setInputDatasetNameState({ error: false, helperText: '' })
  }

  // input dataset name
  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDatasetName(event.target.value)
    if (inputDatasetNameState.error && event.target.value.trim().length > 0) {
      setInputDatasetNameState({ error: false, helperText: '' })
    }
  }

  const handleValidName = () => {
    if (inputDatasetName.trim().length === 0) {
      setInputDatasetNameState({ error: true, helperText: 'Dataset name is required.' })
      return false
    }
    return true
  }

  // click save button in dialog
  const handleSaveDiaglog = async () => {
    if (handleValidName()) {
      setDialogLoading(true)
      if (dialogTitle === 'Create Dataset') {
        const res = await reqCreateDataset(inputDatasetName, projectInfo._id, user)
        if (res && res.code === 200) {
          message.success('Create dataset successful!')
          setIsDialogOpen(false)
          handleReqDatasetList()
        } else {
          message.error(res.message)
        }
      } else {
        const res = await reqRenameDataset(inputDatasetName, currentDataset!._id)
        if (res && res.code === 200) {
          message.success('Rename dataset successful!')
          setIsDialogOpen(false)
          handleReqDatasetList()
        } else {
          message.error(res.message)
        }
      }
      setDialogLoading(false)
    }
  }

  // delete dataset
  const handleDeleteDataset = async () => {
    const res = await reqDeleteDataset(currentDataset!._id, projectInfo._id)
        if (res && res.code === 200) {
          message.success('Delete dataset successful!')
          handleReqDatasetList()
        } else {
          message.error(res.message)
        }
  }

  // navigate to table page
  const handleNavToTablePage = (dataset: dataset) => {
    navigate(`/table/${dataset._id}`)
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container justifyContent="space-between" alignItems="center" className={classes.topBar}>
        <Grid item xs={12}>
          <Typography variant="h6" color="inherit" noWrap>
            {projectInfo.name}
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
            Created by {`${projectInfo.create_by.first_name} ${projectInfo.create_by.last_name}`}
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.descText}>
          <Typography variant="caption" color="inherit" noWrap>
            {projectInfo.desc !== '' ? projectInfo.desc : 'No description.'}
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
          onClick={() => handleShowDialog('create')}
        >
          Create
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
          onClick={() => setIsUploadDialogOpen(true)}
        >
          Import
        </Button>
      </Grid>

      {
        datasetList ?
        <Dataset
          datasets={datasetList}
          handleSetDataset={setCurrentDataset}
          handleRename={() => handleShowDialog('edit')}
          handleDelete={handleDeleteDataset}
          handleClickActionArea={handleNavToTablePage}
          handleDetail={() => setIsDetailDialogOpen(true)}
        /> :
        <Empty />
      }

      <Dialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Please enter a valid dataset name.
          </Typography>
          <Typography gutterBottom>
            <TextField
              margin="dense"
              label="Dataset Name"
              fullWidth
              required
              value={inputDatasetName}
              error={inputDatasetNameState.error}
              helperText={inputDatasetNameState.helperText}
              onChange={handleChangeName}
              onBlur={handleValidName}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button color="primary" disabled={dialogLoading} onClick={handleSaveDiaglog}>
            {dialogLoading && <CircularProgress className={classes.circularProgress} size={15} />}
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <UploadDialog
        projectId={projectInfo._id}
        userId={user}
        isDialogOpen={isUploadDialogOpen}
        refresh={handleReqDatasetList}
        handleClose={() => setIsUploadDialogOpen(false)}
      />

      <DetailDialog
        isDialogOpen={isDetailDialogOpen}
        handleClose={() => setIsDetailDialogOpen(false)}
        dataset={currentDataset}
      />
    </Container>
  );
};

export default Detail;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';

import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined';

import { useAppSelector } from '../../redux/hooks';
import message from '../../components/Message';
import { reqProjectList, reqCreateProject, reqEditProject, reqDeleteProject } from '../../api/project';
import Empty from '../../components/Empty';
import ProjectTable from './ProjectTable';

interface projectRow {
  _id: string,
  name: string,
  update_at: Date,
  desc: string,
  user_info: {
    first_name: string,
    last_name: string,
    email: string
  }
}

const useStyles = makeStyles((theme) => ({
  topBar: {
    marginBottom: theme.spacing(2)
  },
  circularProgress: {
    marginRight: theme.spacing(2),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

const Project: React.FC = () => {
  const classes = useStyles()
  const user = useAppSelector((state) => state.user._id)
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState('update_at')
  // project list
  const [projectList, setProjectList] = useState<projectRow[]>([])
  // creat / rename dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  // dialogLoading
  const [dialogLoading, setDialogLoading] = useState(false)
  // dialog form
  const [projectForm, setProjectForm] = useState({
    _id: '',
    name: '',
    desc: ''
  })
  const [formState, setFormState] = useState({
    name: { error: false, helperText: '' },
  })
  // current row
  const [currentRow, setCurrentRow] = useState<projectRow>()

  useEffect(() => {
    if (user !== '') {
      handleReqProjectList()
    }
  }, [user, tabValue])

  // get project list
  const handleReqProjectList = async () => {
    const res = await reqProjectList(user, 1, tabValue)
    if (res && res.code === 200) {
      setProjectList([...res.data])
    } else {
      message.error(res.message)
    }
  }

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue)
  }

  // project name
  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectForm(val => ({ ...val, name: event.target.value }))
    if (formState.name.error && event.target.value.trim().length > 0) {
      setFormState(val => ({ ...val, name: {error: false, helperText: ''} }))
    }
  }

  const handleValidName = () => {
    if (projectForm.name.trim().length === 0) {
      setFormState(val => ({ ...val, name: {error: true, helperText: 'Project name is required.'} }))
      return false
    }
    return true
  }

  // project desc
  const handleChangeDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectForm(val => ({ ...val, desc: event.target.value }))
  }

  // show dialog
  const handleProject = (type: string) => {
    if (type === 'create') {
      setDialogTitle('Create Project')
      setProjectForm({ _id: '', name: '', desc: '' })
    } else {
      setDialogTitle('Edit Project')
      setProjectForm({ _id: currentRow!._id, name: currentRow!.name, desc: currentRow!.desc })
    }
    setFormState({ name: { error: false, helperText: '' }})
    setIsDialogOpen(true)
  }

  // close dialog
  const handleCloseDiaglog = () => {
    setIsDialogOpen(false)
  }

  // save dialog
  const handleSaveDiaglog = async () => {
    if (handleValidName()) {
      setDialogLoading(true)
      if (dialogTitle === 'Create Project') {
        const res = await reqCreateProject(projectForm.name, projectForm.desc, user)
        if (res && res.code === 200) {
          message.success('Create project Successful!')
          setIsDialogOpen(false)
          handleReqProjectList()
        } else {
          message.error(res.message)
        }
      } else if (dialogTitle === 'Edit Project') {
        const res = await reqEditProject(projectForm._id, projectForm.name, projectForm.desc)
        if (res && res.code === 200) {
          message.success('Edit project Successful!')
          setIsDialogOpen(false)
          handleReqProjectList()
        } else {
          message.error(res.message)
        }
      }
      setDialogLoading(false)
    }
  }

  // delete project
  const handleDeleteProject = async () => {
    const res = await reqDeleteProject(currentRow!._id)
    if (res && res.code === 200) {
      message.success('Delete project Successful!')
      handleReqProjectList()
    } else {
      message.error(res.message)
    }
  }

  // navigate to detail page
  const handleNavToDetailPage = (row: projectRow) => {
    navigate(`/detail/${row._id}`)
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container justifyContent="space-between" alignItems="center" className={classes.topBar}>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" color="inherit" noWrap>
            Projects
          </Typography>
        </Grid>
        <Grid container item justifyContent="flex-end" alignItems="center" spacing={2} xs={12} sm={9}>
          <Grid item>
            <Button
              variant="outlined"
              size="medium"
              color="primary"
              startIcon={<CreateNewFolderOutlinedIcon />}
              onClick={() => handleProject('create')}
            >
              Create
            </Button>
          </Grid>
          <Grid item>
            <TextField
              type="search"
              variant="outlined"
              placeholder="Search"
              size="small"
            />
          </Grid>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary">
        <Tab label="Latest Update" value="update_at" />
        <Tab label="Project Name" value="name" />
      </Tabs>

      {
        projectList.length > 0 ?
        <ProjectTable
          projectList={projectList}
          handleClickLink={handleNavToDetailPage}
          handleSetRow={setCurrentRow}
          handleRenameProject={() => handleProject('edit')}
          handleDeleteProject={handleDeleteProject}
        /> :
        <Empty />
      }

      <Dialog onClose={handleCloseDiaglog} open={isDialogOpen}>
        <DialogTitle>
          {dialogTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Please enter a project name and description (optional).
          </Typography>
          <Typography gutterBottom>
            <TextField
              margin="dense"
              label="Project Name"
              fullWidth
              required
              value={projectForm.name}
              error={formState.name.error}
              helperText={formState.name.helperText}
              onChange={handleChangeName}
              onBlur={handleValidName}
            />
          </Typography>
          <Typography gutterBottom>
            <TextField
              margin="dense"
              label="Project Description"
              multiline
              maxRows={4}
              fullWidth
              value={projectForm.desc}
              onChange={handleChangeDesc}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiaglog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveDiaglog} color="primary" disabled={dialogLoading}>
            {dialogLoading && <CircularProgress className={classes.circularProgress} size={15} />}
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Project;
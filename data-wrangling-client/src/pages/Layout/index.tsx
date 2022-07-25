import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { deepOrange } from '@material-ui/core/colors';

import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import Project from '../Project';
import Detail from '../Detail';
import WorkSpace from '../WorkSpace';
import Confirm from '../../components/Confirm';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { clearUserInfo } from '../../redux/reducers/userSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    backgroundColor: deepOrange[500],
    cursor: 'pointer',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  popoverName: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  popoverEmail: {
    paddingTop: theme.spacing(1),
    color: theme.palette.grey[600],
    textAlign: 'right',
    minWidth: '150px'
  }
}));

const Layout: React.FC = () => {
  const classes = useStyles()
  const user = useAppSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const popoverOpen = Boolean(anchorEl)
  // confirm dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // click avatar, show popover
  const handleClickAvatar = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // sign out
  const handleClickSignOut = () => {
    setIsDialogOpen(true)
  }

  const handleSignOut = () => {
    Cookies.remove('token')
    dispatch(clearUserInfo())
    navigate('/start', { replace: true })
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute">
        <Toolbar className={classes.toolbar}>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Data Wrangling
          </Typography>
          <Avatar className={classes.avatar} onClick={handleClickAvatar}>
            {user.first_name ? user.first_name[0].toUpperCase() : 'A'}
            {user.last_name ? user.last_name[0].toUpperCase() : 'A'}
          </Avatar>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div>
          <Routes>
            <Route path="project" element={<Project />} />
            <Route path="detail/:projectId" element={<Detail />} />
            <Route path="table/:datasetId" element={<WorkSpace />} />
            <Route path="/" element={<Navigate to="/project" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </main>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List component="nav">
          <ListItem>
            <ListItemText>
              <Typography variant="subtitle1" display="block" className={classes.popoverName}>
                {`${user.first_name} ${user.last_name}`}
              </Typography>
              <Typography variant="subtitle2" display="block" className={classes.popoverEmail}>
                {user.email}
              </Typography>
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem button onClick={handleClickSignOut}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Popover>

      <Confirm
        isDialogOpen={isDialogOpen}
        content={'Are you sure to log out?'}
        handleClose={() => setIsDialogOpen(false)}
        handleConfirm={handleSignOut}
      />
    </div>
  );
}

export default Layout;
import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles((theme) => ({
  topBar: {
    marginBottom: theme.spacing(2)
  },
  projectLink: {
    cursor: 'pointer',
  },
}));

const rows = [
  { name: 'project 1', createdBy: 'Zhuo Chen', contains: '3 Datasets', updated: '2022-7-20' },
  { name: 'project 2', createdBy: 'Zhuo Chen', contains: '2 Datasets', updated: '2022-7-22' }
]

const Project: React.FC = () => {
  const classes = useStyles()
  const [tabValue, setTabValue] = useState('update')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue)
  }

  const handleCreateProject = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDiaglog = () => {
    setIsDialogOpen(false)
  }

  return (
    <div>
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
              onClick={handleCreateProject}
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
        <Tab label="Latest Update" value="update" />
        <Tab label="Project Name" value="name" />
      </Tabs>

      <TableContainer>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project Name</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Contains</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name} hover>
              <TableCell><Link className={classes.projectLink}>{row.name}</Link></TableCell>
              <TableCell>{row.createdBy}</TableCell>
              <TableCell>{row.contains}</TableCell>
              <TableCell>{row.updated}</TableCell>
              <TableCell><IconButton size="small"><MoreHorizIcon /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>

      <Dialog onClose={handleCloseDiaglog} open={isDialogOpen}>
        <DialogTitle>
          Create Project
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </Typography>
          <Typography gutterBottom>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
            lacus vel augue laoreet rutrum faucibus dolor auctor.
          </Typography>
          <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
            auctor fringilla.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiaglog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCloseDiaglog} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Project;
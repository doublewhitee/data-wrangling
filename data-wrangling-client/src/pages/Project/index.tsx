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

import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined';

const useStyles = makeStyles((theme) => ({
  topBar: {
    marginBottom: theme.spacing(2)
  },
  projectLink: {
    cursor: 'pointer',
  }
}));

const rows = [
  { name: 'project 1', createdBy: 'Zhuo Chen', contains: '3 Datasets', updated: '2022-7-20' },
  { name: 'project 2', createdBy: 'Zhuo Chen', contains: '2 Datasets', updated: '2022-7-22' }
]

const Project: React.FC = () => {
  const classes = useStyles()
  const [tabValue, setTabValue] = useState('update')

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabValue(newValue)
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
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell><Link className={classes.projectLink}>{row.name}</Link></TableCell>
              <TableCell>{row.createdBy}</TableCell>
              <TableCell>{row.contains}</TableCell>
              <TableCell>{row.updated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Project;
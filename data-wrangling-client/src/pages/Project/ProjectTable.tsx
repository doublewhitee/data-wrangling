import React, { Fragment, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import { formatDate } from '../../utils/time';
import Confirm from '../../components/Confirm';

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

interface projectTableProps {
  projectList: projectRow[],
  handleSetRow: (row: projectRow) => void,
  handleRenameProject: () => void,
  handleDeleteProject: () => void
}

const useStyles = makeStyles((theme) => ({
  projectLink: {
    cursor: 'pointer',
  },
}));

const ProjectTable: React.FC<projectTableProps> = props => {
  const classes = useStyles()
  const { projectList, handleSetRow, handleRenameProject, handleDeleteProject } = props
  // popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const popoverOpen = Boolean(anchorEl)
  // confirm dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleShowMore = (event: React.MouseEvent<HTMLElement>, row: projectRow) => {
    setAnchorEl(event.currentTarget)
    handleSetRow(row)
  }

  const handleRename = () => {
    setAnchorEl(null)
    handleRenameProject()
  }

  const handleConfirmDelete = () => {
    setAnchorEl(null)
    handleDeleteProject()
    setIsDialogOpen(false)
  }

  return (
    <Fragment>
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
          {projectList.map(row => (
            <TableRow key={row._id} hover>
              <TableCell><Link className={classes.projectLink}>{row.name}</Link></TableCell>
              <TableCell>{`${row.user_info.first_name} ${row.user_info.last_name}`}</TableCell>
              <TableCell>0 Datasets</TableCell>
              <TableCell>{formatDate(row.update_at)}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={(e) => handleShowMore(e, row)}>
                  <MoreHorizIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>

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
        <List component="nav" dense>
          <ListItem button>
            <ListItemText primary="Rename" onClick={handleRename} />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Export" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Delete" onClick={() => setIsDialogOpen(true)} />
          </ListItem>
        </List>
      </Popover>

      <Confirm
        isDialogOpen={isDialogOpen}
        content={'Are you sure to delete this project?'}
        handleClose={() => setIsDialogOpen(false)}
        handleConfirm={handleConfirmDelete}
      />
    </Fragment>
  );
};

export default ProjectTable;
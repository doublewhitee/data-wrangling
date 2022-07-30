import React, { useState, useEffect } from 'react';
import DataGrid, { TextEditor, SelectColumn, Row } from 'react-data-grid';
import './Table.css'

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

import SettingsIcon from '@material-ui/icons/Settings';

import { useAppSelector } from '../../redux/hooks';
import message from '../../components/Message';
import Confirm from '../../components/Confirm';
import { reqEditCell, reqRenameCol, reqAddCol, reqDeleteCol, reqAddRow, reqDeleteRow } from '../../api/dataset';

interface tableProps {
  projectId: string,
  datasetId: string,
  columns: {
    _id: string,
    name: string,
    datatype: string
  }[],
  rows: {
    row: object,
    _id: string,
  }[],
  onChangeSuccess: () => void,
  onRefresh: () => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    colName: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    colIcon: {
      display: 'flex',
      justifyContent: 'right',
      cursor: 'pointer',
    },
    settingIcon: {
      height: 20,
      width: 20,
    },
  }),
);

const RowRenderer = (props: any) => {
  const { onClickContextMenu } = props
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onClickContextMenu!(e, props.row)
  }
  return (
    <Row {...props} onContextMenu={handleContextMenu} />
  );
}

const Table: React.FC<tableProps> = props => {
  const { projectId, datasetId, columns, rows, onChangeSuccess, onRefresh } = props
  const classes = useStyles()
  const userId = useAppSelector((state) => state.user._id)
  // context menu
  const { show } = useContextMenu({
    id: 'rowContextMenu',
  })
  // cols and rows
  const [colList, setColList] = useState<any>([])
  const [rowList, setRowList] = useState<any>([])
  // current col & row
  const [currentCol, setCurrentCol] = useState<any>({})
  const [currentRow, setCUrrentRow] = useState<any>({})
  // loading backdrop
  const [open, setOpen] = useState(false)
  // column popover
  const [anchorColPopoverEl, setAnchorColPopoverEl] = useState<HTMLElement | null>(null)
  const colPopoverOpen = Boolean(anchorColPopoverEl)
  // dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogText, setDialogText] = useState('')
  const [columnNameInput, setColumnNameInput] = useState('')
  const [columnNameState, setColumnNameState] = useState({ error: false, helperText: '' })
  // confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmType, setConfrimType] = useState('')
  // select rows
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    setColList(createColumns)
  }, [columns])

  useEffect(() => {
    setRowList(createRows)
  }, [rows])

  const createColumns = () => {
    const cols = [
      SelectColumn,
    ]
    columns.forEach(i => {
      cols.push({
        key: i._id,
        name: i.name,
        editor: TextEditor,
        headerCellClass: 'filterCell',
        headerRenderer: () => (
          <>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item xs={10} className={classes.colName} component="p">{i.name}</Grid>
              <Grid
                item xs={2}
                className={classes.colIcon}
                component="p"
                onClick={(e: React.MouseEvent<HTMLElement>) => handleClickColIcon(e, i)}
              >
                <SettingsIcon className={classes.settingIcon} />
              </Grid>
            </Grid>
            <div>
              <input type="text" />
            </div>
          </>
        )
      })
    })
    return cols
  }
  
  const createRows = () => {
    const rowlist = [] as any
    rows.forEach(i => {
      rowlist.push({ ...i.row, _id: i._id })
    })
    return rowlist
  }

  const dialogContent = () => {
    if (dialogTitle === 'Rename Column' || dialogTitle === 'Add Column to the Left' || dialogTitle === 'Add Column to the Right') {
      return (
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Column Name"
          error={columnNameState.error}
          helperText={columnNameState.helperText}
          onChange={handleChangeColName}
          onBlur={handleValidColName}
          value={columnNameInput}
        />
      )
    }
  }

  // click col setting icon
  const handleClickColIcon = (event: React.MouseEvent<HTMLElement>, col: object) => {
    setAnchorColPopoverEl(event.currentTarget)
    setCurrentCol(col)
  }

  // cell value change
  const handleRowsChange = async (rows: any, data: any) => {
    setOpen(true)
    const row = rows[data.indexes[0]]
    const _id = row._id
    delete row._id
    const res = await reqEditCell(userId, projectId, datasetId, _id, row)
    if (res && res.code === 200) {
      setRowList(rows)
      onChangeSuccess()
    } else {
      message.error(res.message)
    }
    setOpen(false)
  }

  // right click rows
  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    setCUrrentRow(row)
    show(e)
  }

  // show dialog
  const handleShowDialog = (type: string) => {
    setAnchorColPopoverEl(null)
    if (type === 'rename') {
      setDialogTitle('Rename Column')
      setDialogText('Please enter a column name.')
      setColumnNameInput(currentCol.name)
      setColumnNameState({ error: false, helperText: '' })
    } else if (type === 'add left') {
      setDialogTitle('Add Column to the Left')
      setDialogText('Please enter a column name.')
      setColumnNameInput('')
      setColumnNameState({ error: false, helperText: '' })
    } else if (type === 'add right') {
      setDialogTitle('Add Column to the Right')
      setDialogText('Please enter a column name.')
      setColumnNameInput('')
      setColumnNameState({ error: false, helperText: '' })
    }
    setIsDialogOpen(true)
  }

  // col name input
  const handleChangeColName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnNameInput(event.target.value)
    if (columnNameState.error && event.target.value.length > 0) {
      setColumnNameState({ error: false, helperText: '' })
    }
  }

  const handleValidColName = () => {
    if (columnNameInput.trim().length === 0) {
      setColumnNameState({ error: true, helperText: 'Column name is required.' })
      return false
    }
    return true
  }

  // click save in dialog
  const handleClickSave = async () => {
    let res = undefined
    setOpen(true)
    if (dialogTitle === 'Rename Column' || dialogTitle === 'Add Column to the Left' || dialogTitle === 'Add Column to the Right') {
      if (handleValidColName()) {
        if (dialogTitle === 'Rename Column') {
          res = await reqRenameCol(userId, projectId, datasetId, currentCol._id, currentCol.name, columnNameInput)
        } else {
          const dir = dialogTitle === 'Add Column to the Left' ? 'left' : 'right'
          res = await reqAddCol(userId, projectId, datasetId, currentCol._id, dir, columnNameInput)
        }
      }
    }
    if (res && res.code === 200) {
      setIsDialogOpen(false)
      onChangeSuccess()
      onRefresh()
    } else {
      message.error(res.message)
    }
    setOpen(false)
  }

  // add row
  const handleAddRow = async () => {
    setOpen(true)
    const row: { [key: string]: string } = {}
    Object.keys(currentRow).forEach(key => {
      if (key !== '_id') {
        row[key] = ''
      }
    })
    const res = await reqAddRow(userId, projectId, datasetId, row)
    if (res && res.code === 200) {
      onChangeSuccess()
      onRefresh()
    } else {
      message.error(res.message)
    }
    setOpen(false)
  }

  // delete row / col
  const handleOpenConfirm = (type: string) => {
    setAnchorColPopoverEl(null)
    setIsConfirmOpen(true)
    setConfrimType(type)
  }

  const handleConfirmDelete = async () => {
    let res = undefined
    setOpen(true)
    setIsConfirmOpen(false)
    if (confirmType === 'col') {
      res = await reqDeleteCol(userId, projectId, datasetId, currentCol._id, currentCol.name)
    } else if (confirmType === 'row') {
      res = await reqDeleteRow(userId, projectId, datasetId, [currentRow._id])
    } else {
      res = await reqDeleteRow(userId, projectId, datasetId, Array.from(selectedRows))
    }
    if (res && res.code === 200) {
      onChangeSuccess()
      onRefresh()
    } else {
      message.error(res.message)
    }
    setOpen(false)
  }

  return (
    <div>
      <DataGrid
        headerRowHeight={70}
        columns={colList}
        rows={rowList}
        style={{ height: '100%' }}
        rowKeyGetter={(row: any) => row._id}
        onRowsChange={handleRowsChange}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        components={{ rowRenderer: p => (<RowRenderer {...p} onClickContextMenu={handleContextMenu} />) }}
      />

      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Popover
        id="colPopover"
        open={colPopoverOpen}
        anchorEl={anchorColPopoverEl}
        onClose={() => setAnchorColPopoverEl(null)}
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
            <ListItemText primary="Rename column" onClick={() => handleShowDialog('rename')} />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Column detail" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Add a column to the left" onClick={() => handleShowDialog('add left')} />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Add a column to the right" onClick={() => handleShowDialog('add right')} />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Transform column" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Separate column" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Combine columns" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Delete" onClick={() => handleOpenConfirm('col')} />
          </ListItem>
        </List>
      </Popover>

      <Menu id="rowContextMenu">
        <List component="nav" dense>
          <ListItem button>
            <ListItemText primary="Add a row to the end" onClick={handleAddRow} />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Transform row" />
          </ListItem>
          <ListItem button disabled>
            <ListItemText primary="Combine rows" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText primary="Delete" onClick={() => handleOpenConfirm('row')} />
          </ListItem>
          <ListItem button disabled={selectedRows.size <= 1}>
            <ListItemText primary="Delete selected rows" onClick={() => handleOpenConfirm('multi row')} />
          </ListItem>
        </List>
      </Menu>

      <Dialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen} fullWidth maxWidth="sm">
      <DialogTitle>
        {dialogTitle}
      </DialogTitle>

      <DialogContent dividers>
        <Typography gutterBottom>
          {dialogText}
        </Typography>
        {dialogContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setIsDialogOpen(false)} color="primary">
          Close
        </Button>
        <Button onClick={handleClickSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>

    <Confirm
      isDialogOpen={isConfirmOpen}
      content={`Are you sure to delete ${confirmType === 'col' ?
        'this col' : confirmType === 'row' ? 'this row' : 'the selected rows' }?`}
      handleClose={() => setIsConfirmOpen(false)}
      handleConfirm={handleConfirmDelete}
    />
    </div>
  );
};

export default Table;
import React, { useState, useEffect, useMemo } from 'react';
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
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

import SettingsIcon from '@material-ui/icons/Settings';

import { useAppSelector } from '../../redux/hooks';
import message from '../../components/Message';
import Confirm from '../../components/Confirm';
import {
  reqEditCell,
  reqRenameCol,
  reqAddCol,
  reqDeleteCol,
  reqAddRow,
  reqDeleteRow,
  reqCombineRow,
  reqCombineCol,
  reqSplitCol,
  reqTransformRow,
  reqTransformCol
} from '../../api/dataset';

const Interpreter = require('js-interpreter');

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
      zIndex: theme.zIndex.drawer + 1000,
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
  const inputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>
  // context menu
  const { show } = useContextMenu({
    id: 'rowContextMenu',
  })
  // cols and rows
  const [colList, setColList] = useState<any>([])
  const [rowList, setRowList] = useState<any>([])
  // current col & row
  const [currentCol, setCurrentCol] = useState<any>({})
  const [currentRow, setCurrentRow] = useState<any>({})
  // loading backdrop
  const [open, setOpen] = useState(false)
  // column popover
  const [anchorColPopoverEl, setAnchorColPopoverEl] = useState<HTMLElement | null>(null)
  const colPopoverOpen = Boolean(anchorColPopoverEl)
  // dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogText, setDialogText] = useState('')
  const [inputTitle, setInputTitle] = useState('')
  const [columnInput, setColumnInput] = useState('')
  const [inputState, setInputState] = useState({ error: false, helperText: '' })
  // select col in dialog
  const [selectedCol, setSelectedCol] = useState('')
  const [selectColState, setSelectColState] = useState({ error: false, helperText: '' })
  // confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmType, setConfrimType] = useState('')
  const [confirmText, setConfirmText] = useState('')
  // select rows
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(() => new Set())
  // filter
  const [filters, setFilters] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setColList(createColumns)
  }, [columns])

  useEffect(() => {
    setRowList(createRows)
  }, [rows])

  useEffect(() => {
    if (dialogTitle === 'Transform Row' && inputRef && inputRef.current) inputRef.current.focus()
  }, [columnInput])

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
              <input
                type="text"
                value={filters[i._id]}
                onChange={(e) =>
                  setFilters(val => ({ ...val, [i._id]: e.target.value }))
                }
              />
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

  const filteredRows = useMemo(() => {
    return rowList.filter((r: any) => {
      let flag = true
      columns.forEach(col => {
        if (r[col._id] && filters[col._id]) {
          if (!r[col._id].toString().includes(filters[col._id])) {
            flag = false
          }
        } else if (!r[col._id] && filters[col._id] && filters[col._id] !== '') {
          flag = false
        }
      })
      if (flag) return r
    })
  }, [rowList, filters])

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
      onChangeSuccess()
      onRefresh()
    } else {
      message.error(res.message)
    }
    setOpen(false)
  }

  // right click rows
  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    setCurrentRow(row)
    show(e)
  }

  // show dialog
  const handleShowDialog = (type: string) => {
    setAnchorColPopoverEl(null)
    if (type === 'rename') {
      setDialogTitle('Rename Column')
      setDialogText('Please enter a column name.')
      setInputTitle('Column Name')
      setColumnInput(currentCol.name)
      setInputState({ error: false, helperText: '' })
    } else if (type === 'add left' || type === 'add right') {
      setDialogTitle(`Add Column to the ${type === 'add left' ? 'Left' : 'Right'}`)
      setDialogText('Please enter a column name.')
      setInputTitle('Column Name')
      setColumnInput('')
      setInputState({ error: false, helperText: '' })
    } else if (type === 'combine col') {
      setDialogTitle('Combine Columns')
      setDialogText('Please select a column to combine.')
      setSelectedCol('')
      setSelectColState({ error: false, helperText: '' })
    } else if (type === 'split col') {
      setDialogTitle('Separate Column')
      setDialogText('Please enter a delimiter.')
      setInputTitle('Delimiter')
      setColumnInput('')
      setInputState({ error: false, helperText: '' })
    } else if (type === 'transform col' || type === 'transform row') {
      setDialogTitle(`Transform ${type === 'transform col' ? 'Column' : 'Row'}`)
      setDialogText('Please enter a JavaScript expression.')
      setInputTitle('Expression')
      setColumnInput('val')
      setInputState({ error: false, helperText: '' })
    }
    setIsDialogOpen(true)
  }

  // col name input
  const handleChangeColInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnInput(event.target.value)
    if (dialogTitle === 'Transform Row' || dialogTitle === 'Transform Column') {
      if (inputState.error && event.target.value.length > 0 && inputState.error && event.target.value.length < 26) {
        if (!columnInput.includes('return') && !columnInput.includes('for') &&
        !columnInput.includes('while') && !columnInput.includes('function')) {
          setInputState({ error: false, helperText: '' })
        }
      }
    } else {
      if (inputState.error && event.target.value.length > 0) {
        setInputState({ error: false, helperText: '' })
      }
    }
  }

  const handleValidColInput = () => {
    if (dialogTitle === 'Transform Row' || dialogTitle === 'Transform Column') {
      if (columnInput.trim().length === 0 || columnInput.trim().length > 25) {
        setInputState({ error: true, helperText: 'Expression must be 0 - 25 characters.' })
      } else if (columnInput.includes('return') || columnInput.includes('for') ||
      columnInput.includes('while') || columnInput.includes('function')) {
        setInputState({ error: true, helperText: 'Invalid expression.' })
      }
    } else {
      if (columnInput.trim().length === 0) {
        if (dialogTitle !== 'Separate Column') {
          setInputState({ error: true, helperText: 'Column name is required.' })
        } else {
          setInputState({ error: true, helperText: 'Delimiter is required.' })
        }
        return false
      }
    }
    return true
  }

  // click save in dialog
  const handleClickSave = async () => {
    let res = undefined
    setOpen(true)
    if (dialogTitle === 'Rename Column' || dialogTitle === 'Add Column to the Left' || dialogTitle === 'Add Column to the Right') {
      if (handleValidColInput()) {
        if (dialogTitle === 'Rename Column') {
          res = await reqRenameCol(userId, projectId, datasetId, currentCol._id, currentCol.name, columnInput)
        } else {
          const dir = dialogTitle === 'Add Column to the Left' ? 'left' : 'right'
          res = await reqAddCol(userId, projectId, datasetId, currentCol._id, dir, columnInput)
        }
      }
    } else if (dialogTitle === 'Combine Columns') {
      if (handleValidColSelect()) {
        res = await reqCombineCol(userId, projectId, datasetId, currentCol._id, selectedCol)
      }
    } else if (dialogTitle === 'Separate Column') {
      if (handleValidColInput()) {
        res = await reqSplitCol(userId, projectId, datasetId, currentCol._id, columnInput)
      }
    } else if (dialogTitle === 'Transform Row') {
      if (handleValidColInput()) {
        try {
          const rowInfo = { row: {} as { [key: string]: string }, _id: '' }
          rowInfo._id = currentRow._id
          Object.keys(currentRow).map(r => {
            if (r !== '_id') {
              rowInfo.row[r] = handleInterpret(currentRow[r], columnInput)
            }
            return null
          })
          res = await reqTransformRow(userId, projectId, datasetId, rowInfo._id, rowInfo.row)
        } catch (e) {
          message.error('Transform data error!')
        }
      }
    }  else if (dialogTitle === 'Transform Column') {
      if (handleValidColInput()) {
        try {
          const col_id = currentCol._id
          const rows = [] as { _id: string, val: string }[]
          rowList.forEach((r: any) => {
            rows.push({ _id: r._id, val: handleInterpret(r[col_id], columnInput) })
          })
          res = await reqTransformCol(userId, projectId, datasetId, currentCol._id, rows)
        } catch (e) {
          message.error('Transform data error!')
        }
      }
    }
    if (res && res.code === 200) {
      setIsDialogOpen(false)
      onChangeSuccess()
      onRefresh()
    } else if (res) {
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
    if (type === 'col') {
      setConfirmText('Are you sure to delete this col?')
    } else if (type === 'row') {
      setConfirmText('Are you sure to delete this row?')
    } else if (type === 'multi row') {
      setConfirmText('Are you sure to delete the selected rows?')
    } else if (type === 'combine row') {
      setConfirmText('Are you sure to combine the selected rows?')
    }
  }

  const handleConfirm = async () => {
    let res = undefined
    setOpen(true)
    setIsConfirmOpen(false)
    if (confirmType === 'col') {
      res = await reqDeleteCol(userId, projectId, datasetId, currentCol._id, currentCol.name)
    } else if (confirmType === 'row') {
      res = await reqDeleteRow(userId, projectId, datasetId, [currentRow._id])
    } else if (confirmType === 'multi row') {
      res = await reqDeleteRow(userId, projectId, datasetId, Array.from(selectedRows))
    } else if (confirmType === 'combine row') {
      res = await reqCombineRow(userId, projectId, datasetId, Array.from(selectedRows))
    }
    if (res && res.code === 200) {
      onChangeSuccess()
      onRefresh()
      setSelectedRows(() => new Set())
    } else if (res) {
      message.error(res.message)
    }
    setOpen(false)
  }

  // column select
  const handleChangeColSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCol(event.target.value as string)
    setSelectColState({ error: false, helperText: '' })
  }

  const handleValidColSelect = () => {
    if (selectedCol.trim().length === 0) {
      setSelectColState({ error: true, helperText: 'Selected column is required.' })
      return false
    }
    return true
  }

  // run expression in js-interpreter
  const handleInterpret = (val: any, expression: string) => {
    const myInterpreter = new Interpreter(`var val = "${val}"; ${expression};`)
    myInterpreter.run()
    return myInterpreter.value
  }

  return (
    <div>
      <DataGrid
        headerRowHeight={70}
        columns={colList}
        rows={filteredRows}
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
            <ListItemText primary="Transform column" onClick={() => handleShowDialog('transform col')} />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Separate column" onClick={() => handleShowDialog('split col')} />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Combine columns" onClick={() => handleShowDialog('combine col')} />
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
            <ListItemText primary="Transform row" onClick={() => handleShowDialog('transform row')} />
          </ListItem>
          <ListItem button disabled={selectedRows.size <= 1}>
            <ListItemText primary="Combine rows" onClick={() => handleOpenConfirm('combine row')} />
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
        {dialogTitle === 'Combine Columns' ? 
          (
            <FormControl variant="outlined" fullWidth error={selectColState.error}>
              <InputLabel>Column Name</InputLabel>
              <Select
                value={selectedCol}
                onChange={handleChangeColSelect}
                label="Column Name"
              >
                {
                  columns.map(col => {
                    if (currentCol && col._id !== currentCol._id) {
                      return (<MenuItem value={col._id}>{col.name}</MenuItem>)
                    }
                    return null
                  })
                }
              </Select>
              <FormHelperText>{selectColState.helperText}</FormHelperText>
            </FormControl>
          ) :
          (
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              key={inputTitle}
              label={inputTitle}
              error={inputState.error}
              helperText={inputState.helperText}
              onChange={handleChangeColInput}
              onBlur={handleValidColInput}
              inputRef={inputRef}
              value={columnInput}
            />
          )
        }
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
      content={confirmText}
      handleClose={() => setIsConfirmOpen(false)}
      handleConfirm={handleConfirm}
    />
    </div>
  );
};

export default Table;
import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

import message from '../../components/Message';
import { reqSplitByCol, reqSplitByRow } from '../../api/dataset';

interface dataset {
  _id: string,
  name: string,
  rows: number,
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

interface column {
  _id: string,
  name: string
}

interface separateProps {
  userId: string,
  projectId: string,
  isDialogOpen: boolean,
  title: string,
  currentDataset: dataset | undefined,
  handleClose: () => void,
  handleRefresh: () => void
}

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    marginRight: theme.spacing(2),
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 200,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

function not(a: column[], b: column[]) {
  return a.filter((value) => (b.some(c => c._id === value._id) === false))
}

function intersection(a: column[], b: column[]) {
  return a.filter((value) => b.some(c => c._id === value._id))
}

function union(a: column[], b: column[]) {
  return [...a, ...not(b, a)]
}

const SeparateDialog: React.FC<separateProps> = props => {
  const classes = useStyles()
  const { userId, projectId, currentDataset, isDialogOpen, title, handleClose, handleRefresh } = props
  const [isLoading, setIsLoading] = useState(false)
  // split col transfer
  const [checked, setChecked] = useState<column[]>([])
  const [left, setLeft] = useState<column[]>([])
  const [right, setRight] = useState<column[]>([])
  // select
  const [columnSelect, setColumnSelect] = useState('')
  const [selectState, setSelectState] = useState({ error: false, helperText: '' })

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)

  useEffect(() => {
    if (isDialogOpen) {
      if (title === 'Split By Columns' && currentDataset) {
        setLeft(currentDataset.columns)
        setRight([])
        setChecked([])
      } else {
        setColumnSelect('')
      }
    }
  }, [isDialogOpen])

  const handleToggle = (value: column) => () => {
    let currentIndex = -1
    checked.some((c, idx) => {
      if (c._id === value._id) {
        currentIndex = idx
        return true
      }
      return false
    })
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
  }

  const numberOfChecked = (items: column[]) => intersection(checked, items).length

  const handleToggleAll = (items: column[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items))
    } else {
      setChecked(union(checked, items))
    }
  }

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked))
    setLeft(not(left, leftChecked))
    setChecked(not(checked, leftChecked))
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(not(right, rightChecked))
    setChecked(not(checked, rightChecked))
  }

  // change select
  const handleChangeColumnSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setColumnSelect(event.target.value as string)
    setSelectState({ error: false, helperText: '' })
  }

  const handleValidColumnSelect = () => {
    if (columnSelect.length === 0) {
      setSelectState({ error: true, helperText: 'Please select a column.' })
      return false
    }
    return true
  }

  // click save button
  const handleClickSave = async () => {
    setIsLoading(true)
    let res = undefined
    if (title === 'Split By Columns') {
      if (right.length === 0) {
        message.warning('At least one column should be selected!')
      } else {
        res = await reqSplitByCol(userId, projectId, currentDataset!._id, right)
      }
    } else {
      if (handleValidColumnSelect()) {
        res = await reqSplitByRow(userId, projectId, currentDataset!._id, columnSelect)
      }
    }
    if (res && res.code === 200) {
      handleClose()
      handleRefresh()
    } else if (res && res.message) {
      message.error(res.message)
    }
    setIsLoading(false)
  }

  const customList = (title: React.ReactNode, items: column[]) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value: column) => {
          const labelId = `transfer-list-all-item-${value._id}-label`

          return (
            <ListItem key={value._id} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.name} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Dialog onClose={handleClose} open={isDialogOpen} fullWidth maxWidth="sm">
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {
          title === 'Split By Columns' ? 
          (
            <Grid
              container
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography gutterBottom>Please select the columns you want to split into another table.</Typography>
              </Grid>
              <Grid item>{customList('Choices', left)}</Grid>
              <Grid item>
                <Grid container direction="column" alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    className={classes.button}
                    onClick={handleCheckedRight}
                    disabled={leftChecked.length === 0}
                    aria-label="move selected right"
                  >
                    &gt;
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    className={classes.button}
                    onClick={handleCheckedLeft}
                    disabled={rightChecked.length === 0}
                    aria-label="move selected left"
                  >
                    &lt;
                  </Button>
                </Grid>
              </Grid>
              <Grid item>{customList('Chosen', right)}</Grid>
            </Grid>
          ) :
          (
            <>
              <Typography gutterBottom>Please select a column for grouping.</Typography>
              <FormControl variant="outlined" fullWidth error={selectState.error} required>
                <InputLabel>Column Name</InputLabel>
                <Select
                  value={columnSelect}
                  onChange={handleChangeColumnSelect}
                  label="Dataset Name"
                >
                  {
                    currentDataset?.columns.map(i => (
                      <MenuItem value={i._id}>{i.name}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText>{selectState.helperText}</FormHelperText>
              </FormControl>
            </>
          )
        }
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button color="primary" disabled={isLoading} onClick={handleClickSave}>
          {isLoading && <CircularProgress className={classes.circularProgress} size={15} />}
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeparateDialog;
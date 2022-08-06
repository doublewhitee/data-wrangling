import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

import message from '../../components/Message';
import { reqUnion, reqInnerJoin, reqOuterJoin } from '../../api/dataset';

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

interface unionJoinProps {
  userId: string,
  projectId: string,
  isDialogOpen: boolean,
  title: string,
  datasetList: dataset[] | undefined,
  currentDataset: dataset | undefined,
  handleClose: () => void,
  handleRefresh: () => void
}

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    marginRight: theme.spacing(2),
  },
}));

const UnionJoinDialog: React.FC<unionJoinProps> = props => {
  const classes = useStyles()
  const { userId, projectId, datasetList, currentDataset, isDialogOpen, title, handleClose, handleRefresh } = props
  const [isLoading, setIsLoading] = useState(false)
  const [datasetSelect, setDatasetSelect] = useState('')
  const [leftColumnSelect, setLeftColumnSelect] = useState('')
  const [rightColumnSelect, setRightColumnSelect] = useState('')
  const [selectState, setSelectState] = useState({
    dataset: { error: false, helperText: '' },
    leftCol: { error: false, helperText: '' },
    rightCol: { error: false, helperText: '' },
  })
  const [activeStep, setActiveStep] = React.useState(0)

  useEffect(() => {
    if (isDialogOpen) {
      setDatasetSelect('')
      setLeftColumnSelect('')
      setRightColumnSelect('')
      setSelectState({
        dataset: { error: false, helperText: '' },
        leftCol: { error: false, helperText: '' },
        rightCol: { error: false, helperText: '' },
      })
      setActiveStep(0)
    }
  }, [isDialogOpen])

  // get menu item for union operation
  const getUnionMenuItem = () => {
    if (datasetList && currentDataset) {
      const currentColNames: string[] = []
      currentDataset.columns.forEach(d => currentColNames.push(d.name))
      return datasetList.map(d => {
        if (d._id !== currentDataset._id) {
          let flag = true
          if (d.columns.length === currentDataset.columns.length) {
            for (let i = 0; i < d.columns.length; i++) {
              if (!currentColNames.includes(d.columns[i].name)) {
                flag = false
                break
              }
            }
          } else flag = false
          if (flag) return (
            <MenuItem value={d._id}>{d.name}</MenuItem>
          )
        }
        return null
      })
    } else return null
  }

  // get menu item for join operation
  const getJoinMenuItem = () => {
    if (datasetList && currentDataset) {
      const currentColNames: string[] = []
      currentDataset.columns.forEach(d => currentColNames.push(d.name))
      return datasetList.map(d => {
        if (d._id !== currentDataset._id) {
          return (
            <MenuItem value={d._id}>{d.name}</MenuItem>
          )
        }
        return null
      })
    } else return null
  }

  const getRightColMenuItem = () => {
    if (datasetList && datasetSelect.length !== 0) {
      const target = datasetList.find(d => d._id === datasetSelect)
      if (target) {
        return target.columns.map(d => (<MenuItem value={d._id}>{d.name}</MenuItem>))
      }  else return null
    } else return null
  }

  // change dataset select
  const handleChangeDatasetSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDatasetSelect(event.target.value as string)
    setSelectState(val => ({ ...val, dataset: { error: false, helperText: '' } }))
  }

  const handleValidDatasetSelect = () => {
    if (datasetSelect.length === 0) {
      setSelectState(val => ({ ...val, dataset: { error: true, helperText: 'Please select a dataset.' } }))
      return false
    }
    return true
  }

  // change left column select
  const handleChangeLeftColumn = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLeftColumnSelect(event.target.value as string)
    setSelectState(val => ({ ...val, leftCol: { error: false, helperText: '' } }))
  }

  const handleValidLeftColSelect = () => {
    if (leftColumnSelect.length === 0) {
      setSelectState(val => ({ ...val, leftCol: { error: true, helperText: 'Please select a key column.' } }))
      return false
    }
    return true
  }

  // change right column select
  const handleChangeRightColumn = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRightColumnSelect(event.target.value as string)
    setSelectState(val => ({ ...val, rightCol: { error: false, helperText: '' } }))
  }

  const handleValidRightColSelect = () => {
    if (rightColumnSelect.length === 0) {
      setSelectState(val => ({ ...val, rightCol: { error: true, helperText: 'Please select a key column.' } }))
      return false
    }
    return true
  }

  const handleNext = () => {
    if (handleValidDatasetSelect()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleClickSave = async () => {
    let res = undefined
    setIsLoading(true)
    if (title === 'Union') {
      if (handleValidDatasetSelect()) {
        res = await reqUnion(userId, projectId, currentDataset!._id, datasetSelect)
      }
    } else if (title === 'Inner Join') {
      if (handleValidLeftColSelect() && handleValidRightColSelect()) {
        res = await reqInnerJoin(userId, projectId, currentDataset!._id, datasetSelect, leftColumnSelect, rightColumnSelect)
      }
    } else if (title === 'Outer Join') {
      if (handleValidLeftColSelect() && handleValidRightColSelect()) {
        res = await reqOuterJoin(userId, projectId, currentDataset!._id, datasetSelect, leftColumnSelect, rightColumnSelect)
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

  return (
    <Dialog onClose={handleClose} open={isDialogOpen} fullWidth maxWidth="sm">
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {
          title === 'Union' ?
          (
            <>
              <Typography gutterBottom>Please select a dataset to union.</Typography>
              <FormControl variant="outlined" fullWidth error={selectState.dataset.error} required>
                <InputLabel>Dataset Name</InputLabel>
                <Select
                  value={datasetSelect}
                  onChange={handleChangeDatasetSelect}
                  label="Dataset Name"
                >
                  {getUnionMenuItem()}
                </Select>
                <FormHelperText>{selectState.dataset.helperText}</FormHelperText>
              </FormControl>
            </>
          ) :
          (
            <>
              <Stepper activeStep={activeStep}>
                <Step key="action">
                  <StepLabel>Select a dataset</StepLabel>
                </Step>
                <Step key="bction">
                  <StepLabel>Select target columns</StepLabel>
                </Step>
              </Stepper>
              {
                activeStep === 0 ?
                (
                  <FormControl variant="outlined" fullWidth error={selectState.dataset.error} required>
                    <InputLabel>Dataset Name</InputLabel>
                    <Select
                      value={datasetSelect}
                      onChange={handleChangeDatasetSelect}
                      label="Dataset Name"
                    >
                      {getJoinMenuItem()}
                    </Select>
                    <FormHelperText>{selectState.dataset.helperText}</FormHelperText>
                  </FormControl>
                ) :
                (
                  <>
                    <FormControl variant="outlined" fullWidth error={selectState.leftCol.error} required>
                      <InputLabel>Column 1</InputLabel>
                      <Select
                        value={leftColumnSelect}
                        onChange={handleChangeLeftColumn}
                        label="Column 1"
                      >
                        {
                          currentDataset ?
                          currentDataset.columns.map(col => <MenuItem value={col._id}>{col.name}</MenuItem>) :
                          ''
                        }
                      </Select>
                      <FormHelperText>{selectState.leftCol.helperText}</FormHelperText>
                    </FormControl>

                    <FormControl variant="outlined" fullWidth error={selectState.rightCol.error} required>
                      <InputLabel>Column 2</InputLabel>
                      <Select
                        value={rightColumnSelect}
                        onChange={handleChangeRightColumn}
                        label="Column 2"
                      >
                        {getRightColMenuItem()}
                      </Select>
                      <FormHelperText>{selectState.rightCol.helperText}</FormHelperText>
                    </FormControl>
                  </>
                )
              }
            </>
          )
        }
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        {
          (title !== 'Union' && activeStep !== 0) && (
            <Button color="primary" disabled={isLoading} onClick={()=> setActiveStep((prevActiveStep) => prevActiveStep - 1)}>
              Back
            </Button>
          )
        }
        {
          (title !== 'Union' && activeStep === 0) && (
            <Button color="primary" disabled={isLoading} onClick={handleNext}>
              Next
            </Button>
          )
        }
        {
          (title === 'Union' || activeStep !== 0) && (
            <Button color="primary" disabled={isLoading} onClick={handleClickSave}>
              {isLoading && <CircularProgress className={classes.circularProgress} size={15} />}
              Save
            </Button>
          )
        }
      </DialogActions>
    </Dialog>
  );
};

export default UnionJoinDialog;
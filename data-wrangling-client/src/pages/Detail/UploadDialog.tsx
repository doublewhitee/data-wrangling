import React, { useState, useRef, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import message from '../../components/Message';
import datasetImg from '../../assets/dataset_lg.png';

import { reqImportDataset } from '../../api/dataset';

interface uploadDialogProps {
  projectId: string,
  userId: string,
  isDialogOpen: boolean,
  handleClose: () => void,
  refresh: () => void
}

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    marginRight: theme.spacing(2),
  },
  dropArea: {
    marginTop: theme.spacing(1),
    minHeight: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.palette.grey[400],
    borderRadius: 20,
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'center',
  },
  dropAreaContent: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%'
  },
  datasetImg: {
    height: 80,
  },
}));

const UploadDialog: React.FC<uploadDialogProps> = props => {
  const classes = useStyles()
  // input file
  const inputFile = useRef() as React.MutableRefObject<HTMLInputElement>
  const { projectId, userId, isDialogOpen, refresh, handleClose } = props
  // dialogLoading
  const [dialogLoading, setDialogLoading] = useState(false)
  // current file
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  useEffect(() => {
    if (isDialogOpen) {
      setCurrentFile(null)
    }
  }, [isDialogOpen])

  // click choose file button
  const handleChooseFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    // clear selected file
    inputFile.current.value = ''
    inputFile.current.click()
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files!.length > 0) {
      setCurrentFile(event.target.files![0])
    }
  }

  // drop area
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    let transfer = e.dataTransfer
    if (transfer && transfer.files) {
      if (transfer.files.length > 0) {
        setCurrentFile(transfer.files[0])
      }
    }
  }

  // import file
  const handleImport = async () => {
    const format = currentFile ? currentFile.name.split('.').pop()!.toLocaleLowerCase() : ''
    if (currentFile && (format === 'csv' || format === 'xlsx')) {
      setDialogLoading(true)
      const formData = new FormData()
      formData.append('file', currentFile)
      const res = await reqImportDataset(formData, projectId, userId)
      if (res && res.code === 200) {
        message.success(res.data)
        refresh()
        handleClose()
      } else {
        message.error(res.message)
      }
      setDialogLoading(false)
    } else {
      message.error('File format not supported.')
      setCurrentFile(null)
    }
  }

  return (
    <Dialog onClose={handleClose} open={isDialogOpen} fullWidth maxWidth="sm">
      <DialogTitle>
        Import Dataset
      </DialogTitle>

      <DialogContent dividers>
        <Typography gutterBottom>
          Upload dataset from your computer. Supported file formats: CSV, XLSX.
        </Typography>
        <div
          className={classes.dropArea}
          onClick={handleChooseFile}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDragDrop}
        >
          {
            currentFile === null ?
            <div className={classes.dropAreaContent}>
              <Typography gutterBottom>
                Drag and drop files here or
              </Typography>
              <Button onClick={handleChooseFile} color="primary" variant="contained">
                Choose a file
              </Button>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ref={inputFile}
                onChange={handleChangeInput}
                style={{ display: 'none' }}
              />
            </div> :
            <div className={classes.dropAreaContent}>
              <img src={datasetImg} alt="img" className={classes.datasetImg} />
              <Typography gutterBottom>
                {currentFile ? currentFile.name : ''}
              </Typography>
              <Button onClick={() => setCurrentFile(null)} color="secondary" variant="outlined">
                Delete
              </Button>
            </div>
          }
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button color="primary" disabled={dialogLoading || currentFile === null} onClick={handleImport}>
          {dialogLoading && <CircularProgress className={classes.circularProgress} size={15} />}
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
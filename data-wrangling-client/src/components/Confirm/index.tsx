import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

interface confirmProps {
  isDialogOpen: boolean,
  content: string,
  handleClose: () => void,
  handleConfirm: () => void
}

const Confirm: React.FC<confirmProps> = props => {
  const { isDialogOpen, content, handleClose, handleConfirm } = props

  return (
    <Dialog onClose={handleClose} open={isDialogOpen}>
      <DialogTitle>
        Confirm
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          {content}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirm;
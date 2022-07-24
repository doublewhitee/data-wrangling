import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

interface messageProps {
  content: string,
  duration: number,
  type: 'error' | 'warning' | 'info' | 'success',
  vertical: 'top' | 'bottom',
  horizontal: 'left' | 'center' | 'right'
}

const Message: React.FC<messageProps> = (props) => {
  const { content, duration, type, vertical, horizontal } = props
  const [open, setOpen] = useState(true)

  const handleOnClose = () => {
    setOpen(false)
  }

  return (
    <Snackbar
      autoHideDuration={duration}
      anchorOrigin={{ vertical, horizontal }}
      onClose={handleOnClose}
      open={open}
    >
      <MuiAlert severity={type} elevation={6}>
        {content}
      </MuiAlert>
    </Snackbar>
  );
};

const message = {
  success (content: string,
    duration: number = 2000,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'center'
  ) {
      const div = document.createElement('div')
      const JSXdom = (<Message content={content} duration={duration} type='success' vertical={vertical} horizontal={horizontal} />)
      createRoot(div).render(JSXdom)
      document.body.appendChild(div)
  },
  error (content: string,
    duration: number = 2000,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'center'
  ) {
      const div = document.createElement('div')
      const JSXdom = (<Message content={content} duration={duration} type='error' vertical={vertical} horizontal={horizontal} />)
      createRoot(div).render(JSXdom)
      document.body.appendChild(div)
  },
  warning (content: string,
    duration: number = 2000,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'center'
  ) {
      const div = document.createElement('div')
      const JSXdom = (<Message content={content} duration={duration} type='warning' vertical={vertical} horizontal={horizontal} />)
      createRoot(div).render(JSXdom)
      document.body.appendChild(div)
  },
  info (content: string,
    duration: number = 2000,
    vertical: 'top' | 'bottom' = 'top',
    horizontal: 'left' | 'center' | 'right' = 'center'
  ) {
      const div = document.createElement('div')
      const JSXdom = (<Message content={content} duration={duration} type='info' vertical={vertical} horizontal={horizontal} />)
      createRoot(div).render(JSXdom)
      document.body.appendChild(div)
  },
};

export default message;
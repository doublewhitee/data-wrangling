import React, { MouseEventHandler, useState } from 'react';
import PubSub from 'pubsub-js';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, Theme } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

interface signinProps {
  handleSwitchState: MouseEventHandler,
  loading: boolean
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  circularProgress: {
    marginLeft: 0,
    marginRight: theme.spacing(2),
  },
}))

const SignIn: React.FC<signinProps> = props => {
  const classes = useStyles()
  const { handleSwitchState, loading } = props
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: true
  })
  const [formState, setFormState] = useState({
    email: { error: false, helperText: '' },
    password: { error: false, helperText: '' }
  })

  // Email
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    setLoginForm(val => ({ ...val, email: event.target.value }))
    if (formState.email.error && regex.test(event.target.value)) {
      setFormState(val => ({ ...val, email: {error: false, helperText: ''} }))
    }
  }

  const handleValidEmail = () => {
    const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (!regex.test(loginForm.email)) {
      if (loginForm.email.length === 0) {
        setFormState(val => ({ ...val, email: {error: true, helperText: 'Email is required.'} }))
      } else {
        setFormState(val => ({ ...val, email: {error: true, helperText: 'Please enter a valid email address.'} }))
      }
      return false
    }
    return true
  }

  // Password
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(val => ({ ...val, password: event.target.value }))
    if (formState.password.error && event.target.value.length >= 6 && event.target.value.length <= 16) {
      setFormState(val => ({ ...val, password: {error: false, helperText: ''} }))
    }
  }

  const handleValidPassword = () => {
    if (loginForm.password.length < 6 || loginForm.password.length > 16) {
      setFormState(val => ({ ...val, password: {error: true, helperText: 'Password must be 6 - 16 characters.'} }))
      return false
    }
    return true
  }

  // remember
  const handleChangeCheckBox = () => {
    const state = loginForm.remember
    setLoginForm(val => ({ ...val, remember: !state }))
  }

  const handleLogin = () => {
    // validate
    if (handleValidEmail() && handleValidPassword()) {
      PubSub.publish('loginForm', loginForm)
    }
  }

  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign In
      </Typography>
      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          error={formState.email.error}
          helperText={formState.email.helperText}
          onChange={handleChangeEmail}
          onBlur={handleValidEmail}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={formState.password.error}
          helperText={formState.password.helperText}
          onChange={handleChangePassword}
          onBlur={handleValidPassword}
        />
        <FormControlLabel
          control={<Checkbox color="primary" checked={loginForm.remember} onChange={handleChangeCheckBox} />}
          label="Remember me"
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading && <CircularProgress className={classes.circularProgress} size={20} />}
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" variant="body2" onClick={handleSwitchState}>
              {"Don't have an account? Sign up"}
            </Link>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default SignIn;
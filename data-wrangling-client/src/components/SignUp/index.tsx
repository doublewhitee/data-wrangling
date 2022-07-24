import React, { MouseEventHandler, useState } from 'react';
import PubSub from 'pubsub-js';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

interface signupProps {
  handleSwitchState: MouseEventHandler,
  loading: boolean
}

const useStyles = makeStyles((theme) => ({
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  circularProgress: {
    marginLeft: 0,
    marginRight: theme.spacing(2),
  },
}))

const SignUp: React.FC<signupProps> = props => {
  const classes = useStyles()
  const { handleSwitchState, loading } = props
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [formState, setFormState] = useState({
    firstName: { error: false, helperText: '' },
    lastName: { error: false, helperText: '' },
    email: { error: false, helperText: '' },
    password: { error: false, helperText: '' }
  })

  // First Name
  const handleChangeFname = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(val => ({ ...val, firstName: event.target.value }))
    if (formState.firstName.error && event.target.value.length > 0) {
      setFormState(val => ({ ...val, firstName: {error: false, helperText: ''} }))
    }
  }

  const handleValidFname = () => {
    if (registerForm.firstName.length === 0) {
      setFormState(val => ({ ...val, firstName: {error: true, helperText: 'First name is required.'} }))
      return false
    }
    return true
  }

  // Last Name
  const handleChangeLname = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(val => ({ ...val, lastName: event.target.value }))
    if (formState.lastName.error && event.target.value.length > 0) {
      setFormState(val => ({ ...val, lastName: {error: false, helperText: ''} }))
    }
  }

  const handleValidLname = () => {
    if (registerForm.lastName.length === 0) {
      setFormState(val => ({ ...val, lastName: {error: true, helperText: 'Last name is required.'} }))
      return false
    }
    return true
  }

  // Email
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    setRegisterForm(val => ({ ...val, email: event.target.value }))
    if (formState.email.error && regex.test(event.target.value)) {
      setFormState(val => ({ ...val, email: {error: false, helperText: ''} }))
    }
  }

  const handleValidEmail = () => {
    const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (!regex.test(registerForm.email)) {
      if (registerForm.email.length === 0) {
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
    setRegisterForm(val => ({ ...val, password: event.target.value }))
    if (formState.password.error && event.target.value.length >= 6 && event.target.value.length <= 16) {
      setFormState(val => ({ ...val, password: {error: false, helperText: ''} }))
    }
  }

  const handleValidPassword = () => {
    if (registerForm.password.length < 6 || registerForm.password.length > 16) {
      setFormState(val => ({ ...val, password: {error: true, helperText: 'Password must be 6 - 16 characters.'} }))
      return false
    }
    return true
  }

  const handleSignUp = () => {
    // validate
    if (handleValidFname() && handleValidLname() && handleValidEmail() && handleValidPassword()) {
      PubSub.publish('registerForm', registerForm)
    }
  }

  return (
    <div className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign Up
      </Typography>
      <form className={classes.form} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              autoComplete="fname"
              name="firstName"
              variant="outlined"
              required
              fullWidth
              label="First Name"
              autoFocus
              value={registerForm.firstName}
              error={formState.firstName.error}
              helperText={formState.firstName.helperText}
              onChange={handleChangeFname}
              onBlur={handleValidFname}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={registerForm.lastName}
              autoComplete="lname"
              error={formState.lastName.error}
              helperText={formState.lastName.helperText}
              onChange={handleChangeLname}
              onBlur={handleValidLname}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              label="Email Address"
              name="email"
              value={registerForm.email}
              autoComplete="email"
              error={formState.email.error}
              helperText={formState.email.helperText}
              onChange={handleChangeEmail}
              onBlur={handleValidEmail}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={registerForm.password}
              autoComplete="current-password"
              error={formState.password.error}
              helperText={formState.password.helperText}
              onChange={handleChangePassword}
              onBlur={handleValidPassword}
            />
          </Grid>
        </Grid>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading && <CircularProgress className={classes.circularProgress} size={20} />}
          Sign Up
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link href="#" variant="body2" onClick={handleSwitchState}>
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export default SignUp;
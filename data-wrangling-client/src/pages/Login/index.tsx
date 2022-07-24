import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import PubSub from 'pubsub-js';
import Cookies from 'js-cookie';

import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';

import { reqRegister, reqLogin } from '../../api/user';
import { encryptAES } from '../../utils/secret';
import message from '../../components/Message';
import { setUserInfo } from '../../redux/reducers/userSlice';
import { useAppDispatch } from '../../redux/hooks';

interface registerForm {
  firstName: string,
  lastName: string,
  email: string,
  password: string
}

interface loginForm {
  email: string,
  password: string,
  remember: boolean
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
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
}));

const Login: React.FC = () => {
  const classes = useStyles()
  const [state, setState] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    PubSub.subscribe('registerForm', handleRegister)
    PubSub.subscribe('loginForm', handleLogin)
    return () => {
      PubSub.unsubscribe('registerForm')
      PubSub.unsubscribe('loginForm')
    }
  })

  const handleRegister = async (_: string, data: registerForm) => {
    setLoading(true)
    const res = await reqRegister(data.firstName, data.lastName, data.email, encryptAES(data.password))
    if (res && res.code === 200) {
      message.success('Registration Successful!')
      // go to login page
      setState('login')
    } else {
      message.error(res.message)
    }
    setLoading(false)
  }

  const handleLogin = async (_: string, data: loginForm) => {
    setLoading(true)
    const res = await reqLogin(data.email, encryptAES(data.password))
    if (res && res.code === 200) {
      // set Redux state
      dispatch(setUserInfo(res.data))
      // set cookie
      Cookies.set('token', res.token, data.remember ? { expires: 7 } : undefined)
      navigate('/project', { replace: true })
    } else {
      message.error(res.message)
    }
    setLoading(false)
  }

  return (
    <Fragment>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          {state === 'login'
            ? <SignIn handleSwitchState={() => setState('register')} loading={loading} />
            : <SignUp handleSwitchState={() => setState('login')} loading={loading} />
          }
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default Login;
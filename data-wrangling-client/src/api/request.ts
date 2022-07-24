import axios from 'axios';
import Cookies from 'js-cookie';
import store from '../redux/store';
import { clearUserInfo } from '../redux/reducers/userSlice';

export function request(config: object) {
  const instance = axios.create({
    baseURL: 'http://localhost:5050/',
    timeout: 10000
  })

  instance.interceptors.request.use(config => {
    if (config.url !== '/user/login' && config.url !== '/user/register') {
      const token = Cookies.get('token')
      config.headers!.token = token!
    }
    return config
  })

  instance.interceptors.response.use(res => {
    if (res.data && res.data.code === 401) {
      Cookies.remove('token')
      store.dispatch(clearUserInfo())
      window.location.replace('/start')
    }
    return res.data
  }, err => err)

  return instance(config)
}

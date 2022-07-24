import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import Login from './pages/Login';
import NotFound from './pages/404/NotFound';
import Layout from './pages/Layout';

import { reqUserInfo } from './api/user';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setUserInfo } from './redux/reducers/userSlice';
import message from './components/Message';

const App: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.user._id)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user === '') {
      const token = Cookies.get('token')
      // no token info, go to login page
      if (!token) {
        if (location.pathname !== '/start') {
          navigate('/start', { replace: true })
        }
      } else {
        // validate token, get user info
        reqUserInfo().then((res: any) => {
          if (res.code === 200) {
            dispatch(setUserInfo(res.data))
            if (location.pathname === '/start') {
              navigate('/project', { replace: true })
            }
          } else {
            message.error(res.message)
          }
        })
      }
    } else {
      if (location.pathname === '/start') {
        navigate('/project', { replace: true })
      }
    }
  }, [location])

  return (
    <div className="App">
      <Routes>
        <Route path="/start" element={<Login />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </div>
  );
}

export default App;

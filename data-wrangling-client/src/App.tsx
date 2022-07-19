import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import NotFound from './pages/404/NotFound';
import Layout from './pages/Layout';

const App: React.FC = () => {
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

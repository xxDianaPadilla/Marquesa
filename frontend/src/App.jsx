import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import VerificationCode from './pages/VerificationCode';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import Saves from './pages/Saves';
import CategoryProducts from './pages/CategoryProducts';
import CategoryProductsPage from './pages/CategoryProductsPage';

function App() {
  return (
    <Register/>
  )
}

export default App;
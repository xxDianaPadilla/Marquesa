import { useState } from 'react'
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import VerificationCode from './pages/VerificationCode';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Dashboard/>
  )
}

export default App

import { useState } from 'react'
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import VerificationCode from './pages/VerificationCode';

function App() {
  const [count, setCount] = useState(0)

  return (
    <VerificationCode/>
  )
}

export default App

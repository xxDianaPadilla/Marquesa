import { useState } from 'react'
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';

function App() {
  const [count, setCount] = useState(0)

  return (
    <RecoverPassword/>
  )
}

export default App

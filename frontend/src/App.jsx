import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar todas las páginas
import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import VerificationCode from './pages/VerificationCode';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import Saves from './pages/MediaManager';
import CategoryProducts from './pages/CategoryProducts';
import CategoryProductsPage from './pages/CategoryProductsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta principal - Home/Catálogo */}
          <Route path="/" element={<CategoryProducts />} />
          
          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/verification-code" element={<VerificationCode />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Rutas del dashboard y funcionalidades */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/saves" element={<Saves />} />
          
          {/* Ruta dinámica para páginas de categorías individuales */}
          <Route path="/categoria/:categoryId" element={<CategoryProductsPage />} />
          
          {/* Ruta de fallback - redirige al home si no encuentra la ruta */}
          <Route path="*" element={<CategoryProducts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
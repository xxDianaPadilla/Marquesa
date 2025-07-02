import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './components/ProtectedRoutes';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import VerificationCode from './pages/VerificationCode';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import Saves from './pages/Saves';
import CategoryProductsPage from './pages/CategoryProductsPage';
import CategoryProducts from './pages/CategoryProducts';
import Profile from './pages/Profile';
import MediaManager from './pages/MediaManager';
import Home from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#4ade80',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Ruta principal - Home/Catálogo */}
          <Route path="/" element={<Home />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/verification-code" element={<VerificationCode />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Rutas del dashboard y funcionalidades */}
          <Route path="/dashboard"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <Dashboard />
              </ProtectedRoutes>
            }
          />

          <Route path="/media"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <MediaManager />
              </ProtectedRoutes>
            }
          />

          <Route path="/saves"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <Saves />
              </ProtectedRoutes>
            }
          />

          <Route path="/categoryProducts"
            element={
                <CategoryProducts />
            }
          />

          {/* Ruta dinámica para páginas de categorías individuales */}
          <Route path="/categoria/:categoryId"
            element={
                <CategoryProductsPage />
            }
          />

          <Route path="/profile"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <Profile />
              </ProtectedRoutes>
            }
          />

          {/* Ruta de fallback - redirige al home si no encuentra la ruta */}
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

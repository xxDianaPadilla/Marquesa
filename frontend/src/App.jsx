/**
 * Componente principal de la aplicación - VERSIÓN CORREGIDA
 * Maneja el enrutamiento principal y la configuración de notificaciones toast
 * Incluye todas las rutas públicas, protegidas y de manejo de errores del sistema
 * 
 * CORRECCIÓN IMPLEMENTADA:
 * - Ahora SÍ muestra páginas de error cuando un usuario autenticado
 *   trata de acceder a áreas prohibidas (ej: cliente → dashboard admin)
 * - Usa ProtectedRoutes con showErrorPages=true por defecto
 * - Mantiene redirecciones limpias para login/logout normales
 * 
 * Ubicación: frontend/src/App.jsx
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes, { StrictProtectedRoutes } from './components/ProtectedRoutes';
import { RouteErrorBoundary } from './components/RouteErrorHandler';
import { Toaster } from 'react-hot-toast';

// Importar todas las páginas principales de la aplicación
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
import OrderDetail from './pages/OrderDetailPage';
import ProductsManager from './pages/ProductsManager';
import SalesManager from './pages/SalesManager';
import CategoriesManager from './pages/CategoriesManager';
import ReviewsManager from './pages/ReviewsManager';
import ShoppingCart from './pages/ShoppingCart';
import ProductDetail from './pages/ProductDetail';
import CustomProducts from './pages/CustomProducts';
import PaymentProcessPage from './pages/PaymentProcessPage';
import MediaPage from './pages/MediaPage';
import RuletaPage from './pages/RuletaPage';
import ConditionsPromotions from './pages/ConditionsPromotions';
import ShippingInformation from './pages/ShippingInformation';
import AboutUs from './pages/AboutUs';
import PrivacyPolicies from './pages/PrivacyPolicies.JSX';
import TermsandConditions from './pages/TermsandConditions';
import MediaDetailPage from './pages/MediaDetailPage';
import CustomProductsManager from './pages/CustomProductsManager';

// Importar el gestor de chat para administradores
import ChatManager from './pages/ChatManager';

// PÁGINAS DE MANEJO DE ERRORES HTTP - Actualizadas con componentes
import BadRequest from './pages/errors/BadRequest';
import Unauthorized from './pages/errors/Unauthorized';
import Forbidden from './pages/errors/Forbidden';
import NotFound from './pages/errors/NotFound';
import Conflict from './pages/errors/Conflict';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Boundary de error para capturar errores de React */}
        <RouteErrorBoundary>
          {/* Configuración de notificaciones toast con estilos personalizados */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#374151',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              // Estilos para notificaciones de éxito
              success: {
                duration: 4000,
                style: {
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: '1px solid #059669',
                  fontWeight: '500',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#10B981',
                },
              },
              // Estilos para notificaciones de error
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: '1px solid #DC2626',
                  fontWeight: '500',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#EF4444',
                },
              },
              // Estilos para notificaciones de carga
              loading: {
                style: {
                  background: '#F3F4F6',
                  color: '#6B7280',
                  border: '1px solid #D1D5DB',
                },
              },
            }}
          />

          <Routes>
            {/* Ruta principal - Home/Catálogo público */}
            <Route path="/" element={<Home />} />

            {/* Rutas de autenticación - acceso público */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover-password" element={<RecoverPassword />} />
            <Route path="/verification-code" element={<VerificationCode />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Rutas públicas de productos y contenido */}
            <Route path="/home" element={<Home />} />
            <Route path="/categoryProducts" element={<CategoryProducts />} />
            <Route path="/categoria/:categoryId" element={<CategoryProductsPage />} />
            <Route path="/ProductDetail" element={<ProductDetail />} />
            <Route path="/ProductDetail/:id" element={<ProductDetail />} />
            <Route path="/mediaPage" element={<MediaPage />} />
            <Route path="/MediaDetailPage/:id" element={<MediaDetailPage />} />
            
            {/* Rutas de información y políticas - acceso público */}
            <Route path="/conditionsPromotions" element={<ConditionsPromotions />} />
            <Route path="/shippingInformation" element={<ShippingInformation />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/privacyPolicies" element={<PrivacyPolicies />} />
            <Route path="/termsandConditions" element={<TermsandConditions />} />

            {/* RUTAS DE MANEJO DE ERRORES HTTP - Acceso directo */}
            <Route path="/error/400" element={<BadRequest />} />
            <Route path="/error/401" element={<Unauthorized />} />
            <Route path="/error/403" element={<Forbidden />} />
            <Route path="/error/404" element={<NotFound />} />
            <Route path="/error/409" element={<Conflict />} />

            {/* 
              RUTAS PROTEGIDAS DEL ADMINISTRADOR 
              CORREGIDO: Usando StrictProtectedRoutes para SIEMPRE mostrar páginas de error
            */}
            <Route 
              path="/dashboard"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <Dashboard />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/media"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <MediaManager />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/products"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <ProductsManager />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/sales"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <SalesManager />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/categories"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <CategoriesManager />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/reviews"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <ReviewsManager />
                </StrictProtectedRoutes>
              }
            />

            {/* Ruta para el gestor de chat - solo administradores */}
            <Route 
              path="/chat"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <ChatManager />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/customProductsMaterials"
              element={
                <StrictProtectedRoutes requiredUserType="admin">
                  <CustomProductsManager />
                </StrictProtectedRoutes>
              }
            />

            {/* 
              RUTAS PROTEGIDAS DEL CLIENTE 
              CORREGIDO: Usando StrictProtectedRoutes para SIEMPRE mostrar páginas de error
            */}
            <Route 
              path="/saves"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <Saves />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/profile"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <Profile />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/orderdetails"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <OrderDetail />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/shoppingCart"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <ShoppingCart />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/customProducts"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <CustomProducts />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/paymentProcess"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <PaymentProcessPage />
                </StrictProtectedRoutes>
              }
            />

            <Route 
              path="/ruleta"
              element={
                <StrictProtectedRoutes requiredUserType="Customer">
                  <RuletaPage />
                </StrictProtectedRoutes>
              }
            />

            {/* Ruta de fallback - redirige a la página 404 personalizada */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </RouteErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
/**
 * Componente principal de la aplicación
 * Maneja el enrutamiento principal y la configuración de notificaciones toast
 * Incluye todas las rutas públicas y protegidas del sistema
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './components/ProtectedRoutes';
import { Toaster } from 'react-hot-toast';

// Importar todas las páginas de la aplicación
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

// Importar el gestor de chat para administradores
import ChatManager from './pages/ChatManager';

function App() {
  return (
    <AuthProvider>
      <Router>
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
          <Route path="/mediaPage" element={<MediaPage />} />
          <Route path="/MediaDetailPage/:id" element={<MediaDetailPage />} />
          
          {/* Rutas de información y políticas - acceso público */}
          <Route path="/conditionsPromotions" element={<ConditionsPromotions />} />
          <Route path="/shippingInformation" element={<ShippingInformation />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/privacyPolicies" element={<PrivacyPolicies />} />
          <Route path="/termsandConditions" element={<TermsandConditions />} />

          {/* Rutas del administrador - solo acceso para usuarios admin */}
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

          <Route path="/products"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <ProductsManager />
              </ProtectedRoutes>
            }
          />

          <Route path="/sales"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <SalesManager />
              </ProtectedRoutes>
            }
          />

          <Route path="/categories"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <CategoriesManager />
              </ProtectedRoutes>
            }
          />

          <Route path="/reviews"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <ReviewsManager />
              </ProtectedRoutes>
            }
          />

          {/* Ruta para el gestor de chat - solo administradores */}
          <Route path="/chat"
            element={
              <ProtectedRoutes requiredUserType="admin">
                <ChatManager />
              </ProtectedRoutes>
            }
          />

          {/* Rutas del cliente - solo acceso para usuarios Customer */}
          <Route path="/saves"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <Saves />
              </ProtectedRoutes>
            }
          />

          <Route path="/profile"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <Profile />
              </ProtectedRoutes>
            }
          />

          <Route path="/orderdetails"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <OrderDetail />
              </ProtectedRoutes>
            }
          />

          <Route path="/shoppingCart"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <ShoppingCart />
              </ProtectedRoutes>
            }
          />

          <Route path="/customProducts"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <CustomProducts />
              </ProtectedRoutes>
            }
          />

          <Route path="/paymentProcess"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <PaymentProcessPage />
              </ProtectedRoutes>
            }
          />

          <Route path="/ruleta"
            element={
              <ProtectedRoutes requiredUserType="Customer">
                <RuletaPage />
              </ProtectedRoutes>
            } />

          {/* Ruta de fallback - redirige al login si no encuentra la ruta */}
          <Route path='*' element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
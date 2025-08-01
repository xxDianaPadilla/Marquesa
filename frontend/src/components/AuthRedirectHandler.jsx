/**
 * Componente AuthRedirectHandler - Maneja redirecciones de autenticación
 * 
 * Funcionalidades principales:
 * - Evita redirecciones a páginas de error durante login/logout
 * - Maneja transiciones limpias entre estados de autenticación
 * - Proporciona redirecciones inteligentes post-login
 * - Centraliza la lógica de navegación de autenticación
 * 
 * Ubicación: frontend/src/components/AuthRedirectHandler.jsx
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para manejar redirecciones post-login/logout
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading, isLoggingOut } = useAuth();

  /**
   * Redirige al usuario después de un login exitoso
   */
  const redirectAfterLogin = React.useCallback(() => {
    if (!isAuthenticated || !user || loading) return;

    console.log('Redirigiendo después de login exitoso...');

    // Obtener la ruta de destino desde el state (donde estaba antes del login)
    const from = location.state?.from;
    
    if (from && from !== '/login' && from !== '/register') {
      // Redirigir a donde estaba antes
      console.log('Redirigiendo a ruta anterior:', from);
      navigate(from, { replace: true });
    } else {
      // Redirigir según el tipo de usuario
      if (user.userType === 'admin') {
        console.log('Redirigiendo admin al dashboard');
        navigate('/dashboard', { replace: true });
      } else if (user.userType === 'Customer') {
        console.log('Redirigiendo cliente al inicio');
        navigate('/', { replace: true });
      } else {
        console.log('Redirigiendo usuario genérico al inicio');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, location.state, navigate]);

  /**
   * Redirige al usuario después de un logout exitoso
   */
  const redirectAfterLogout = React.useCallback(() => {
    if (isAuthenticated || loading || isLoggingOut) return;

    console.log('Redirigiendo después de logout exitoso...');
    
    // Siempre redirigir al login después del logout
    if (location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, isLoggingOut, location.pathname, navigate]);

  return {
    redirectAfterLogin,
    redirectAfterLogout
  };
};

/**
 * Componente que maneja automáticamente las redirecciones de autenticación
 * Úsalo en páginas donde necesites manejo automático de redirecciones
 */
const AuthRedirectHandler = ({ children }) => {
  const { redirectAfterLogin, redirectAfterLogout } = useAuthRedirect();
  const { isAuthenticated, user, loading, isLoggingOut } = useAuth();

  // Manejar redirección después de login
  useEffect(() => {
    if (isAuthenticated && user && !loading && !isLoggingOut) {
      redirectAfterLogin();
    }
  }, [isAuthenticated, user, loading, isLoggingOut, redirectAfterLogin]);

  // Manejar redirección después de logout
  useEffect(() => {
    if (!isAuthenticated && !loading && !isLoggingOut) {
      redirectAfterLogout();
    }
  }, [isAuthenticated, loading, isLoggingOut, redirectAfterLogout]);

  return children;
};

/**
 * Hook para verificar si debemos mostrar páginas de error
 * Evita mostrar errores durante transiciones normales de auth
 */
export const useShouldShowAuthError = () => {
  const { isAuthenticated, loading, isLoggingOut } = useAuth();
  const location = useLocation();

  // No mostrar errores de auth si:
  // 1. Estamos cargando
  // 2. Estamos haciendo logout
  // 3. Estamos en páginas públicas (login, register, home, etc.)
  // 4. Estamos en páginas de error
  const publicRoutes = [
    '/', '/home', '/login', '/register', '/recover-password', 
    '/verification-code', '/update-password', '/categoryProducts',
    '/mediaPage', '/aboutUs', '/conditionsPromotions', '/shippingInformation',
    '/privacyPolicies', '/termsandConditions'
  ];

  const errorRoutes = [
    '/error/400', '/error/401', '/error/403', '/error/404', '/error/409'
  ];

  const shouldShowError = React.useMemo(() => {
    // No mostrar error si estamos cargando o haciendo logout
    if (loading || isLoggingOut) return false;

    // No mostrar error si estamos en rutas públicas
    if (publicRoutes.includes(location.pathname)) return false;

    // No mostrar error si ya estamos en una página de error
    if (errorRoutes.includes(location.pathname)) return false;

    // No mostrar error si estamos en rutas dinámicas públicas
    if (location.pathname.startsWith('/categoria/') || 
        location.pathname.startsWith('/ProductDetail/') ||
        location.pathname.startsWith('/MediaDetailPage/')) {
      return false;
    }

    // Solo mostrar error si realmente necesitamos autenticación y no la tenemos
    return !isAuthenticated;
  }, [loading, isLoggingOut, location.pathname, isAuthenticated]);

  return shouldShowError;
};

/**
 * Componente para proteger rutas específicas sin interferir con auth normal
 */
export const SmartProtectedRoute = ({ 
  children, 
  requiredUserType = null,
  fallbackRoute = '/login'
}) => {
  const { isAuthenticated, user, loading, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowError = useShouldShowAuthError();

  useEffect(() => {
    // No hacer nada si estamos cargando o haciendo logout
    if (loading || isLoggingOut) return;

    // Verificar autenticación
    if (!isAuthenticated || !user) {
      console.log('Usuario no autenticado en ruta protegida, redirigiendo...');
      navigate(fallbackRoute, { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }

    // Verificar permisos si se requiere tipo específico
    if (requiredUserType && user.userType !== requiredUserType) {
      console.log(`Permisos insuficientes. Requerido: ${requiredUserType}, Actual: ${user.userType}`);
      
      // Redirigir según el tipo de usuario
      if (user.userType === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.userType === 'Customer') {
        navigate('/', { replace: true });
      } else {
        navigate(fallbackRoute, { replace: true });
      }
      return;
    }
  }, [isAuthenticated, user, loading, isLoggingOut, requiredUserType, navigate, location.pathname, fallbackRoute]);

  // Mostrar loading mientras se verifica
  if (loading || isLoggingOut) {
    return (
      <div 
        className="min-h-screen bg-pink-50 flex items-center justify-center"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="text-center">
          <div 
            className="spinner mx-auto mb-4"
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f2d1d4',
              borderTop: '4px solid #f2c6c2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <p className="text-gray-600">Verificando acceso...</p>
          
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Renderizar contenido si todo está bien
  if (isAuthenticated && user && (!requiredUserType || user.userType === requiredUserType)) {
    return children;
  }

  // Fallback: mostrar loading (la redirección se maneja en useEffect)
  return (
    <div 
      className="min-h-screen bg-pink-50 flex items-center justify-center"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="text-center">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

/**
 * Hook para manejar navegación inteligente
 */
export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const smartNavigate = React.useCallback((path, options = {}) => {
    // Si el usuario no está autenticado y trata de ir a una ruta protegida
    const protectedRoutes = ['/dashboard', '/profile', '/saves', '/shoppingCart', '/customProducts'];
    
    if (!isAuthenticated && protectedRoutes.some(route => path.startsWith(route))) {
      navigate('/login', { 
        ...options, 
        state: { from: path, ...options.state } 
      });
      return;
    }

    // Navegación normal
    navigate(path, options);
  }, [navigate, isAuthenticated]);

  return { smartNavigate };
};

export default AuthRedirectHandler;
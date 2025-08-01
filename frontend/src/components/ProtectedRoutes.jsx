/**
 * Componente ProtectedRoutes - VERSIÓN CORREGIDA PARA LOGOUT DE ADMIN
 * 
 * PROBLEMA SOLUCIONADO:
 * - Cuando admin hace logout desde dashboard u otras páginas admin, aparecía página 401
 * - Ahora redirige limpiamente al login durante logout desde páginas admin
 * 
 * NUEVA FUNCIONALIDAD:
 * - Detecta si la página actual es de admin durante logout
 * - Redirige al login en lugar de mostrar 401 para páginas admin durante logout
 * - Mantiene el comportamiento 401 para accesos normales sin autenticación
 * 
 * COMPORTAMIENTO ACTUALIZADO:
 * - Admin logout desde dashboard → Redirige a /login (NO página 401)
 * - Cliente logout desde saves → Redirige a /login (NO página 401) 
 * - Usuario no autenticado → /saves, /shoppingCart, etc. = Página 401 (normal)
 * - Usuario no autenticado → /profile = Redirige a /login (excepción)
 * 
 * Ubicación: frontend/src/components/ProtectedRoutes.jsx
 */

import React from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de indicador de carga mejorado
 */
const LoadingSpinner = () => (
  <div 
    className="loading-container" 
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fdf2f8',
      fontFamily: 'Poppins, sans-serif'
    }}
  >
    <div 
      className="spinner"
      style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f2d1d4',
        borderTop: '4px solid #f2c6c2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}
    />
    
    <div style={{ 
      color: '#6b7280', 
      fontSize: '16px',
      fontWeight: '500'
    }}>
      Verificando acceso...
    </div>
    
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * NUEVA FUNCIÓN: Detecta si la ruta actual es de administrador
 * @param {string} pathname - Ruta actual
 * @returns {boolean} - True si es ruta de admin
 */
const isAdminRoute = (pathname) => {
  const adminRoutes = [
    '/dashboard',
    '/media', 
    '/products',
    '/sales',
    '/categories',
    '/reviews',
    '/chat',
    '/customProductsMaterials'
  ];
  
  return adminRoutes.includes(pathname);
};

/**
 * NUEVA FUNCIÓN: Detecta si estamos en proceso de logout desde una página específica
 * @param {boolean} isLoggingOut - Estado de logout
 * @param {boolean} isAuthenticated - Estado de autenticación
 * @param {string} pathname - Ruta actual
 * @returns {boolean} - True si es logout desde página protegida
 */
const isLogoutFromProtectedPage = (isLoggingOut, isAuthenticated, pathname) => {
  // Si estamos haciendo logout O acabamos de terminar logout (no autenticado)
  // Y estamos en una página protegida
  const protectedRoutes = [
    '/dashboard', '/media', '/products', '/sales', '/categories', '/reviews', '/chat', '/customProductsMaterials', // Admin
    '/saves', '/orderdetails', '/shoppingCart', '/customProducts', '/paymentProcess', '/ruleta' // Customer
  ];
  
  return (isLoggingOut || (!isAuthenticated && protectedRoutes.includes(pathname)));
};

/**
 * Componente principal ProtectedRoutes - VERSIÓN CORREGIDA
 */
const ProtectedRoutes = ({ 
  children, 
  requiredUserType = null,
  isProfilePage = false
}) => {
  const { isAuthenticated, user, loading, isLoggingOut, isLoggingIn } = useAuth();
  const location = useLocation();

  // Debug logging mejorado
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 ProtectedRoutes - Estado completo:', {
        isAuthenticated,
        userType: user?.userType,
        requiredUserType,
        currentPath: location.pathname,
        isLoggingOut,
        isLoggingIn,
        loading,
        isProfilePage,
        isAdminRoute: isAdminRoute(location.pathname),
        isLogoutFromProtected: isLogoutFromProtectedPage(isLoggingOut, isAuthenticated, location.pathname)
      });
    }
  }, [isAuthenticated, user, requiredUserType, location.pathname, isLoggingOut, isLoggingIn, loading, isProfilePage]);

  // 1. LOADING: Mostrar spinner durante verificaciones iniciales
  if (loading) {
    console.log('🔄 Estado: Cargando verificación inicial...');
    return <LoadingSpinner />;
  }

  // 2. PROCESOS DE AUTH EN CURSO: Esperar a que terminen completamente
  if (isLoggingOut || isLoggingIn) {
    console.log('🔄 Proceso de autenticación en curso...', { isLoggingIn, isLoggingOut });
    return <LoadingSpinner />;
  }

  // 3. USUARIO NO AUTENTICADO: LÓGICA DIFERENCIADA MEJORADA
  if (!isAuthenticated || !user) {
    console.log('🚫 Usuario no autenticado detectado');
    
    // CASO ESPECIAL: Página de perfil - Redirigir al login (comportamiento original)
    if (isProfilePage) {
      console.log('👤 Página de perfil sin autenticación → Redirigir a login');
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    
    // NUEVO: CASO ESPECIAL - Páginas de admin sin autenticación durante/después de logout
    if (isAdminRoute(location.pathname)) {
      console.log('👑 Página de admin sin autenticación → Redirigir a login (posible logout)');
      return <Navigate to="/login" replace />;
    }
    
    // CASO GENERAL: Todas las demás páginas protegidas - Mostrar página 401
    console.log('🚫 Página protegida sin autenticación → Mostrar página 401');
    return <Navigate to="/error/401" replace state={{ 
      from: location.pathname,
      reason: 'not_authenticated',
      message: 'Debes iniciar sesión para acceder a esta página',
      timestamp: new Date().toISOString()
    }} />;
  }

  // 4. VERIFICAR QUE EL USUARIO TENGA userType VÁLIDO
  if (!user.userType) {
    console.log('⚠️ Usuario sin tipo definido, redirigiendo a login');
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 5. USUARIO AUTENTICADO SIN PERMISOS: Mostrar página de error 403
  if (requiredUserType && user.userType !== requiredUserType) {
    console.log(`🚫 VIOLACIÓN DE ACCESO - Requerido: ${requiredUserType}, Usuario: ${user.userType}`);
    
    // Verificar que realmente estamos en un estado estable (no en transición)
    if (isAuthenticated && user && user.userType && !isLoggingIn && !isLoggingOut && !loading) {
      console.log('📄 Usuario autenticado pero sin permisos → Página 403');
      return <Navigate to="/error/403" replace state={{ 
        from: location.pathname,
        requiredUserType,
        currentUserType: user.userType,
        reason: 'insufficient_permissions',
        message: `Acceso denegado: Se requiere tipo "${requiredUserType}", usuario actual es "${user.userType}"`,
        timestamp: new Date().toISOString()
      }} />;
    } else {
      // Si estamos en transición, mostrar loading
      console.log('⏳ Estado en transición, mostrando loading...');
      return <LoadingSpinner />;
    }
  }

  // 6. TODO CORRECTO: Renderizar contenido
  console.log(`✅ Acceso permitido para ${user.userType} → Renderizando contenido`);
  return children;
};

/**
 * Hook personalizado para verificar permisos (SIN CAMBIOS)
 */
export const usePermissions = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  return {
    isAuthenticated,
    userType: user?.userType,
    loading,
    isAdmin: user?.userType === 'admin',
    isCustomer: user?.userType === 'Customer',
    hasPermission: (requiredUserType) => {
      if (!isAuthenticated || !user) return false;
      if (!requiredUserType) return true;
      return user.userType === requiredUserType;
    },
    canAccess: (requiredUserType) => {
      if (!isAuthenticated || !user) return false;
      if (!requiredUserType) return true;
      return user.userType === requiredUserType;
    }
  };
};

/**
 * Componente para mostrar contenido condicionalmente basado en permisos (SIN CAMBIOS)
 */
export const ConditionalRender = ({ 
  requiredUserType = null, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(requiredUserType)) {
    return children;
  }
  
  return fallback;
};

// Exporta el componente como default
export default ProtectedRoutes;
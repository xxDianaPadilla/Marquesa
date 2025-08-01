/**
 * Componente ProtectedRoutes - VERSIÓN FINAL CORREGIDA
 * 
 * Funcionalidades principales:
 * - NO muestra páginas de error durante login/logout normales
 * - SÍ muestra páginas de error cuando un usuario autenticado trata de acceder a áreas prohibidas
 * - Distingue perfectamente entre procesos de auth y violaciones de acceso
 * - Navegación limpia durante login/logout
 * 
 * SOLUCIÓN IMPLEMENTADA:
 * - Durante login/logout: Redirecciones normales (NO páginas de error)
 * - Durante violaciones de acceso: Páginas de error 403
 * - Durante acceso sin autenticar a rutas protegidas: Redirigir a login (NO página 401)
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
 * Componente principal ProtectedRoutes - VERSIÓN FINAL
 */
const ProtectedRoutes = ({ 
  children, 
  requiredUserType = null
}) => {
  const { isAuthenticated, user, loading, isLoggingOut, isLoggingIn } = useAuth();
  const location = useLocation();

  // Debug logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 ProtectedRoutes - Estado:', {
        isAuthenticated,
        userType: user?.userType,
        requiredUserType,
        currentPath: location.pathname,
        isLoggingOut,
        isLoggingIn,
        loading
      });
    }
  }, [isAuthenticated, user, requiredUserType, location.pathname, isLoggingOut, isLoggingIn, loading]);

  // 1. LOADING: Mostrar spinner durante verificaciones
  if (loading) {
    console.log('🔄 Estado: Cargando...');
    return <LoadingSpinner />;
  }

  // 2. PROCESOS DE AUTH EN CURSO: No hacer validaciones, solo mostrar loading
  if (isLoggingOut || isLoggingIn) {
    console.log('🔄 Proceso de autenticación en curso, esperando...');
    return <LoadingSpinner />;
  }

  // 3. USUARIO NO AUTENTICADO: Redirigir a login (NUNCA páginas de error)
  if (!isAuthenticated || !user) {
    console.log('🚫 Usuario no autenticado → Redirigir a login');
    
    // IMPORTANTE: NUNCA mostrar página 401 durante procesos normales
    // Siempre redirigir a login con la ruta original
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 4. USUARIO AUTENTICADO SIN PERMISOS: Aquí SÍ mostrar páginas de error
  if (requiredUserType && user.userType !== requiredUserType) {
    console.log(`🚫 VIOLACIÓN DE ACCESO - Requerido: ${requiredUserType}, Usuario: ${user.userType}`);
    
    // Esta es una violación real de permisos, el usuario YA está autenticado
    // pero no tiene los permisos necesarios → Mostrar página 403
    console.log('📄 Mostrando página 403 - Acceso Prohibido');
    return <Navigate to="/error/403" replace state={{ 
      from: location.pathname,
      requiredUserType,
      currentUserType: user.userType,
      reason: 'insufficient_permissions',
      message: `Acceso denegado: Se requiere tipo "${requiredUserType}", usuario actual es "${user.userType}"`
    }} />;
  }

  // 5. VALIDACIONES ESPECÍFICAS ADICIONALES
  
  // Para rutas de administrador
  if (requiredUserType === 'admin' && user.userType !== 'admin') {
    console.log('🚫 Acceso denegado a área administrativa');
    return <Navigate to="/error/403" replace state={{ 
      from: location.pathname,
      reason: 'admin_area_access_denied',
      message: 'Esta área está restringida solo para administradores'
    }} />;
  }
  
  // Para rutas de cliente
  if (requiredUserType === 'Customer' && user.userType !== 'Customer') {
    console.log('🚫 Acceso denegado a área de cliente');
    return <Navigate to="/error/403" replace state={{ 
      from: location.pathname,
      reason: 'customer_area_access_denied',
      message: 'Esta área está restringida solo para clientes'
    }} />;
  }

  // 6. TODO CORRECTO: Renderizar contenido
  console.log('✅ Acceso permitido - Renderizando contenido');
  return children;
};

/**
 * Hook personalizado para verificar permisos
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
 * Componente para mostrar contenido condicionalmente basado en permisos
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
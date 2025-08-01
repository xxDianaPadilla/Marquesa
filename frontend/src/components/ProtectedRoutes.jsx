/**
 * Componente ProtectedRoutes - Sistema de protección de rutas CORREGIDO
 * 
 * Funcionalidades principales:
 * - Protege rutas basándose en autenticación y tipo de usuario
 * - MUESTRA páginas de error para accesos realmente prohibidos
 * - Distingue entre procesos normales de auth y violaciones de acceso
 * - Maneja estados de carga y autenticación correctamente
 * - Valida permisos de usuario de forma granular
 * 
 * CORRECCIÓN PRINCIPAL:
 * - Ahora SÍ muestra páginas de error cuando un usuario autenticado
 *   trata de acceder a áreas para las que NO tiene permisos
 * - Solo evita páginas de error durante login/logout normales
 * 
 * Ubicación: frontend/src/components/ProtectedRoutes.jsx
 */

import React from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de indicador de carga mejorado
 * Muestra un spinner elegante mientras se verifica la autenticación
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
      backgroundColor: '#fdf2f8', // bg-pink-50
      fontFamily: 'Poppins, sans-serif'
    }}
  >
    {/* Spinner animado */}
    <div 
      className="spinner"
      style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f2d1d4', // Color rosa claro
        borderTop: '4px solid #f2c6c2', // Color rosa del proyecto
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
    
    {/* CSS para la animación del spinner */}
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * Componente principal ProtectedRoutes CORREGIDO
 * @param {React.ReactNode} children - Componentes hijos a proteger
 * @param {string|null} requiredUserType - Tipo de usuario requerido ('admin', 'Customer', etc.)
 * @param {boolean} showErrorPages - Si debe usar páginas de error para violaciones de acceso (por defecto true)
 */
const ProtectedRoutes = ({ 
  children, 
  requiredUserType = null,
  showErrorPages = true // CAMBIADO: Por defecto true para mostrar errores cuando corresponda
}) => {
  // Obtiene el estado de autenticación del contexto
  const { isAuthenticated, user, userInfo, loading, isLoggingOut, isLoggingIn } = useAuth();
  
  // Obtiene la ubicación actual para logging y redirección
  const location = useLocation();

  // Log para debugging (solo en desarrollo)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoutes - Estado actual:', {
        isAuthenticated,
        userType: user?.userType,
        requiredUserType,
        currentPath: location.pathname,
        hasUserInfo: !!userInfo,
        showErrorPages,
        isLoggingOut,
        isLoggingIn
      });
    }
  }, [isAuthenticated, user, requiredUserType, location.pathname, userInfo, showErrorPages, isLoggingOut, isLoggingIn]);

  // Si está cargando la verificación de autenticación, muestra el spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // NUEVO: Si estamos en proceso de logout o login, no hacer validaciones
  if (isLoggingOut || isLoggingIn) {
    console.log('Proceso de autenticación en curso, mostrando loading...');
    return <LoadingSpinner />;
  }

  // VALIDACIÓN 1: Usuario no autenticado
  if (!isAuthenticated || !user) {
    console.log('Usuario no autenticado, redirigiendo...');
    
    // CORREGIDO: Solo usar páginas de error si NO estamos en proceso de auth
    if (showErrorPages && !isLoggingOut && !isLoggingIn) {
      return <Navigate to="/error/401" replace state={{ 
        from: location.pathname,
        reason: 'authentication_required'
      }} />;
    }
    
    // Comportamiento normal: Redirigir a login con la ruta original
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // VALIDACIÓN 2: Verificar tipo de usuario específico si es requerido
  if (requiredUserType && user.userType !== requiredUserType) {
    console.log(`🚫 ACCESO DENEGADO - Requerido: ${requiredUserType}, Usuario actual: ${user.userType}`);
    
    // CORREGIDO: SIEMPRE mostrar página de error para violaciones de permisos
    // (independientemente del estado de login/logout porque el usuario YA está autenticado)
    if (showErrorPages) {
      console.log('Redirigiendo a página de error 403 - Acceso Prohibido');
      return <Navigate to="/error/403" replace state={{ 
        from: location.pathname,
        requiredUserType,
        currentUserType: user.userType,
        reason: 'insufficient_permissions',
        message: `Se requiere acceso de tipo "${requiredUserType}" pero el usuario es de tipo "${user.userType}"`
      }} />;
    }
    
    // Comportamiento alternativo: Redirigir según el tipo de usuario actual
    console.log('Redirigiendo según tipo de usuario actual...');
    if (user.userType === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.userType === 'Customer') {
      return <Navigate to="/" replace />; // Página principal para clientes
    } else {
      // Tipo de usuario desconocido, redirigir a inicio
      return <Navigate to="/" replace />;
    }
  }

  // VALIDACIONES ADICIONALES ESPECÍFICAS POR TIPO DE USUARIO
  
  // Para rutas de administrador - Validación estricta
  if (requiredUserType === 'admin') {
    if (user.userType !== 'admin') {
      console.log('🚫 ACCESO DENEGADO - Área administrativa');
      
      if (showErrorPages) {
        console.log('Redirigiendo a página de error 403 - Área administrativa');
        return <Navigate to="/error/403" replace state={{ 
          from: location.pathname,
          reason: 'admin_area_access_denied',
          message: 'Esta área está restringida solo para administradores'
        }} />;
      }
      
      return <Navigate to="/" replace />;
    }
  }
  
  // Para rutas de cliente - Validación estricta
  if (requiredUserType === 'Customer') {
    if (user.userType !== 'Customer') {
      console.log('🚫 ACCESO DENEGADO - Área de cliente');
      
      if (showErrorPages) {
        console.log('Redirigiendo a página de error 403 - Área de cliente');
        return <Navigate to="/error/403" replace state={{ 
          from: location.pathname,
          reason: 'customer_area_access_denied',
          message: 'Esta área está restringida solo para clientes registrados'
        }} />;
      }
      
      return <Navigate to="/dashboard" replace />;
    }
  }

  // VALIDACIÓN FINAL: Todo está correcto
  console.log('✅ ACCESO PERMITIDO - Renderizando contenido protegido');
  return children;
};

/**
 * Versión específica para procesos de autenticación que NO debe usar páginas de error
 * Úsala solo para login/register/logout donde no quieres interferencias
 */
export const AuthProtectedRoutes = ({ children, requiredUserType = null }) => {
  return (
    <ProtectedRoutes 
      requiredUserType={requiredUserType} 
      showErrorPages={false} // NO mostrar páginas de error para procesos de auth
    >
      {children}
    </ProtectedRoutes>
  );
};

/**
 * Versión específica para páginas sensibles que SIEMPRE deben usar páginas de error
 * Úsala para rutas administrativas o muy sensibles
 */
export const StrictProtectedRoutes = ({ children, requiredUserType = null }) => {
  return (
    <ProtectedRoutes 
      requiredUserType={requiredUserType} 
      showErrorPages={true} // SIEMPRE mostrar páginas de error
    >
      {children}
    </ProtectedRoutes>
  );
};

/**
 * Hook personalizado para verificar permisos sin redireccionar
 * Útil para mostrar/ocultar elementos de UI basados en permisos
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
      console.log('Verificando acceso:', { 
        isAuthenticated, 
        currentUserType: user?.userType, 
        requiredUserType 
      });
      
      if (!isAuthenticated || !user) {
        console.log('Sin acceso: Usuario no autenticado');
        return false;
      }
      
      if (!requiredUserType) {
        console.log('Acceso permitido: No se requiere tipo específico');
        return true;
      }
      
      const hasAccess = user.userType === requiredUserType;
      console.log('Resultado de verificación:', hasAccess);
      return hasAccess;
    }
  };
};

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 * Útil para mostrar/ocultar elementos sin necesidad de rutas
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

/**
 * Validador de rutas para uso en configuración de router
 * Útil para validar acceso antes de cargar componentes pesados
 */
export const validateRouteAccess = (userType, requiredUserType) => {
  if (!requiredUserType) return true;
  return userType === requiredUserType;
};

// Exporta el componente como default
export default ProtectedRoutes;
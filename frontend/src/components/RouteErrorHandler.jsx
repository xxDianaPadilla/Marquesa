/**
 * Componente RouteErrorHandler - Manejador centralizado de errores de rutas
 * 
 * Funcionalidades principales:
 * - Captura errores de navegación y rutas
 * - Redirige a páginas de error apropiadas
 * - Integra con el sistema de autenticación
 * - Proporciona fallbacks para errores inesperados
 * - Logging de errores para debugging
 * 
 * Ubicación: frontend/src/components/RouteErrorHandler.jsx
 */

import React from 'react';
import { useRouteError, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente principal para manejar errores de rutas
 * Se usa en React Router como errorElement
 */
const RouteErrorHandler = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    // Log del error para debugging
    console.error('Error de ruta capturado:', {
      error: error?.message || 'Error desconocido',
      status: error?.status,
      statusText: error?.statusText,
      pathname: location.pathname,
      userAuthenticated: isAuthenticated,
      userType: user?.userType,
      timestamp: new Date().toISOString()
    });

    // Redirigir automáticamente según el tipo de error
    const handleErrorRedirection = () => {
      if (error?.status) {
        switch (error.status) {
          case 400:
            navigate('/error/400', { replace: true });
            break;
          case 401:
            navigate('/error/401', { replace: true });
            break;
          case 403:
            navigate('/error/403', { replace: true });
            break;
          case 404:
            navigate('/error/404', { replace: true });
            break;
          case 409:
            navigate('/error/409', { replace: true });
            break;
          default:
            // Para otros errores, usar 404 como fallback
            navigate('/error/404', { replace: true });
        }
      } else {
        // Si no hay status específico, usar 404
        navigate('/error/404', { replace: true });
      }
    };

    // Pequeño delay para evitar redirecciones inmediatas
    const timeoutId = setTimeout(handleErrorRedirection, 100);

    return () => clearTimeout(timeoutId);
  }, [error, navigate, location.pathname, isAuthenticated, user]);

  // Renderizar un estado de carga mientras se redirige
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
        <p className="text-gray-600">Redirigiendo...</p>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

/**
 * Hook personalizado para manejar errores de rutas programáticamente
 */
export const useRouteErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (statusCode, errorData = {}) => {
    console.error('Error manejado programáticamente:', { statusCode, errorData });

    switch (statusCode) {
      case 400:
        navigate('/error/400', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
        break;
      case 401:
        navigate('/error/401', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
        break;
      case 403:
        navigate('/error/403', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
        break;
      case 404:
        navigate('/error/404', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
        break;
      case 409:
        navigate('/error/409', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
        break;
      default:
        navigate('/error/404', { 
          state: { ...errorData, timestamp: new Date().toISOString() } 
        });
    }
  };

  return { handleError };
};

/**
 * Boundary de error para capturar errores de React en rutas
 */
export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por RouteErrorBoundary:', {
      error: error.message,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-pink-50 flex items-center justify-center"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Oops! Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado. Por favor, recarga la página o contacta al soporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorHandler;
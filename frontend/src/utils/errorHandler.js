/**
 * Utilidad para manejo de errores HTTP
 * Centraliza la lógica de redirección a páginas de error específicas
 * Proporciona funciones auxiliares para detectar y manejar diferentes tipos de errores
 * 
 * Funcionalidades principales:
 * - Redirección automática basada en códigos de estado HTTP
 * - Manejo de errores de red y timeout
 * - Logging de errores para debugging
 * - Integración con el sistema de navegación de React Router
 * 
 * Ubicación: frontend/src/utils/errorHandler.js
 */

/**
 * Mapeo de códigos de estado HTTP a rutas de error
 */
const ERROR_ROUTES = {
  400: '/error/400', // Bad Request
  401: '/error/401', // Unauthorized
  403: '/error/403', // Forbidden
  404: '/error/404', // Not Found
  409: '/error/409', // Conflict
  500: '/error/500', // Internal Server Error (opcional para futuro)
  502: '/error/502', // Bad Gateway (opcional para futuro)
  503: '/error/503', // Service Unavailable (opcional para futuro)
};

/**
 * Tipos de errores comunes en la aplicación
 */
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
};

/**
 * Clase principal para manejo de errores
 */
class ErrorHandler {
  constructor(navigate) {
    this.navigate = navigate;
  }

  /**
   * Maneja errores HTTP basados en el código de estado
   * @param {number} statusCode - Código de estado HTTP
   * @param {string} errorMessage - Mensaje de error opcional
   * @param {Object} errorData - Datos adicionales del error
   */
  handleHttpError(statusCode, errorMessage = '', errorData = {}) {
    // Log del error para debugging
    console.error(`HTTP Error ${statusCode}:`, {
      message: errorMessage,
      data: errorData,
      timestamp: new Date().toISOString()
    });

    // Verificar si existe una ruta específica para el error
    const errorRoute = ERROR_ROUTES[statusCode];
    
    if (errorRoute) {
      // Navegar a la página de error específica
      this.navigate(errorRoute, {
        state: {
          statusCode,
          message: errorMessage,
          data: errorData,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Para códigos de error no mapeados, usar la página 404
      this.navigate('/error/404', {
        state: {
          statusCode,
          message: errorMessage || 'Error desconocido',
          data: errorData,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Maneja errores de red (sin conexión, timeout, etc.)
   * @param {Error} error - Objeto de error de red
   */
  handleNetworkError(error) {
    console.error('Network Error:', error);

    // Detectar el tipo específico de error de red
    let errorType = ERROR_TYPES.NETWORK_ERROR;
    let userMessage = 'Error de conexión. Verifica tu conexión a internet.';

    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorType = ERROR_TYPES.NETWORK_ERROR;
      userMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    } else if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
      errorType = ERROR_TYPES.TIMEOUT_ERROR;
      userMessage = 'La solicitud tardó demasiado tiempo. Inténtalo nuevamente.';
    }

    // Mostrar página de error genérica con mensaje específico
    this.navigate('/error/404', {
      state: {
        statusCode: 0,
        message: userMessage,
        data: { errorType, originalError: error.message },
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Maneja respuestas fetch y redirecciona según el código de estado
   * @param {Response} response - Objeto Response de fetch
   * @param {Object} responseData - Datos parseados de la respuesta (opcional)
   */
  async handleFetchResponse(response, responseData = null) {
    if (!response.ok) {
      let errorMessage = 'Error en la solicitud';
      
      // Intentar obtener mensaje de error del response
      if (responseData && responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData && responseData.error) {
        errorMessage = responseData.error;
      }

      this.handleHttpError(response.status, errorMessage, responseData);
      return false; // Indica que hubo un error
    }
    
    return true; // Indica que la respuesta fue exitosa
  }

  /**
   * Wrapper para realizar peticiones fetch con manejo automático de errores
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones para fetch
   * @returns {Promise<Object|null>} - Datos de respuesta o null en caso de error
   */
  async fetchWithErrorHandling(url, options = {}) {
    try {
      // Configuración por defecto
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include',
        ...options
      };

      const response = await fetch(url, defaultOptions);
      
      // Intentar parsear la respuesta como JSON
      let responseData = null;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.warn('No se pudo parsear la respuesta como JSON:', parseError);
      }

      // Manejar la respuesta usando el método handleFetchResponse
      const isSuccessful = await this.handleFetchResponse(response, responseData);
      
      if (isSuccessful) {
        return responseData;
      }
      
      return null; // Error manejado automáticamente

    } catch (error) {
      // Manejar errores de red
      this.handleNetworkError(error);
      return null;
    }
  }
}

/**
 * Hook personalizado para usar el ErrorHandler en componentes de React
 * @returns {ErrorHandler} - Instancia configurada del ErrorHandler
 */
export const useErrorHandler = () => {
  const navigate = useNavigate();
  return new ErrorHandler(navigate);
};

/**
 * Función auxiliar para crear un ErrorHandler sin hook
 * Útil para usar en contextos donde no se pueden usar hooks
 * @param {Function} navigate - Función de navegación de React Router
 * @returns {ErrorHandler} - Instancia configurada del ErrorHandler
 */
export const createErrorHandler = (navigate) => {
  return new ErrorHandler(navigate);
};

/**
 * Función de utilidad para verificar si un error requiere autenticación
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si el error requiere login
 */
export const requiresAuthentication = (statusCode) => {
  return statusCode === 401;
};

/**
 * Función de utilidad para verificar si un error es de autorización
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si el error es de permisos insuficientes
 */
export const isAuthorizationError = (statusCode) => {
  return statusCode === 403;
};

/**
 * Función de utilidad para verificar si un error es de validación
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si el error es de datos inválidos
 */
export const isValidationError = (statusCode) => {
  return statusCode === 400 || statusCode === 422;
};

/**
 * Función de utilidad para verificar si un error es de recurso no encontrado
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si el recurso no fue encontrado
 */
export const isNotFoundError = (statusCode) => {
  return statusCode === 404;
};

/**
 * Función de utilidad para verificar si un error es de conflicto
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si hay conflicto de recursos
 */
export const isConflictError = (statusCode) => {
  return statusCode === 409;
};

/**
 * Función de utilidad para verificar si un error es del servidor
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} - True si es error del servidor
 */
export const isServerError = (statusCode) => {
  return statusCode >= 500 && statusCode < 600;
};

export default ErrorHandler;
/**
 * Middleware de manejo de errores para el backend
 * Proporciona respuestas HTTP consistentes y logging centralizado de errores
 * Integra con el sistema de códigos de estado HTTP del frontend
 * 
 * Funcionalidades principales:
 * - Manejo centralizado de errores HTTP
 * - Logging de errores para debugging y monitoreo
 * - Respuestas JSON consistentes
 * - Validación de datos de entrada
 * - Integración con el sistema de autenticación
 * 
 * Ubicación: backend/src/middleware/errorMiddleware.js
 */

/**
 * Clase personalizada para errores HTTP
 */
class HTTPError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'HTTPError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Códigos de estado HTTP y sus mensajes por defecto
 */
const HTTP_STATUS_MESSAGES = {
  400: 'Solicitud incorrecta',
  401: 'Acceso no autorizado',
  403: 'Acceso prohibido', 
  404: 'Recurso no encontrado',
  409: 'Conflicto de recursos',
  422: 'Datos no válidos',
  500: 'Error interno del servidor',
  502: 'Error de gateway',
  503: 'Servicio no disponible'
};

/**
 * Middleware principal de manejo de errores
 * Se debe colocar al final de todas las rutas en Express
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let details = null;

  // Log del error para debugging
  console.error('Error capturado por middleware:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determinar el tipo de error y configurar la respuesta apropiada
  if (error instanceof HTTPError) {
    // Error HTTP personalizado
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    // Error de validación de Mongoose
    statusCode = 400;
    message = 'Error de validación en los datos proporcionados';
    details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  } else if (error.name === 'CastError') {
    // Error de formato de datos de Mongoose
    statusCode = 400;
    message = 'Formato de datos incorrecto';
    details = {
      field: error.path,
      value: error.value,
      expectedType: error.kind
    };
  } else if (error.code === 11000) {
    // Error de duplicación en MongoDB
    statusCode = 409;
    message = 'El recurso ya existe';
    details = {
      duplicatedFields: Object.keys(error.keyValue),
      values: error.keyValue
    };
  } else if (error.name === 'JsonWebTokenError') {
    // Error de token JWT
    statusCode = 401;
    message = 'Token de autenticación inválido';
  } else if (error.name === 'TokenExpiredError') {
    // Token JWT expirado
    statusCode = 401;
    message = 'Token de autenticación expirado';
  } else if (error.name === 'MulterError') {
    // Error de subida de archivos
    statusCode = 400;
    message = 'Error en la subida de archivo';
    details = {
      code: error.code,
      field: error.field
    };
  }

  // Respuesta JSON consistente
  const errorResponse = {
    success: false,
    message: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };

  // Incluir detalles del error solo en desarrollo o cuando sea necesario
  if (details && (process.env.NODE_ENV === 'development' || statusCode < 500)) {
    errorResponse.details = details;
  }

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para manejar rutas no encontradas (404)
 * Se debe colocar después de todas las rutas definidas
 */
const notFoundHandler = (req, res, next) => {
  const error = new HTTPError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
    {
      method: req.method,
      url: req.originalUrl,
      availableRoutes: req.app._router ? 'Consulta la documentación de la API' : null
    }
  );
  
  next(error);
};

/**
 * Middleware para validar datos de entrada
 * Utiliza express-validator para validaciones específicas
 */
const validationHandler = (validations) => {
  return async (req, res, next) => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));

    const { validationResult } = require('express-validator');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new HTTPError(
        'Error de validación en los datos proporcionados',
        400,
        {
          validationErrors: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value,
            location: err.location
          }))
        }
      );
      
      return next(error);
    }

    next();
  };
};

/**
 * Middleware para manejar errores de autenticación
 */
const authErrorHandler = (req, res, next) => {
  // Verificar si hay token en las cookies
  const token = req.cookies?.authToken;
  
  if (!token) {
    const error = new HTTPError(
      'Token de autenticación requerido',
      401,
      {
        requiresLogin: true,
        loginUrl: '/login'
      }
    );
    
    return next(error);
  }
  
  next();
};

/**
 * Middleware para manejar errores de autorización
 */
const authorizationErrorHandler = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.userType;
    
    if (!userRole || userRole !== requiredRole) {
      const error = new HTTPError(
        'Permisos insuficientes para acceder a este recurso',
        403,
        {
          requiredRole: requiredRole,
          currentRole: userRole || 'guest',
          contactSupport: true
        }
      );
      
      return next(error);
    }
    
    next();
  };
};

/**
 * Middleware para manejar errores de límite de velocidad (rate limiting)
 */
const rateLimitErrorHandler = (req, res, next) => {
  const error = new HTTPError(
    'Demasiadas solicitudes. Inténtalo nuevamente más tarde',
    429,
    {
      retryAfter: 60, // segundos
      maxRequests: 100 // por ventana de tiempo
    }
  );
  
  next(error);
};

/**
 * Función de utilidad para crear errores HTTP
 */
const createHTTPError = (message, statusCode = 500, details = null) => {
  return new HTTPError(message, statusCode, details);
};

/**
 * Función de utilidad para enviar respuestas de éxito consistentes
 */
const sendSuccessResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para logging de requests
 */
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

/**
 * Función asyncHandler para envolver funciones async y capturar errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Exportar todos los middlewares y utilidades
module.exports = {
  HTTPError,
  errorHandler,
  notFoundHandler,
  validationHandler,
  authErrorHandler,
  authorizationErrorHandler,
  rateLimitErrorHandler,
  createHTTPError,
  sendSuccessResponse,
  requestLogger,
  asyncHandler,
  HTTP_STATUS_MESSAGES
};
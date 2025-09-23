// Importación de React y hooks necesarios para el contexto de autenticación
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// Importación de AsyncStorage para manejo de almacenamiento local en React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creación del contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    // Obtiene el contexto actual
    const context = useContext(AuthContext);
    // Valida que el hook se use dentro de un AuthProvider
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    // Retorna el contexto si es válido
    return context;
};

// Configuración del sistema de límite de intentos de login
const RATE_LIMIT_CONFIG = {
    maxAttempts: 5, // Máximo número de intentos fallidos permitidos
    lockoutDuration: 15 * 60, // Duración del bloqueo en segundos (15 minutos)
    warningThreshold: 3 // Número de intentos después del cual se muestra advertencia
};

// Objeto con funciones de validación para diferentes campos
const validators = {
    // Función para validar formato de email
    email: (email) => {
        // Verificar que el email exista y sea string
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'El email es requerido' };
        }

        // Eliminar espacios en blanco del email
        const trimmedEmail = email.trim();
        // Verificar que el email no esté vacío después del trim
        if (!trimmedEmail) {
            return { isValid: false, error: 'El email no puede estar vacío' };
        }

        // Expresión regular para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Validar que el email cumpla con el formato correcto
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'El formato del email no es válido' };
        }

        // Retornar validación exitosa
        return { isValid: true, error: null };
    },

    // Función para validar contraseña
    password: (password) => {
        // Verificar que la contraseña exista y sea string
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'La contraseña es requerida' };
        }

        // Verificar longitud mínima de la contraseña
        if (password.length < 8) {
            return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
        }

        // Retornar validación exitosa
        return { isValid: true, error: null };
    },

    // Función para validar token JWT
    token: (token) => {
        // Verificar que el token exista y sea string
        if (!token || typeof token !== 'string') {
            return { isValid: false, error: 'Token inválido' };
        }

        // Dividir el token en sus partes (header.payload.signature)
        const parts = token.split('.');
        // Verificar que el token tenga las 3 partes requeridas
        if (parts.length !== 3) {
            return { isValid: false, error: 'Formato de token invalido' };
        }

        // Retornar validación exitosa
        return { isValid: true, error: null };
    }
};

// Almacenamiento en memoria para los intentos de login fallidos
const loginAttempts = new Map();

// Utilidades para el manejo del sistema de límite de intentos
const RateLimitUtils = {
    // Genera una clave única para almacenar los intentos por email
    getStorageKey: (email) => `login_attempts_${email.toLowerCase()}`,

    // Obtiene los datos de intentos almacenados para un email
    getAttemptData: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        return loginAttempts.get(key) || { attempts: 0, lockedUntil: null };
    },

    // Guarda los datos de intentos para un email
    saveAttemptData: (email, data) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.set(key, data);
    },

    // Verifica si una cuenta está bloqueada
    isAccountLocked: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        if (!data.lockedUntil) return false;

        const now = Date.now();
        if (now >= data.lockedUntil) {
            // El bloqueo ha expirado, limpiar los datos
            RateLimitUtils.clearAttempts(email);
            return false;
        }
        return true;
    },

    // Obtiene el tiempo restante de bloqueo en segundos
    getRemainingLockTime: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        if (!data.lockedUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));
        return remaining;
    },

    // Registra un intento fallido y determina si se debe bloquear la cuenta
    recordFailedAttempt: (email) => {
        const data = RateLimitUtils.getAttemptData(email);
        const newAttempts = data.attempts + 1;

        let newData = {
            attempts: newAttempts,
            lockedUntil: data.lockedUntil,
            lastAttempt: Date.now()
        };

        // Si se alcanza el máximo de intentos, bloquear la cuenta
        if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000;
            newData.lockedUntil = Date.now() + lockDuration;
        }

        RateLimitUtils.saveAttemptData(email, newData);
        return newData;
    },

    // Limpia los intentos después de un login exitoso
    clearAttempts: (email) => {
        const key = RateLimitUtils.getStorageKey(email);
        loginAttempts.delete(key);
    },

    // Formatea el tiempo restante en un formato legible
    formatRemainingTime: (seconds) => {
        if (seconds <= 0) return '';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    // Obtiene un mensaje de advertencia sobre intentos restantes
    getAttemptsWarning: (email) => {
        const data = RateLimitUtils.getAttemptData(email);

        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold &&
            data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }
        return null;
    }
};

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
    // Estado para almacenar datos básicos del usuario
    const [user, setUser] = useState(null);
    // Estado para controlar loading general
    const [loading, setLoading] = useState(true);
    // Estado para indicar si el usuario está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para almacenar información completa del usuario
    const [userInfo, setUserInfo] = useState(null);
    // Estado para errores de autenticación
    const [authError, setAuthError] = useState(null);

    // Estados para manejo de favoritos
    const [favorites, setFavorites] = useState([]);
    // Estado para loading específico de favoritos
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    // Estado para errores específicos de favoritos
    const [favoritesError, setFavoritesError] = useState(null);

    // Estado para controlar proceso de logout
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Estado para controlar proceso de login
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Estado para coordinar con CartContext
    const [authReady, setAuthReady] = useState(false);

    // Estados para el sistema de límite de intentos
    const [lockoutInfo, setLockoutInfo] = useState(null);

    // Función para verificar el estado de bloqueo de una cuenta
    const checkAccountLockStatus = useCallback((email) => {
        if (!email) return { isLocked: false };

        const cleanEmail = email.trim().toLowerCase();
        const isLocked = RateLimitUtils.isAccountLocked(cleanEmail);

        if (isLocked) {
            const remainingTime = RateLimitUtils.getRemainingLockTime(cleanEmail);
            const formattedTime = RateLimitUtils.formatRemainingTime(remainingTime);

            const lockInfo = {
                isLocked: true,
                remainingTime: remainingTime,
                formattedTime: formattedTime,
                message: `Tu cuenta está temporalmente bloqueada. Tiempo restante: ${formattedTime}`
            };

            setLockoutInfo(lockInfo);
            return lockInfo;
        } else {
            setLockoutInfo(null);
            return { isLocked: false };
        }
    }, []);

    // Función para obtener advertencias sobre intentos restantes
    const getAttemptsWarning = useCallback((email) => {
        if (!email) return null;
        const cleanEmail = email.trim().toLowerCase();
        return RateLimitUtils.getAttemptsWarning(cleanEmail);
    }, []);

    // Función para guardar token en AsyncStorage
    const saveTokenToStorage = async (token) => {
        try {
            // Log para debugging del proceso de guardado
            console.log('Guardando token en AsyncStorage...');
            // Guardar token en almacenamiento local
            await AsyncStorage.setItem('authToken', token);
            // Log de confirmación de guardado exitoso
            console.log('Token guardado exitosamente');
            return true;
        } catch (error) {
            // Log de error en caso de fallo al guardar
            console.error('Error al guardar el token en storage:', error);
            return false;
        }
    };

    // Función para obtener el mejor token disponible con validación de expiración
    const getBestAvailableToken = useCallback(async () => {
        try {
            // Obtener token del almacenamiento local
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                // Decodificar token para verificar expiración
                const decoded = decodeToken(token);
                // Verificar que el token exista y no haya expirado
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    return token;
                } else {
                    // Log cuando el token está expirado
                    console.log('Token expirado, eliminando...');
                    // Eliminar token expirado del almacenamiento
                    await AsyncStorage.removeItem('authToken');
                    return null;
                }
            }
            return null;
        } catch (error) {
            // Log de error al obtener token
            console.error('Error al obtener token:', error);
            return null;
        }
    }, []);

    // Función para obtener token del almacenamiento
    const getTokenFromStorage = async () => {
        try {
            // Obtener token del AsyncStorage
            const token = await AsyncStorage.getItem('authToken');
            return token;
        } catch (error) {
            // Log de error al obtener token
            console.error('Error al obtener el token del storage: ', error);
            return null;
        }
    };

    // Función para eliminar token del almacenamiento
    const removeTokenFromStorage = async () => {
        try {
            // Eliminar token del AsyncStorage
            await AsyncStorage.removeItem('authToken');
            return true;
        } catch (error) {
            // Log de error al eliminar token
            console.error('Error al eliminar el token del storage: ', error);
            return false;
        }
    };

    // Función para normalizar el ID del producto
    const getProductId = useCallback((product) => {
        // Verificar que el producto exista
        if (!product) return null;
        // Retornar el ID del producto, priorizando _id sobre id
        return product._id || product.id || null;
    }, []);

    // Función para normalizar y validar el producto antes de guardarlo
    const normalizeProduct = useCallback((product) => {
        // Verificar que el producto exista
        if (!product) return null;

        // Obtener ID del producto
        const productId = getProductId(product);
        // Verificar que el producto tenga un ID válido
        if (!productId) {
            console.error('Product has no valid ID:', product);
            return null;
        }

        // Crear una copia normalizada del producto con todos los campos necesarios
        const normalizedProduct = {
            // IDs - asegurar que ambos estén presentes
            id: productId,
            _id: productId,

            // Información básica del producto
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            category: product.category || '',

            // Precio - manejar diferentes formatos
            price: product.price || 0,

            // Stock - puede ser undefined si no se proporciona
            stock: product.stock !== undefined ? Number(product.stock) : undefined,

            // Imágenes - normalizar estructura
            image: product.image || '',
            images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),

            // Metadatos de favoritos
            addedAt: new Date().toISOString(),
            userId: user?.id || 'guest',

            // Preservar cualquier otro campo que pueda ser importante
            ...Object.keys(product).reduce((acc, key) => {
                // Evitar duplicar campos ya procesados
                if (!['id', '_id', 'name', 'description', 'category', 'price', 'stock', 'image', 'images'].includes(key)) {
                    acc[key] = product[key];
                }
                return acc;
            }, {})
        };

        return normalizedProduct;
    }, [user?.id, getProductId]);

    // Función para decodificar token JWT
    const decodeToken = (token) => {
        try {
            // Verificar que el token exista
            if (!token) {
                return null;
            }

            // Dividir token en sus partes
            const parts = token.split('.');
            // Verificar estructura del token
            if (parts.length !== 3) {
                console.error('Token con formato inválido');
                return null;
            }

            // Obtener payload del token
            const payload = parts[1];
            // Verificar que el payload exista
            if (!payload) {
                console.error('Payload del token vacío');
                return null;
            }

            // Decodificar payload de base64
            const decodedPayload = atob(payload);
            // Parsear JSON del payload
            const parsedPayload = JSON.parse(decodedPayload);

            // Verificar campos requeridos en el payload
            if (!parsedPayload || !parsedPayload.id || !parsedPayload.exp) {
                console.error('Token no contiene campos requeridos');
                return null;
            }

            // Obtener tiempo actual en segundos
            const currentTime = Math.floor(Date.now() / 1000);
            // Verificar si el token no ha expirado
            if (parsedPayload.exp <= currentTime) {
                console.info('El token ha expirado');
                return null;
            }

            return parsedPayload;
        } catch (error) {
            // Log de error al decodificar token
            console.error('Error al decodificar el token: ', error);
            return null;
        }
    };

    // Función para obtener información completa del usuario
    const getUserInfo = async (token) => {
        try {
            // Log del inicio del proceso
            console.log('Obteniendo información del usuario...');

            // Realizar petición al endpoint de información de usuario
            const response = await fetch('https://marquesa.onrender.com/api/login/userInfo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                // Parsear respuesta JSON
                const data = await response.json();
                // Log de la respuesta recibida
                console.log('Respuesta getUserInfo: ', data);

                // Verificar que la respuesta contenga datos válidos
                if (data && data.success && data.user) {
                    // Log de información obtenida exitosamente
                    console.log('Información del usuario obtenida: ', data.user);
                    // Actualizar estado con información del usuario
                    setUserInfo(data.user);
                    // Limpiar errores de autenticación
                    setAuthError(null);

                    // Marcar auth como listo después de obtener userInfo
                    setAuthReady(true);

                    return data.user;
                } else {
                    // Log de advertencia por respuesta sin éxito
                    console.warn('Respuesta sin éxito: ', data?.message);
                    return null;
                }
            } else {
                // Log de error del servidor
                console.error('Error en respuesta del servidor: ', response.status);
                return null;
            }
        } catch (error) {
            // Log de error en la petición
            console.error('Error al obtener información del usuario: ', error);
            // Establecer error en el estado
            setAuthError('Error al obtener información del usuario');
            return null;
        }
    };

    // Función de registro de usuario
    const register = async (userData) => {
        try {
            // Log del inicio del proceso de registro
            console.log('Iniciando proceso de registro...');

            // Validaciones básicas antes de enviar al servidor
            if (!userData.fullName || !userData.email || !userData.password) {
                return { success: false, message: 'Todos los campos son requeridos' };
            }

            // Realizar petición de registro al servidor
            const response = await fetch('https://marquesa.onrender.com/api/registerCustomers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            // Parsear respuesta del servidor
            const data = await response.json();
            console.log('Register response:', data);

            // Verificar si el registro fue exitoso
            if (response.ok && data.success) {
                console.log('Registro exitoso');
                return {
                    success: true,
                    message: data.message || 'Registro exitoso'
                };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error en el registro';
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error en el proceso de registro
            console.error('Error en el proceso de registro:', error);
            // Obtener mensaje de error apropiado
            const errorMsg = error.message || 'Error de conexión con el servidor';
            return { success: false, message: errorMsg };
        }
    };

    // Función para obtener favoritos con lógica mejorada
    const getFavorites = useCallback(async (token = null) => {
        try {
            // Activar loading de favoritos
            setFavoritesLoading(true);
            // Limpiar errores previos
            setFavoritesError(null);

            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                console.log('Usuario no autenticado, limpiando favoritos');
                setFavorites([]);
                return [];
            }

            // Obtener token de autenticación
            const authToken = token || await getBestAvailableToken();
            if (!authToken) {
                console.log('No hay token para obtener favoritos');
                setFavorites([]);
                return [];
            }

            // Log del inicio de obtención de favoritos
            console.log('Obteniendo favoritos desde el servidor...');

            // Crear promesa para la petición HTTP
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Crear promesa de timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar petición con timeout
            const response = await Promise.race([operationPromise, timeoutPromise]);

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                // Parsear respuesta JSON
                const data = await response.json();
                // Log de la respuesta de favoritos
                console.log('Respuesta de favoritos:', data);

                // Verificar que la respuesta sea exitosa
                if (data && data.success) {
                    // Inicializar array de favoritos del usuario
                    let userFavorites = [];

                    // Verificar diferentes estructuras de respuesta para favoritos
                    if (data.user && data.user.favorites) {
                        // Los favoritos están en data.user.favorites
                        userFavorites = data.user.favorites;
                    } else if (data.favorites) {
                        // Los favoritos están directamente en data.favorites
                        userFavorites = data.favorites;
                    } else if (data.data) {
                        // Los favoritos están en data.data
                        userFavorites = data.data;
                    }

                    // Log de favoritos obtenidos del servidor
                    console.log('Favoritos obtenidos del servidor:', userFavorites);

                    // Array para procesar favoritos que pueden venir como array de objetos con productId
                    const processedFavorites = [];

                    // Verificar que userFavorites sea un array
                    if (Array.isArray(userFavorites)) {
                        // Iterar sobre cada favorito
                        for (const fav of userFavorites) {
                            // Verificar si es solo un string ID
                            if (typeof fav === 'string') {
                                // Es solo un ID de producto
                                processedFavorites.push({ _id: fav, id: fav });
                            } else if (fav && typeof fav === 'object') {
                                // Verificar si tiene estructura con productId
                                if (fav.productId) {
                                    // Verificar si productId es objeto poblado
                                    if (typeof fav.productId === 'object' && fav.productId._id) {
                                        // El productId es un objeto poblado
                                        processedFavorites.push(normalizeProduct(fav.productId));
                                    } else if (typeof fav.productId === 'string') {
                                        // El productId es solo un string ID
                                        processedFavorites.push({
                                            _id: fav.productId,
                                            id: fav.productId,
                                            favId: fav._id
                                        });
                                    }
                                } else {
                                    // Es un producto directo
                                    const normalized = normalizeProduct(fav);
                                    // Verificar que la normalización fue exitosa
                                    if (normalized) {
                                        processedFavorites.push(normalized);
                                    }
                                }
                            }
                        }
                    }

                    // Filtrar elementos null/undefined
                    const cleanFavorites = processedFavorites.filter(fav => fav !== null && fav !== undefined);

                    // Log de favoritos procesados
                    console.log('Favoritos procesados:', cleanFavorites);
                    // Actualizar estado con favoritos procesados
                    setFavorites(cleanFavorites);
                    return cleanFavorites;
                } else {
                    // Log de advertencia por error al obtener favoritos
                    console.warn('Error al obtener favoritos:', data?.message);
                    setFavorites([]);
                    return [];
                }
            } else if (response.status === 401) {
                // Log cuando el token es inválido o expirado
                console.log('Token expirado o inválido');
                setFavorites([]);
                return [];
            } else {
                // Log de error del servidor
                console.error('Error en respuesta del servidor:', response.status);
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            // Log de error al obtener favoritos
            console.error('Error al obtener favoritos:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error al obtener favoritos';

            // Verificar tipo específico de error
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            // Establecer mensaje de error en el estado
            setFavoritesError(errorMessage);
            // Limpiar favoritos en caso de error
            setFavorites([]);
            return [];
        } finally {
            // Desactivar loading de favoritos sin importar el resultado
            setFavoritesLoading(false);
        }
    }, [isAuthenticated, getBestAvailableToken, normalizeProduct]);

    // Función para obtener datos completos de productos favoritos
    const fetchFavoriteProducts = useCallback(async (productIds, token) => {
        try {
            // Verificar que existan IDs de productos
            if (!productIds || productIds.length === 0) {
                return [];
            }

            // Log del inicio de obtención de datos completos
            console.log('Obteniendo datos completos de productos favoritos:', productIds);

            // Obtener token de autenticación
            const authToken = token || await getBestAvailableToken();

            // Crear promesa para obtener todos los productos
            const operationPromise = fetch('https://marquesa.onrender.com/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Crear promesa de timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar petición con timeout
            const response = await Promise.race([operationPromise, timeoutPromise]);

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                // Parsear respuesta JSON
                const data = await response.json();

                // Verificar que la respuesta contenga productos
                if (data && data.products) {
                    // Filtrar solo los productos que están en favoritos
                    const favoriteProducts = data.products.filter(product =>
                        productIds.includes(product._id)
                    );

                    // Log de productos favoritos obtenidos
                    console.log('Productos favoritos obtenidos:', favoriteProducts);
                    return favoriteProducts;
                }
            }

            return [];
        } catch (error) {
            // Log de error al obtener datos de productos favoritos
            console.error('Error al obtener datos de productos favoritos:', error);
            return [];
        }
    }, [getBestAvailableToken]);

    // Función para verificar si un producto es favorito con lógica robusta
    const isFavorite = useCallback((productId) => {
        try {
            // Verificar que el productId exista y el usuario esté autenticado
            if (!productId || !isAuthenticated) return false;

            // Asegurar que favorites sea un array antes de usar some()
            const currentFavorites = Array.isArray(favorites) ? favorites : [];
            // Verificar si el producto está en la lista de favoritos
            return currentFavorites.some(fav => {
                // Verificar si el favorito es un string
                if (typeof fav === 'string') {
                    return fav === productId;
                }
                // Verificar si el favorito es un objeto
                if (typeof fav === 'object' && fav !== null) {
                    return getProductId(fav) === productId;
                }
                return false;
            });
        } catch (error) {
            // Log de error al verificar favorito
            console.error('Error checking if favorite:', error);
            return false;
        }
    }, [favorites, getProductId, isAuthenticated]);

    // Función para limpiar datos de autenticación
    const clearAuthData = async (fromLogout = false) => {
        try {
            // Log del inicio de limpieza de datos
            console.log('Limpiando datos de autenticación...');

            // Marcar auth como no listo
            setAuthReady(false);

            // Limpiar token del storage
            await removeTokenFromStorage();

            // Limpiar estados de usuario
            setUser(null);
            setUserInfo(null);
            setIsAuthenticated(false);
            setAuthError(null);

            // Limpiar estados de favoritos
            setFavorites([]);
            setFavoritesError(null);

            // Limpiar estados de rate limiting
            setLockoutInfo(null);

            // Cambiar loading si no viene del logout
            if (!fromLogout) {
                setLoading(false);
            }

            // Log de confirmación de limpieza exitosa
            console.log('Datos de autenticación limpiados exitosamente');
        } catch (error) {
            // Log de error al limpiar datos
            console.error('Error al limpiar datos de autenticación:', error);

            // Asegurar que al menos se limpien los estados principales
            setAuthReady(false);
            setUser(null);
            setUserInfo(null);
            setIsAuthenticated(false);
            setFavorites([]);
            setLockoutInfo(null);

            // Cambiar loading si no viene del logout
            if (!fromLogout) {
                setLoading(false);
            }
        }
    };

    // Función para agregar producto a favoritos con lógica mejorada
    const addToFavorites = useCallback(async (product) => {
        try {
            // Log del producto que se va a agregar
            console.log('Adding to favorites - Raw product:', product);

            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión para agregar favoritos');
                return { success: false, message: 'Debes iniciar sesión para agregar favoritos' };
            }

            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            // Normalizar el producto antes de agregarlo
            const normalizedProduct = normalizeProduct(product);

            // Verificar que la normalización fue exitosa
            if (!normalizedProduct) {
                console.error('Failed to normalize product:', product);
                return { success: false, message: 'Producto inválido' };
            }

            // Obtener ID del producto normalizado
            const productId = getProductId(normalizedProduct);

            // Verificar que el producto tenga un ID válido
            if (!productId) {
                console.error('Product has no valid ID:', product);
                return { success: false, message: 'Producto sin ID válido' };
            }

            // Log del ID del producto que se va a agregar
            console.log('Agregando a favoritos:', productId);

            // Crear promesa para la petición HTTP
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Crear promesa de timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar petición con timeout
            const response = await Promise.race([operationPromise, timeoutPromise]);
            // Parsear respuesta JSON
            const data = await response.json();
            // Log de la respuesta del servidor
            console.log('Respuesta agregar favorito:', data);

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                console.log('Producto agregado a favoritos exitosamente');

                // Guardar token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizar la lista de favoritos
                await getFavorites(token);
                return { success: true, message: data.message || 'Producto agregado a favoritos' };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al agregar a favoritos';
                // Log del error del servidor
                console.error('Error del servidor:', data);
                // Establecer error en el estado
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al remover de favoritos
            console.error('Error removing from favorites:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            // Verificar tipo específico de error
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            // Establecer mensaje de error en el estado
            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, getFavorites, saveTokenToStorage]);

    // Función para toggle favorito con lógica mejorada
    const toggleFavorite = useCallback(async (product) => {
        try {
            // Verificar que se proporcione un producto
            if (!product) {
                console.error('No product provided to toggle');
                return { success: false, message: 'Producto requerido' };
            }

            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            // Obtener ID del producto
            const productId = getProductId(product);

            // Verificar que el producto tenga un ID válido
            if (!productId) {
                console.error('Product has no valid ID for toggle:', product);
                return { success: false, message: 'Producto sin ID válido' };
            }

            // Log del toggle de favorito
            console.log('Toggling favorite for product:', {
                productId,
                productName: product.name,
                currentlyFavorite: isFavorite(productId)
            });

            // Crear promesa para la petición HTTP
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Crear promesa de timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar petición con timeout
            const response = await Promise.race([operationPromise, timeoutPromise]);
            // Parsear respuesta JSON
            const data = await response.json();
            // Log de la respuesta del servidor
            console.log('Respuesta toggle favorito:', data);

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                console.log('Toggle favorito exitoso');

                // Guardar token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizar la lista de favoritos
                await getFavorites(token);
                return {
                    success: true,
                    message: data.message || 'Favorito actualizado',
                    isAdded: data.action === 'added' || data.isAdded
                };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al actualizar favorito';
                // Log del error del servidor
                console.error('Error del servidor:', data);
                // Establecer error en el estado
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al hacer toggle de favorito
            console.error('Error toggling favorite:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            // Verificar tipo específico de error
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            // Establecer mensaje de error en el estado
            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, getProductId, isFavorite, getFavorites, saveTokenToStorage]);

    // Función para remover producto de favoritos con lógica mejorada
    const removeFromFavorites = useCallback(async (productId) => {
        try {
            // Verificar que se proporcione un ID de producto
            if (!productId) {
                console.error('No productId provided for removal');
                return { success: false, message: 'ID de producto requerido' };
            }

            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            // Log del ID del producto que se va a remover
            console.log('Removiendo de favoritos:', productId);

            // Crear promesa para la petición HTTP
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Crear promesa de timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar petición con timeout
            const response = await Promise.race([operationPromise, timeoutPromise]);
            // Parsear respuesta JSON
            const data = await response.json();
            // Log de la respuesta del servidor
            console.log('Respuesta remover favorito:', data);

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                console.log('Producto removido de favoritos exitosamente');

                // Guardar token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizar la lista de favoritos
                await getFavorites(token);
                return { success: true, message: data.message || 'Producto removido de favoritos' };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al remover de favoritos';
                // Log del error del servidor
                console.error('Error del servidor:', data);
                // Establecer error en el estado
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al agregar a favoritos
            console.error('Error adding to favorites:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            // Verificar tipo específico de error
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            // Establecer mensaje de error en el estado
            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, normalizeProduct, getProductId, getFavorites, saveTokenToStorage]);

    // Función para limpiar todos los favoritos
    const clearAllFavorites = useCallback(async () => {
        try {
            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                return { success: false, message: 'No hay sesión activa' };
            }

            // Recargar favoritos desde el servidor
            await getFavorites(token);
            return { success: true, message: 'Favoritos actualizados' };
        } catch (error) {
            // Log de error al limpiar favoritos
            console.error('Error clearing favorites:', error);
            return { success: false, message: 'Error al limpiar favoritos' };
        }
    }, [isAuthenticated, getBestAvailableToken, getFavorites]);

    // Función para obtener un producto favorito por ID
    const getFavoriteProduct = useCallback((productId) => {
        // Verificar que se proporcione un ID
        if (!productId) return null;

        // Asegurar que favorites sea un array
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        // Buscar el producto en la lista de favoritos
        return currentFavorites.find(fav => getProductId(fav) === productId) || null;
    }, [favorites, getProductId]);

    // Función para refrescar/recargar favoritos
    const refreshFavorites = useCallback(async () => {
        // Verificar que el usuario esté autenticado antes de refrescar
        if (isAuthenticated) {
            return await getFavorites();
        }
        return [];
    }, [getFavorites, isAuthenticated]);

    // Función mejorada para verificar estado de autenticación
    const checkAuthStatus = async () => {
        try {
            // Verificar si hay procesos de autenticación en curso
            if (isLoggingOut || isLoggingIn) {
                console.log('Proceso de autenticación en progreso, saltando verificación');
                return;
            }

            // Activar loading y limpiar errores
            setLoading(true);
            setAuthError(null);
            setAuthReady(false); 

            // Log del inicio de verificación
            console.log('Verificando estado de autenticación...');

            // Obtener token del almacenamiento
            const token = await getTokenFromStorage();

            // Verificar si existe un token
            if (token) {
                // Log de token encontrado
                console.log('Token encontrado, decodificando...');
                // Decodificar token para verificar validez
                const decodedToken = decodeToken(token);

                // Verificar que el token sea válido y no haya expirado
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    // Log de token válido
                    console.log('Token válido, configurando usuario...');

                    // Crear objeto de datos del usuario
                    const userData = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || 'user'
                    };

                    // Establecer datos del usuario en el estado
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Log de obtención de información completa
                    console.log('Obteniendo información completa del usuario...');
                    // Obtener información completa del usuario
                    const userInfoResult = await getUserInfo(token);

                    // Verificar que se obtuvo información del usuario
                    if (userInfoResult) {
                        // Log de obtención de favoritos
                        console.log('Obteniendo favoritos del usuario...');
                        // Obtener favoritos después de la autenticación
                        await getFavorites(token);

                        // Marcar autenticación como lista
                        setAuthReady(token);
                        // Log de autenticación completamente inicializada
                        console.log('Auth completamente inicializado y listo');
                    } else {
                        // Log de error al obtener información del usuario
                        console.error('No se pudo obtener información del usuario');
                        // Limpiar datos de autenticación en caso de error
                        await clearAuthData(false);
                    }
                } else {
                    // Log de token expirado o inválido
                    console.info('Token expirado o inválido');
                    // Limpiar datos de autenticación
                    await clearAuthData(false);
                }
            } else {
                // Log de token no encontrado
                console.info('No se encontró token');
                // Limpiar datos de autenticación
                await clearAuthData(false);
            }
        } catch (error) {
            // Log de error al verificar autenticación
            console.error('Error al verificar la autenticación:', error);
            // Establecer error en el estado
            setAuthError('Error al verificar el estado de autenticación');
            // Limpiar datos de autenticación en caso de error
            await clearAuthData(false);
        } finally {
            // Desactivar loading si no está en proceso de login
            if (!isLoggingIn) {
                setLoading(false);
            }
        }
    };

    // Función de login mejorada con sistema de límite de intentos
    const login = async (email, password) => {
        try {
            // Activar estados de login
            setIsLoggingIn(true);
            setLoading(true);
            setAuthError(null);
            setAuthReady(false);
            // Log del inicio del proceso de login
            console.log('Iniciando proceso de login...');

            // Validar email usando validador
            const emailVerification = validators.email(email);
            // Verificar si la validación del email falló
            if (!emailVerification.isValid) {
                setAuthError(emailVerification.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: emailVerification.error };
            }

            // Validar contraseña usando validador
            const passwordValidation = validators.password(password);
            // Verificar si la validación de la contraseña falló
            if (!passwordValidation.isValid) {
                setAuthError(passwordValidation.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: passwordValidation.error };
            }

            // Limpiar y normalizar email
            const cleanEmail = email.trim().toLowerCase();

            // Verificar si la cuenta está bloqueada antes de realizar el login
            const lockStatus = checkAccountLockStatus(cleanEmail);
            if (lockStatus.isLocked) {
                setAuthError(lockStatus.message);
                setIsLoggingIn(false);
                setLoading(false);
                return { 
                    success: false, 
                    message: lockStatus.message,
                    isAccountLocked: true,
                    remainingTime: lockStatus.remainingTime,
                    formattedTime: lockStatus.formattedTime
                };
            }

            // Realizar petición de login al servidor
            const response = await fetch('https://marquesa.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: cleanEmail, password })
            });

            // Parsear respuesta del servidor
            const data = await response.json();
            // Log de la respuesta del login
            console.log('Login response:', data);

            // Verificar si el login fue exitoso
            if (response.ok && (data.message === "login successful" || data.message === "Inicio de sesión exitoso")) {
                // Login exitoso - limpiar intentos fallidos
                RateLimitUtils.clearAttempts(cleanEmail);
                setLockoutInfo(null);

                // Log de login exitoso detectado
                console.log('Login exitoso detectado');

                // Obtener token de la respuesta
                const token = data.token;

                // Verificar que se haya recibido un token
                if (token) {
                    // Guardar token inmediatamente
                    const tokenSaved = await saveTokenToStorage(token);

                    // Verificar que el token se guardó correctamente
                    if (tokenSaved) {
                        // Decodificar token para obtener datos del usuario
                        const decodedToken = decodeToken(token);
                        // Log de token decodificado
                        console.log('Token decodificado exitosamente:', !!decodedToken);

                        // Verificar que el token se decodificó correctamente
                        if (decodedToken) {
                            // Crear objeto de datos del usuario
                            const userData = {
                                id: decodedToken.id,
                                userType: decodedToken.userType || data.userType || 'user'
                            };

                            // Log de configuración de datos del usuario
                            console.log('Configurando datos del usuario:', userData);

                            // Establecer datos del usuario en los estados
                            setUser(userData);
                            setIsAuthenticated(true);
                            setAuthError(null);

                            // Log de obtención de información completa
                            console.log('Obteniendo información completa...');
                            // Obtener información completa del usuario
                            const userInfoResult = await getUserInfo(token);

                            // Verificar que se obtuvo información del usuario
                            if (userInfoResult) {
                                // Log de obtención de favoritos después del login
                                console.log('Obteniendo favoritos después del login...');
                                // Obtener favoritos después del login exitoso
                                await getFavorites(token);

                                // Log de login completado exitosamente
                                console.log('Login completado exitosamente para:', userData.userType);
                                // Marcar autenticación como lista
                                setAuthReady(true);
                                // Log de Auth marcado como listo
                                console.log('Auth marcado como listo para CartContext');

                                // Desactivar estados de login
                                setIsLoggingIn(false);
                                setLoading(false);

                                // Retornar resultado exitoso
                                return {
                                    success: true,
                                    message: data.message,
                                    user: userData,
                                    userType: userData.userType
                                };
                            } else {
                                // Lanzar error si no se pudo obtener información del usuario
                                throw new Error('No se pudo obtener información del usuario');
                            }
                        }
                    } else {
                        // Lanzar error si no se pudo guardar el token
                        throw new Error('No se pudo guardar el token');
                    }
                } else {
                    // Lanzar error si no se recibió token del servidor
                    throw new Error('No se recibió token del servidor');
                }
            } else {
                // Login fallido - registrar intento fallido
                const attemptData = RateLimitUtils.recordFailedAttempt(cleanEmail);
                
                // Obtener mensaje de error del servidor
                let errorMsg = data.message || 'Error en la autenticación';
                
                // Verificar si la cuenta se bloqueó con este intento
                if (attemptData.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
                    const lockDuration = Math.ceil(RATE_LIMIT_CONFIG.lockoutDuration / 60);
                    errorMsg = `Tu cuenta ha sido bloqueada temporalmente por ${lockDuration} minutos debido a múltiples intentos fallidos.`;
                    
                    // Actualizar información de bloqueo
                    const lockInfo = {
                        isLocked: true,
                        remainingTime: RATE_LIMIT_CONFIG.lockoutDuration,
                        formattedTime: RateLimitUtils.formatRemainingTime(RATE_LIMIT_CONFIG.lockoutDuration),
                        message: errorMsg
                    };
                    setLockoutInfo(lockInfo);
                    
                    // Desactivar estados de login
                    setIsLoggingIn(false);
                    setLoading(false);
                    
                    return { 
                        success: false, 
                        message: errorMsg,
                        isAccountLocked: true,
                        remainingTime: RATE_LIMIT_CONFIG.lockoutDuration,
                        formattedTime: lockInfo.formattedTime
                    };
                } else {
                    // Agregar advertencia si está cerca del límite
                    const warning = RateLimitUtils.getAttemptsWarning(cleanEmail);
                    if (warning) {
                        errorMsg += `\n\n${warning}`;
                    }
                }

                // Establecer error en el estado
                setAuthError(errorMsg);
                // Desactivar estados de login
                setIsLoggingIn(false);
                setLoading(false);
                
                return { 
                    success: false, 
                    message: errorMsg,
                    attempts: attemptData.attempts,
                    maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
                    remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - attemptData.attempts)
                };
            }
        } catch (error) {
            // Log de error en el proceso de login
            console.error('Error en el proceso de login:', error);
            // Obtener mensaje de error apropiado
            const errorMsg = error.message || 'Error de conexión con el servidor';
            // Establecer error en el estado
            setAuthError(errorMsg);
            // Desactivar estados de login
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    // Función de logout mejorada
    const logout = async () => {
        try {
            // Activar estado de logout y limpiar errores
            setIsLoggingOut(true);
            setAuthError(null);

            // Log del inicio del proceso de logout
            console.log('Iniciando proceso de logout...');

            // Obtener token del almacenamiento
            const token = await getTokenFromStorage();

            try {
                // Realizar petición de logout al servidor
                const response = await fetch('https://marquesa.onrender.com/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Verificar si la respuesta del servidor fue exitosa
                if (response && response.ok) {
                    console.log('Sesión cerrada correctamente en el servidor');
                } else {
                    console.log('Error al cerrar sesión en el servidor, pero continuando con logout local');
                }
            } catch (serverError) {
                // Log de advertencia por error de red en logout del servidor
                console.warn('Error de red al cerrar sesión en el servidor, continuando localmente:', serverError);
            }

            // Limpiar datos de autenticación localmente
            await clearAuthData(true);

            // Log de logout completado
            console.log('Logout completado correctamente');
            return { success: true };
        } catch (error) {
            // Log de error durante logout
            console.error('Error durante logout:', error);

            // Limpiar datos de autenticación aunque haya error
            await clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            // Desactivar estado de logout sin importar el resultado
            setIsLoggingOut(false);
        }
    };

    // Función para limpiar errores de autenticación
    const clearAuthError = () => {
        setAuthError(null);
    };

    // Función para limpiar errores de favoritos
    const clearFavoritesError = useCallback(() => {
        setFavoritesError(null);
    }, []);

    // Effect para debug de cambios en favoritos
    useEffect(() => {
        // Log de actualización de favoritos para debugging
        console.log('Favorites updated:', {
            favorites,
            isArray: Array.isArray(favorites),
            length: favorites.length,
            type: typeof favorites
        });
    }, [favorites]);

    // Effect principal mejorado
    useEffect(() => {
        // Verificar que no haya procesos de autenticación en curso
        if (!isLoggingOut && !isLoggingIn) {
            // Log de inicialización del AuthProvider
            console.log('Inicializando AuthProvider...');
            // Verificar estado de autenticación
            checkAuthStatus();
        }
    }, [isLoggingOut, isLoggingIn]);

    // Effect para debug de estados de autenticación
    useEffect(() => {
        // Log de estado de autenticación actualizado para debugging
        console.log('Estado de autenticación actualizado:', {
            isAuthenticated,
            hasUser: !!user,
            hasUserInfo: !!userInfo,
            userType: user?.userType,
            favoritesCount: favorites.length,
            isLoggingOut,
            isLoggingIn,
            authReady, 
            loading,
            lockoutInfo: lockoutInfo ? {
                isLocked: lockoutInfo.isLocked,
                remainingTime: lockoutInfo.remainingTime
            } : null
        });
    }, [isAuthenticated, user, userInfo, favorites, isLoggingOut, isLoggingIn, authReady, loading, lockoutInfo]);

    // Effect separado para cargar favoritos sin interferir con el carrito
    useEffect(() => {
        // Función para cargar favoritos cuando esté todo listo
        const loadFavoritesWhenReady = async () => {
            // Verificar que el usuario esté completamente autenticado
            if (isAuthenticated && user?.id && userInfo && !isLoggingIn && !isLoggingOut) {
                // Log de carga de favoritos para usuario autenticado
                console.log('Cargando favoritos (usuario completamente autenticado)...');
                // Cargar favoritos del usuario
                await getFavorites();
            } else if (!isAuthenticated) {
                // Log de limpieza de favoritos para usuario no autenticado
                console.log('Limpiando favoritos (usuario no autenticado)...');
                // Limpiar favoritos si el usuario no está autenticado
                setFavorites([]);
            }
        };

        // Pequeño delay para evitar race conditions
        const timeoutId = setTimeout(loadFavoritesWhenReady, 150);
        // Limpiar timeout al desmontar el component
        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, user?.id, userInfo, isLoggingIn, isLoggingOut, getFavorites]);

    // Asegurar que favorites siempre sea un array
    const safeFavorites = Array.isArray(favorites) ? favorites : [];

    // Objeto de contexto con todos los valores y funciones disponibles
    const contextValue = {
        // Estados de usuario
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        isLoggingOut,
        isLoggingIn,
        authReady, 

        // Estados de favoritos
        favorites: safeFavorites,
        favoritesLoading,
        favoritesError,
        favoritesCount: safeFavorites.length,

        // Estados para sistema de límite de intentos
        lockoutInfo,
        rateLimitConfig: RATE_LIMIT_CONFIG,

        // Funciones de login y autenticación
        login,
        logout,
        register, 
        checkAuthStatus,
        getUserInfo,
        clearAuthError,

        // Funciones de favoritos
        getFavorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        clearFavoritesError,
        clearAllFavorites,
        getFavoriteProduct,
        refreshFavorites,
        fetchFavoriteProducts,
        getBestAvailableToken,
        getProductId,
        normalizeProduct,

        // Funciones para sistema de límite de intentos
        checkAccountLockStatus,
        getAttemptsWarning,

        // Función de limpieza de datos
        clearAuthData,

        // Función para guardar tokens
        saveTokenToStorage
    };

    // Retornar el proveedor del contexto con el valor
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
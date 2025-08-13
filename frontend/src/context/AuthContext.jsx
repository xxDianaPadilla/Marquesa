/**
 * Context de autenticación para la aplicación
 * Maneja el estado de autenticación, login, logout y límite de intentos
 * Implementa verificación híbrida de tokens y compatibilidad cross-domain
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Debe ser usado dentro de un AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

/**
 * Configuración del sistema de límite de intentos de login
 */
const RATE_LIMIT_CONFIG = {
    maxAttempts: 5, // Máximo número de intentos fallidos
    lockoutDuration: 15 * 60, // Duración del bloqueo en segundos (15 minutos)
    warningThreshold: 3 // Número de intentos antes de mostrar advertencia
};

/**
 * Funciones de validación para datos de entrada
 */
const validators = {
    // Validar formato de email
    email: (email) => {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'El email es requerido' };
        }
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return { isValid: false, error: 'El email no puede estar vacío' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'El formato del email no es válido' };
        }
        return { isValid: true, error: null };
    },

    // Validar contraseña
    password: (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'La contraseña es requerida' };
        }
        if (password.length < 8) {
            return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
        }
        return { isValid: true, error: null };
    },

    // Validar token JWT
    token: (token) => {
        if (!token || typeof token !== 'string') {
            return { isValid: false, error: 'Token inválido' };
        }
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { isValid: false, error: 'Formato de token inválido' };
        }
        return { isValid: true, error: null };
    }
};

/**
 * ✅ SISTEMA DE PERSISTENCIA HÍBRIDO
 * Usa localStorage como principal y cookies como respaldo
 */
const TokenStorage = {
    // Claves para almacenamiento
    TOKEN_KEY: 'auth_token_marquesa',
    USER_KEY: 'auth_user_marquesa',
    EXPIRY_KEY: 'auth_expiry_marquesa',

    // Guardar token con expiración
    saveToken: (token, userData, expiryTimestamp) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(TokenStorage.TOKEN_KEY, token);
                localStorage.setItem(TokenStorage.USER_KEY, JSON.stringify(userData));
                localStorage.setItem(TokenStorage.EXPIRY_KEY, expiryTimestamp.toString());
                console.log('✅ Token guardado en localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Error guardando en localStorage:', error);
        }
        return false;
    },

    // Obtener token válido
    getToken: () => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const token = localStorage.getItem(TokenStorage.TOKEN_KEY);
                const expiryStr = localStorage.getItem(TokenStorage.EXPIRY_KEY);

                if (!token || !expiryStr) {
                    console.log('🔍 No hay token o expiración en localStorage');
                    return null;
                }

                const expiry = parseInt(expiryStr);
                const now = Math.floor(Date.now() / 1000);

                if (now >= expiry) {
                    console.log('❌ Token expirado en localStorage');
                    TokenStorage.clearAll();
                    return null;
                }

                console.log('✅ Token válido encontrado en localStorage');
                return token;
            }
        } catch (error) {
            console.error('❌ Error leyendo localStorage:', error);
        }
        return null;
    },

    // Obtener datos de usuario
    getUserData: () => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const userStr = localStorage.getItem(TokenStorage.USER_KEY);
                if (userStr) {
                    return JSON.parse(userStr);
                }
            }
        } catch (error) {
            console.error('❌ Error leyendo user data:', error);
        }
        return null;
    },

    // Limpiar todo
    clearAll: () => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(TokenStorage.TOKEN_KEY);
                localStorage.removeItem(TokenStorage.USER_KEY);
                localStorage.removeItem(TokenStorage.EXPIRY_KEY);
                console.log('🧹 localStorage limpiado');
            }
        } catch (error) {
            console.error('❌ Error limpiando localStorage:', error);
        }
    },

    // Verificar si hay sesión válida
    hasValidSession: () => {
        const token = TokenStorage.getToken();
        const userData = TokenStorage.getUserData();
        return !!(token && userData);
    }
};

/**
 * Utilidades para manejar el sistema de límite de intentos
 */
const RateLimitUtils = {
    // Genera clave única para almacenar intentos por email
    getStorageKey: (email) => `login_attempts_${email.toLowerCase()}`,

    // Obtiene datos de intentos almacenados
    getAttemptData: (email, attemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        return attemptsStorage[key] || { attempts: 0, lockedUntil: null };
    },

    // Guarda datos de intentos en el almacenamiento
    saveAttemptData: (email, data, attemptsStorage, setAttemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        setAttemptsStorage(prev => ({
            ...prev,
            [key]: data
        }));
    },

    // Verifica si una cuenta está bloqueada
    isAccountLocked: (email, attemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);
        if (!data.lockedUntil) return false;
        const now = Date.now();
        if (now >= data.lockedUntil) {
            return false;
        }
        return true;
    },

    // Obtiene tiempo restante de bloqueo
    getRemainingLockTime: (email, attemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);
        if (!data.lockedUntil) return 0;
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));
        return remaining;
    },

    // Registra un intento fallido
    recordFailedAttempt: (email, attemptsStorage, setAttemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);
        const newAttempts = data.attempts + 1;
        let newData = {
            attempts: newAttempts,
            lockedUntil: data.lockedUntil
        };
        // Si alcanza el máximo de intentos, bloquear la cuenta
        if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000;
            newData.lockedUntil = Date.now() + lockDuration;
        }
        RateLimitUtils.saveAttemptData(email, newData, attemptsStorage, setAttemptsStorage);
        return newData;
    },

    // Limpia intentos después de login exitoso
    clearAttempts: (email, attemptsStorage, setAttemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        setAttemptsStorage(prev => {
            const newStorage = { ...prev };
            delete newStorage[key];
            return newStorage;
        });
    },

    // Formatea tiempo restante en formato legible
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
    }
};

/**
 * Proveedor del contexto de autenticación
 * Maneja todo el estado y lógica de autenticación de la aplicación
 * Implementa verificación híbrida de tokens para compatibilidad cross-domain
 */
export const AuthProvider = ({ children }) => {
    // Estados principales del contexto de autenticación
    const [user, setUser] = useState(null); // Datos básicos del usuario autenticado
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
    const [userInfo, setUserInfo] = useState(null); // Información completa del usuario
    const [authError, setAuthError] = useState(null); // Errores de autenticación
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado durante logout
    const [isLoggingIn, setIsLoggingIn] = useState(false); // Estado durante login

    // Estados para el sistema de límite de intentos
    const [attemptsStorage, setAttemptsStorage] = useState({}); // Almacenamiento de intentos en memoria
    const [lockoutInfo, setLockoutInfo] = useState(null); // Información de bloqueo actual
    const [userOrderStats, setUserOrderStats] = useState(null); // Estadísticas de pedidos del usuario

    // Estado para almacenar token en memoria como respaldo (verificación híbrida)
    const [authToken, setAuthToken] = useState(null);

    /**
     * Obtiene el token de autenticación de las cookies del navegador
     * Primera prioridad en la verificación híbrida
     */
    const getTokenFromCookies = () => {
        try {
            if (typeof document === 'undefined') {
                console.log('❌ Document no disponible (SSR)');
                return null;
            }

            const allCookies = document.cookie;
            console.log('🔍 === DEBUGGING COOKIES ===');
            console.log('Todas las cookies raw:', allCookies);
            console.log('Length de cookies:', allCookies.length);

            if (!allCookies || allCookies.trim() === '') {
                console.log('❌ No hay cookies en el documento');
                console.log('Domain actual:', window.location.hostname);
                console.log('Protocol:', window.location.protocol);
                console.log('Secure context:', window.isSecureContext);
                return null;
            }

            const cookies = allCookies.split(';').map(c => c.trim());
            console.log('Cookies parseadas:', cookies);

            const authCookie = cookies.find(cookie => cookie.startsWith('authToken='));
            console.log('Cookie authToken encontrada:', !!authCookie);

            if (!authCookie) {
                console.log('❌ Cookie authToken no encontrada');
                console.log('Cookies disponibles:', cookies.map(c => c.split('=')[0]));
                return null;
            }

            const token = authCookie.split('=')[1];
            console.log('Token extraído (length):', token?.length);
            console.log('Token preview:', token?.substring(0, 30) + '...');

            if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
                console.log('❌ Token vacío o inválido');
                return null;
            }

            console.log('✅ Token válido encontrado en cookies');
            return token.trim();

        } catch (error) {
            console.error('❌ Error al obtener token de cookies:', error);
            return null;
        }
    };
    /**
     * Obtiene el mejor token disponible de múltiples fuentes (verificación híbrida)
     * Prioriza cookies sobre el almacenamiento en memoria
     * Implementa el patrón requerido para compatibilidad cross-domain
     */
    const getBestAvailableToken = () => {
        console.log('🔍 Buscando mejor token disponible...');

        // ✅ PRIORIDAD 1: localStorage (principal)
        const localToken = TokenStorage.getToken();
        if (localToken) {
            console.log('✅ Token encontrado en localStorage');
            return localToken;
        }

        // ✅ PRIORIDAD 2: cookies (respaldo)
        const cookieToken = getTokenFromCookies();
        if (cookieToken) {
            console.log('✅ Token encontrado en cookies');
            return cookieToken;
        }

        // ✅ PRIORIDAD 3: memoria (último respaldo)
        if (authToken) {
            console.log('✅ Token encontrado en memoria');
            return authToken;
        }

        console.log('❌ No hay token disponible en ninguna fuente');
        return null;
    };

    /**
     * Crea headers de autenticación para peticiones HTTP
     * Incluye el token en el header Authorization si está disponible
     * Implementa el patrón híbrido requerido
     */
    const getAuthHeaders = () => {
        const token = getBestAvailableToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    /**
     * Decodifica un token JWT para extraer su contenido
     * Valida estructura y expiración del token
     */
    const decodeToken = (token) => {
        try {
            if (!token) {
                return null;
            }
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            const payload = parts[1];
            if (!payload) {
                return null;
            }
            const decodedPayload = atob(payload);
            const parsedPayload = JSON.parse(decodedPayload);
            if (!parsedPayload || !parsedPayload.id || !parsedPayload.exp) {
                return null;
            }
            // Verificar si el token ha expirado
            const currentTime = Math.floor(Date.now() / 1000);
            if (parsedPayload.exp <= currentTime) {
                return null;
            }
            return parsedPayload;
        } catch (error) {
            return null;
        }
    };

    /**
     * Obtiene las estadísticas de pedidos del usuario
     * Utiliza headers de autenticación híbridos
     */
    const getUserOrderStats = async (userId) => {
        try {
            if (!userId) {
                return null;
            }
            const response = await fetch(`https://marquesa.onrender.com/api/sales/user/${userId}/stats`, {
                method: 'GET',
                credentials: 'include', // Incluir cookies para verificación híbrida
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.success && data.data && data.data.orderStats) {
                    setUserOrderStats(data.data.orderStats);
                    return data.data.orderStats;
                } else {
                    // Establecer estadísticas vacías si no hay datos
                    const emptyStats = {
                        totalOrders: 0,
                        pendingOrders: 0,
                        cancelledOrders: 0,
                        scheduledOrders: 0,
                        inProcessOrders: 0,
                        deliveredOrders: 0
                    };
                    setUserOrderStats(emptyStats);
                    return emptyStats;
                }
            } else {
                // En caso de error, establecer estadísticas vacías
                const emptyStats = {
                    totalOrders: 0,
                    pendingOrders: 0,
                    cancelledOrders: 0,
                    scheduledOrders: 0,
                    inProcessOrders: 0,
                    deliveredOrders: 0
                };
                setUserOrderStats(emptyStats);
                return emptyStats;
            }
        } catch (error) {
            // En caso de error de red, establecer estadísticas vacías
            const emptyStats = {
                totalOrders: 0,
                pendingOrders: 0,
                cancelledOrders: 0,
                scheduledOrders: 0,
                inProcessOrders: 0,
                deliveredOrders: 0
            };
            setUserOrderStats(emptyStats);
            return emptyStats;
        }
    };

    /**
     * Obtiene la información completa del usuario desde el servidor
     * Utiliza headers de autenticación híbridos y credentials para cookies
     */
    const getUserInfo = async () => {
        try {
            const response = await fetch('https://marquesa.onrender.com/api/login/user-info', {
                method: 'GET',
                credentials: 'include', // Incluir cookies para verificación híbrida
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.success && data.user) {
                    setUserInfo(data.user);
                    setAuthError(null);
                    // Obtener estadísticas de pedidos si tenemos el ID del usuario
                    const userId = data.user._id || data.user.id;
                    if (userId) {
                        await getUserOrderStats(userId);
                    }
                    return data.user;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (error) {
            setAuthError('Error al obtener información del usuario');
            return null;
        }
    };

    /**
     * Limpia todos los datos de autenticación del estado y cookies
     */
    const clearAuthData = (isVoluntaryLogout = false) => {
        console.log('🧹 Limpiando datos de autenticación, voluntario:', isVoluntaryLogout);

        try {
            // ✅ LIMPIAR LOCALSTORAGE SIEMPRE
            TokenStorage.clearAll();

            // ✅ LIMPIAR COOKIES SI ES LOGOUT VOLUNTARIO
            if (isVoluntaryLogout && typeof document !== 'undefined') {
                console.log('🧹 Limpiando cookies...');
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; sameSite=none';
            }

            // Limpiar estado de la aplicación
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);
            setUserOrderStats(null);

            if (isVoluntaryLogout) {
                setAuthError(null);
            }

            console.log('✅ Datos de autenticación limpiados completamente');

        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
        }
    };

    /**
     * Verifica el estado de autenticación del usuario al cargar la aplicación
     * Implementa verificación híbrida de tokens
     */
    const checkAuthStatus = async () => {
        try {
            console.log('🔍 === INICIO checkAuthStatus ===');

            if (isLoggingOut || isLoggingIn) {
                console.log('❌ Proceso de auth en curso, saltando verificación');
                return;
            }

            setLoading(true);
            setAuthError(null);

            // ✅ VERIFICAR SESIÓN PERSISTENTE PRIMERO
            console.log('🔍 Verificando sesión persistente...');

            if (TokenStorage.hasValidSession()) {
                const token = TokenStorage.getToken();
                const userData = TokenStorage.getUserData();

                console.log('✅ Sesión persistente encontrada:', {
                    hasToken: !!token,
                    hasUserData: !!userData,
                    userType: userData?.userType
                });

                // Verificar que el token no haya expirado
                const decodedToken = decodeToken(token);
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    console.log('✅ Token válido, restaurando sesión...');

                    // Restaurar estado inmediatamente
                    const userState = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || userData.userType
                    };

                    setUser(userState);
                    setIsAuthenticated(true);
                    setAuthToken(token);

                    // Verificar con servidor en background (no bloquear)
                    setTimeout(async () => {
                        try {
                            const userInfo = await getUserInfo();
                            console.log('✅ Información del usuario actualizada desde servidor');
                        } catch (error) {
                            console.log('⚠️ Error verificando con servidor, manteniendo sesión local');
                        }
                    }, 1000);

                    setLoading(false);
                    console.log('🎉 Sesión restaurada exitosamente');
                    return;
                } else {
                    console.log('❌ Token expirado, limpiando sesión');
                    TokenStorage.clearAll();
                }
            }

            // ✅ FALLBACK: Intentar cookies si localStorage falló
            console.log('🔍 Verificando tokens alternativos...');
            const fallbackToken = getTokenFromCookies() || authToken;

            if (fallbackToken) {
                const decodedToken = decodeToken(fallbackToken);
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    console.log('✅ Token alternativo válido encontrado');

                    const userState = {
                        id: decodedToken.id,
                        userType: decodedToken.userType
                    };

                    setUser(userState);
                    setIsAuthenticated(true);
                    setAuthToken(fallbackToken);

                    // Guardar en localStorage para futuras cargas
                    const expiry = decodedToken.exp;
                    TokenStorage.saveToken(fallbackToken, userState, expiry);

                    setLoading(false);
                    return;
                }
            }

            console.log('❌ No hay sesión válida disponible');
            clearAuthData(false);
            setLoading(false);

        } catch (error) {
            console.error('❌ Error en checkAuthStatus:', error);
            setAuthError('Error al verificar el estado de autenticación');
            clearAuthData(false);
            setLoading(false);
        } finally {
            console.log('🔍 === FIN checkAuthStatus ===');
        }
    };

    /**
     * Verifica si una cuenta está bloqueada por intentos fallidos
     */
    const checkAccountLockStatus = (email) => {
        if (!email) return { isLocked: false };
        const isLocked = RateLimitUtils.isAccountLocked(email, attemptsStorage);
        if (isLocked) {
            const remainingTime = RateLimitUtils.getRemainingLockTime(email, attemptsStorage);
            const formattedTime = RateLimitUtils.formatRemainingTime(remainingTime);
            return {
                isLocked: true,
                remainingTime,
                formattedTime,
                message: `Tu cuenta está temporalmente bloqueada debido a múltiples intentos fallidos. Inténtalo nuevamente en ${formattedTime}.`
            };
        }
        return { isLocked: false };
    };

    const startSessionRefresh = () => {
        // Verificar cada 5 minutos si la sesión sigue activa
        const interval = setInterval(async () => {
            if (isAuthenticated && !isLoggingOut && !isLoggingIn) {
                const token = getBestAvailableToken();

                if (token) {
                    try {
                        const response = await fetch('https://marquesa.onrender.com/api/login/user-info', {
                            method: 'GET',
                            credentials: 'include',
                            headers: getAuthHeaders(),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.token && data.token !== token) {
                                setAuthToken(data.token);
                                console.log('🔄 Token refrescado automáticamente');
                            }
                        } else if (response.status === 401) {
                            // Token expirado, cerrar sesión
                            console.log('❌ Sesión expirada, cerrando automáticamente');
                            await logout();
                        }
                    } catch (error) {
                        console.log('Error en verificación periódica:', error.message);
                    }
                }
            }
        }, 5 * 60 * 1000); // 5 minutos

        return interval;
    };

    /**
     * Obtiene advertencia sobre intentos restantes antes del bloqueo
     */
    const getAttemptsWarning = (email) => {
        if (!email) return null;
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);
        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold &&
            data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `Cuidado: Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }
        return null;
    };

    /**
 * Función principal de inicio de sesión
 * Implementa verificación híbrida de tokens y manejo de respuesta cross-domain
 */
    const login = async (email, password) => {
        try {
            setIsLoggingIn(true);
            setLoading(true);
            setAuthError(null);
            setLockoutInfo(null);

            // Validar datos de entrada
            const emailValidation = validators.email(email);
            if (!emailValidation.isValid) {
                setAuthError(emailValidation.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: emailValidation.error };
            }
            const passwordValidation = validators.password(password);
            if (!passwordValidation.isValid) {
                setAuthError(passwordValidation.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: passwordValidation.error };
            }

            const cleanEmail = email.trim().toLowerCase();

            // Verificar si la cuenta está bloqueada
            const lockStatus = checkAccountLockStatus(cleanEmail);
            if (lockStatus.isLocked) {
                setLockoutInfo({
                    isLocked: true,
                    remainingTime: lockStatus.remainingTime,
                    formattedTime: lockStatus.formattedTime
                });
                setAuthError(lockStatus.message);
                setIsLoggingIn(false);
                setLoading(false);
                return {
                    success: false,
                    message: lockStatus.message,
                    isAccountLocked: true,
                    remainingTime: lockStatus.remainingTime
                };
            }

            console.log('🔐 Enviando request de login...');

            // Realizar petición de login
            const response = await fetch('https://marquesa.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password }),
                credentials: 'include' // Intentar cookies pero no depender
            });

            const data = await response.json();
            console.log('📥 Respuesta del servidor:', {
                success: data.success,
                hasToken: !!data.token,
                tokenExpiry: data.tokenExpiry,
                persistent: data.sessionInfo?.persistent
            });

            if (data.success && data.token) {
                console.log('✅ Login exitoso, procesando token...');

                // Limpiar intentos fallidos
                RateLimitUtils.clearAttempts(cleanEmail, attemptsStorage, setAttemptsStorage);

                const token = data.token;
                const userData = data.user || {
                    id: data.user?.id,
                    userType: data.userType,
                    email: cleanEmail
                };

                // ✅ GUARDAR EN MÚLTIPLES LUGARES
                console.log('💾 Guardando sesión persistente...');

                // 1. localStorage (principal)
                const expiryTimestamp = data.tokenExpiry || (Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60));
                TokenStorage.saveToken(token, userData, expiryTimestamp);

                // 2. Estado en memoria
                setAuthToken(token);

                // 3. Verificar que el token sea válido
                const decodedToken = decodeToken(token);
                if (decodedToken) {
                    const userState = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || userData.userType || 'Customer'
                    };

                    console.log('✅ Estableciendo usuario autenticado:', userState);

                    // Establecer estado de usuario autenticado
                    setUser(userState);
                    setIsAuthenticated(true);
                    setAuthError(null);
                    setLockoutInfo(null);

                    // Obtener información completa
                    try {
                        await getUserInfo();
                    } catch (userInfoError) {
                        console.log('⚠️ Error obteniendo info del usuario, continuando...');
                    }

                    setIsLoggingIn(false);
                    setLoading(false);

                    console.log('🎉 Login completado exitosamente');

                    return {
                        success: true,
                        message: data.message,
                        user: userState,
                        userType: userState.userType
                    };
                } else {
                    console.log('❌ No se pudo decodificar el token');
                    TokenStorage.clearAll();
                }

                const errorMsg = 'Error al procesar el token de autenticación';
                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            } else {
                // Login fallido
                console.log('❌ Login fallido:', data.message);

                const attemptData = RateLimitUtils.recordFailedAttempt(cleanEmail, attemptsStorage, setAttemptsStorage);
                let errorMsg = data.message || 'Error en la autenticación';

                if (attemptData.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
                    const lockDuration = Math.ceil(RATE_LIMIT_CONFIG.lockoutDuration / 60);
                    errorMsg = `Tu cuenta ha sido bloqueada temporalmente por ${lockDuration} minutos debido a múltiples intentos fallidos.`;
                    setLockoutInfo({
                        isLocked: true,
                        remainingTime: RATE_LIMIT_CONFIG.lockoutDuration,
                        formattedTime: RateLimitUtils.formatRemainingTime(RATE_LIMIT_CONFIG.lockoutDuration)
                    });
                } else {
                    const warning = getAttemptsWarning(cleanEmail);
                    if (warning) {
                        errorMsg += `\n\n${warning}`;
                    }
                }

                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            const errorMsg = 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Función de cierre de sesión
     * Utiliza headers de autenticación híbridos y credentials para cookies
     */
    const logout = async () => {
        try {
            setIsLoggingOut(true);
            setAuthError(null);
            setLockoutInfo(null);

            console.log('🚪 Iniciando logout...');

            try {
                // Intentar cerrar sesión en el servidor
                const response = await fetch('https://marquesa.onrender.com/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                });
                console.log('📤 Logout enviado al servidor');
            } catch (serverError) {
                console.log('⚠️ Error de servidor en logout, continuando con logout local');
            }

            // ✅ LIMPIAR COMPLETAMENTE
            clearAuthData(true);

            console.log('✅ Logout completado');
            return { success: true };

        } catch (error) {
            console.error('❌ Error en logout:', error);
            clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            setIsLoggingOut(false);
        }
    };

    /**
     * Limpia errores de autenticación y información de bloqueo
     */
    const clearAuthError = () => {
        setAuthError(null);
        setLockoutInfo(null);
    };

    /**
     * Limpia manualmente los intentos de login para un email específico
     */
    const clearLoginAttempts = (email) => {
        if (!email) return;
        const cleanEmail = email.trim().toLowerCase();
        RateLimitUtils.clearAttempts(cleanEmail, attemptsStorage, setAttemptsStorage);
        setLockoutInfo(null);
        setAuthError(null);
    };

    // Efecto para verificar estado de autenticación al cargar la aplicación
    useEffect(() => {
        let sessionRefreshInterval;

        // Solo iniciar refresh periódico si está autenticado
        if (isAuthenticated && !isLoggingOut && !isLoggingIn) {
            console.log('🔄 Iniciando verificación periódica de sesión');

            sessionRefreshInterval = setInterval(async () => {
                console.log('🔄 Verificación periódica de sesión...');

                const token = getBestAvailableToken();
                if (!token) {
                    console.log('❌ No hay token en verificación periódica');
                    return;
                }

                try {
                    const response = await fetch('https://marquesa.onrender.com/api/login/user-info', {
                        method: 'GET',
                        credentials: 'include',
                        headers: getAuthHeaders(),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.token && data.token !== token) {
                            setAuthToken(data.token);
                            console.log('🔄 Token refrescado automáticamente');
                        }
                    } else if (response.status === 401) {
                        console.log('❌ Sesión expirada, cerrando automáticamente');
                        await logout();
                    }
                } catch (error) {
                    console.log('⚠️ Error en verificación periódica:', error.message);
                }
            }, 5 * 60 * 1000); // 5 minutos
        }

        return () => {
            if (sessionRefreshInterval) {
                clearInterval(sessionRefreshInterval);
                console.log('🔄 Verificación periódica detenida');
            }
        };
    }, [isAuthenticated, isLoggingOut, isLoggingIn]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated && !isLoggingOut && !isLoggingIn) {
                console.log('👁️ Página visible, verificando sesión...');

                // Verificar si el token sigue siendo válido
                const token = getBestAvailableToken();
                if (token) {
                    const decoded = decodeToken(token);
                    if (decoded && decoded.exp * 1000 > Date.now()) {
                        // Token válido, hacer verificación ligera
                        getUserInfo();
                    } else {
                        // Token expirado, limpiar sesión
                        console.log('❌ Token expirado al regresar a la página');
                        clearAuthData(false);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, isLoggingOut, isLoggingIn]);

    useEffect(() => {
        console.log('🔄 Componente AuthContext montado');

        // Solo ejecutar verificación inicial si no hay procesos en curso
        if (!isLoggingOut && !isLoggingIn) {
            console.log('🔍 Iniciando verificación de autenticación...');

            // Pequeño delay para asegurar que las cookies estén disponibles
            const timeoutId = setTimeout(() => {
                checkAuthStatus();
            }, 100);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, []); // Array vacío para ejecutar solo al montar

    // Efecto para manejar el countdown del bloqueo en tiempo real
    useEffect(() => {
        let interval;
        if (lockoutInfo && lockoutInfo.isLocked && lockoutInfo.remainingTime > 0) {
            interval = setInterval(() => {
                const newRemainingTime = lockoutInfo.remainingTime - 1;
                if (newRemainingTime <= 0) {
                    // El bloqueo ha expirado
                    setLockoutInfo(null);
                    setAuthError(null);
                } else {
                    // Actualizar tiempo restante
                    setLockoutInfo(prev => ({
                        ...prev,
                        remainingTime: newRemainingTime,
                        formattedTime: RateLimitUtils.formatRemainingTime(newRemainingTime)
                    }));
                }
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [lockoutInfo]);

    // ✅ NUEVO EFECTO: Detectar cierre de pestaña/navegador
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // Solo limpiar si es cierre real del navegador/pestaña
            // No limpiar en recarga (que es lo que queremos)
            console.log('🚪 Detectado beforeunload');

            // No hacer logout automático aquí porque también se dispara en reload
            // El localStorage se mantiene automáticamente entre recargas
        };

        const handleUnload = () => {
            console.log('🚪 Detectado unload (cerrando pestaña/navegador)');
            // Aquí podríamos hacer logout pero es mejor dejar que expire naturalmente
        };

        // ✅ DETECTAR CIERRE REAL vs RECARGA
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Pestaña oculta - podría ser cierre o cambio de pestaña
                console.log('👁️ Pestaña oculta');
            } else if (document.visibilityState === 'visible') {
                // Pestaña visible - verificar sesión
                if (isAuthenticated && !isLoggingOut && !isLoggingIn) {
                    console.log('👁️ Pestaña visible, verificando sesión...');

                    // Verificar si la sesión sigue válida
                    if (TokenStorage.hasValidSession()) {
                        console.log('✅ Sesión sigue válida');
                    } else {
                        console.log('❌ Sesión expirada, cerrando...');
                        clearAuthData(false);
                    }
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, isLoggingOut, isLoggingIn]);

    // ✅ NUEVO EFECTO: Verificación periódica más inteligente
    useEffect(() => {
        let sessionCheckInterval;

        if (isAuthenticated && !isLoggingOut && !isLoggingIn) {
            console.log('🔄 Iniciando verificación periódica inteligente');

            sessionCheckInterval = setInterval(() => {
                console.log('🔄 Verificación periódica...');

                // Verificar localStorage primero
                if (!TokenStorage.hasValidSession()) {
                    console.log('❌ Sesión localStorage inválida, cerrando...');
                    clearAuthData(false);
                    return;
                }

                // Verificar con servidor cada 15 minutos
                const token = getBestAvailableToken();
                if (token) {
                    fetch('https://marquesa.onrender.com/api/login/user-info', {
                        method: 'GET',
                        credentials: 'include',
                        headers: getAuthHeaders(),
                    })
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            } else if (response.status === 401) {
                                throw new Error('Token inválido');
                            }
                        })
                        .then(data => {
                            if (data.token && data.token !== token) {
                                console.log('🔄 Token actualizado del servidor');
                                setAuthToken(data.token);

                                // Actualizar localStorage
                                const userData = TokenStorage.getUserData();
                                if (userData) {
                                    const expiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
                                    TokenStorage.saveToken(data.token, userData, expiry);
                                }
                            }
                        })
                        .catch(error => {
                            console.log('⚠️ Error en verificación periódica:', error.message);
                            if (error.message === 'Token inválido') {
                                clearAuthData(false);
                            }
                        });
                }
            }, 15 * 60 * 1000); // 15 minutos
        }

        return () => {
            if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval);
                console.log('🔄 Verificación periódica detenida');
            }
        };
    }, [isAuthenticated, isLoggingOut, isLoggingIn]);

    // Valor del contexto que se proporciona a los componentes hijos
    const contextValue = {
        // Estados principales
        user, // Datos básicos del usuario autenticado
        userInfo, // Información completa del usuario
        loading, // Estado de carga
        isAuthenticated, // Estado de autenticación
        authError, // Errores de autenticación
        isLoggingOut, // Estado durante logout
        isLoggingIn, // Estado durante login
        lockoutInfo, // Información de bloqueo actual
        userOrderStats, // Estadísticas de pedidos
        authToken, // Token almacenado en memoria para verificación híbrida

        // Funciones principales
        login, // Función de inicio de sesión
        logout, // Función de cierre de sesión
        checkAuthStatus, // Verificar estado de autenticación
        getUserInfo, // Obtener información del usuario
        clearAuthError, // Limpiar errores
        checkAccountLockStatus, // Verificar bloqueo de cuenta
        getAttemptsWarning, // Obtener advertencias de intentos
        clearLoginAttempts, // Limpiar intentos manualmente
        getUserOrderStats, // Obtener estadísticas de pedidos

        // Agregar setAuthToken al valor del contexto
        setAuthToken, // Función para establecer token en memoria

        // Funciones utilitarias para verificación híbrida
        getBestAvailableToken, // Obtener mejor token disponible
        getAuthHeaders, // Crear headers de autenticación
        getTokenFromCookies, // Obtener token de cookies específicamente

        // Configuración
        rateLimitConfig: RATE_LIMIT_CONFIG // Configuración del sistema de límites
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
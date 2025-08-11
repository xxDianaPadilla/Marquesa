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
                return null;
            }
            const cookies = document.cookie.split(';');
            const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
            if (!authCookie) {
                return null;
            }
            const token = authCookie.split('=')[1];
            return token || null;
        } catch (error) {
            return null;
        }
    };

    /**
     * Obtiene el mejor token disponible de múltiples fuentes (verificación híbrida)
     * Prioriza cookies sobre el almacenamiento en memoria
     * Implementa el patrón requerido para compatibilidad cross-domain
     */
    const getBestAvailableToken = () => {
        // Primera prioridad: cookies (funcionan mejor en misma domain)
        const cookieToken = getTokenFromCookies();
        if (cookieToken) {
            return cookieToken;
        }
        // Segunda prioridad: estado en memoria (respaldo para cross-domain)
        if (authToken) {
            return authToken;
        }
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
        try {
            // Limpiar cookie del navegador con configuración cross-domain
            if (typeof document !== 'undefined') {
                // Limpiar con todas las configuraciones posibles para asegurar eliminación
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;';
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; sameSite=none';
            }
            // Limpiar estado de la aplicación
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);
            // Solo limpiar errores si es logout voluntario
            if (isVoluntaryLogout) {
                setAuthError(null);
            }
        } catch (error) {
            // Error al limpiar datos, pero continuar
        }
    };

    /**
     * Verifica el estado de autenticación del usuario al cargar la aplicación
     * Implementa verificación híbrida de tokens
     */
    const checkAuthStatus = async () => {
        try {
            // No verificar si hay procesos de autenticación en curso
            if (isLoggingOut || isLoggingIn) {
                return;
            }
            setLoading(true);
            setAuthError(null);
            const token = getBestAvailableToken();
            if (token) {
                const decodedToken = decodeToken(token);
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    const userData = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || 'user'
                    };
                    setUser(userData);
                    setIsAuthenticated(true);
                    setAuthToken(token); // Guardar token en memoria para verificación híbrida
                    await getUserInfo(); // Obtener información completa
                } else {
                    clearAuthData(false);
                }
            } else {
                clearAuthData(false);
            }
        } catch (error) {
            setAuthError('Error al verificar el estado de autenticación');
            clearAuthData(false);
        } finally {
            if (!isLoggingIn) {
                setLoading(false);
            }
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

            // Realizar petición de login al servidor con credentials para cookies
            const response = await fetch('https://marquesa.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password }),
                credentials: 'include' // Incluir cookies para verificación híbrida
            });

            const data = await response.json();

            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                // Login exitoso
                RateLimitUtils.clearAttempts(cleanEmail, attemptsStorage, setAttemptsStorage);

                // Obtener token de múltiples fuentes (verificación híbrida)
                let token = null;
                
                // Primera prioridad: token en response body
                if (data.token) {
                    token = data.token;
                    setAuthToken(token); // Guardar en memoria
                }
                
                // Segunda prioridad: esperar por cookie con timeout
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getTokenFromCookies();
                    if (token) {
                        setAuthToken(token); // Guardar en memoria también
                    }
                }

                if (token) {
                    const decodedToken = decodeToken(token);
                    if (decodedToken) {
                        const userData = {
                            id: decodedToken.id,
                            userType: decodedToken.userType || data.userType || 'user'
                        };
                        // Establecer estado de usuario autenticado
                        setUser(userData);
                        setIsAuthenticated(true);
                        setAuthError(null);
                        setLockoutInfo(null);
                        // Obtener información completa del usuario
                        const userInfoResult = await getUserInfo();
                        setIsLoggingIn(false);
                        setLoading(false);
                        await new Promise(resolve => setTimeout(resolve, 200));
                        return {
                            success: true,
                            message: data.message,
                            user: userData,
                            userType: userData.userType
                        };
                    }
                }
                const errorMsg = 'Error al procesar el token de autenticación';
                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            } else {
                // Login fallido - registrar intento
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

            try {
                // Intentar cerrar sesión en el servidor con verificación híbrida
                const response = await fetch('https://marquesa.onrender.com/api/logout', {
                    method: 'POST',
                    credentials: 'include', // Incluir cookies para verificación híbrida
                    headers: getAuthHeaders(),
                });
                // Continuar con logout local independientemente de la respuesta del servidor
            } catch (serverError) {
                // Error de servidor, pero continuar con logout local
            }

            // Limpiar datos locales
            clearAuthData(true);
            return { success: true };

        } catch (error) {
            // Aún así limpiar datos locales en caso de error
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
        if (!isLoggingOut && !isLoggingIn) {
            checkAuthStatus();
        }
    }, [isLoggingOut, isLoggingIn]);

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
/**
 * Context de autenticación para la aplicación - COMENTARIOS ACTUALIZADOS
 * 
 * NOTA: No se requieren cambios en este archivo para la nueva funcionalidad 401.
 * El AuthContext mantiene toda su funcionalidad existente, pero ahora trabaja
 * en conjunto con el ProtectedRoutes modificado para mostrar páginas 401.
 * 
 * FUNCIONALIDADES EXISTENTES QUE SIGUEN FUNCIONANDO:
 * - Estado isLoggingOut para evitar interferencias durante logout
 * - Mejor manejo de transiciones de estado
 * - Evita redirecciones a páginas 401 durante procesos normales
 * - Mantiene todas las funcionalidades de autenticación
 * 
 * CÓMO TRABAJA CON EL NUEVO SISTEMA:
 * - Los estados isLoggingIn/isLoggingOut previenen mostrar 401 durante transiciones
 * - El estado loading evita mostrar 401 durante verificaciones iniciales
 * - Los estados de autenticación se usan en ProtectedRoutes para decidir 401 vs 403
 * 
 * Ubicación: frontend/src/context/AuthContext.jsx
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns {Object} Contexto de autenticación con user, login, logout, etc.
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

/**
 * Configuración del sistema de límite de intentos
 */
const RATE_LIMIT_CONFIG = {
    maxAttempts: 5,              // Máximo 5 intentos fallidos
    lockoutDuration: 15 * 60,    // 15 minutos de bloqueo (en segundos)
    warningThreshold: 3          // Mostrar advertencia después de 3 intentos
};

/**
 * Validaciones básicas y no restrictivas
 * NOTA: Estas validaciones siguen siendo las mismas, sin cambios requeridos
 */
const validators = {
    /**
     * Valida el formato de email de manera básica
     */
    email: (email) => {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'El email es requerido' };
        }

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return { isValid: false, error: 'El email no puede estar vacío' };
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'El formato del email no es válido' };
        }

        return { isValid: true, error: null };
    },

    /**
     * Valida la contraseña de manera básica
     */
    password: (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'La contraseña es requerida' };
        }

        if (password.length < 8) {
            return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
        }

        return { isValid: true, error: null };
    },

    /**
     * Valida el token JWT básico
     */
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
 * Utilidades para manejo de límite de intentos de login
 */
const RateLimitUtils = {
    /**
     * Obtiene la clave para almacenar intentos por email
     */
    getStorageKey: (email) => `login_attempts_${email.toLowerCase()}`,

    /**
     * Obtiene los datos de intentos desde memoria (no localStorage)
     */
    getAttemptData: (email, attemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        return attemptsStorage[key] || { attempts: 0, lockedUntil: null };
    },

    /**
     * Guarda los datos de intentos en memoria
     */
    saveAttemptData: (email, data, attemptsStorage, setAttemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        setAttemptsStorage(prev => ({
            ...prev,
            [key]: data
        }));
    },

    /**
     * Verifica si una cuenta está bloqueada
     */
    isAccountLocked: (email, attemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);

        if (!data.lockedUntil) return false;

        const now = Date.now();
        if (now >= data.lockedUntil) {
            // El bloqueo ha expirado
            return false;
        }

        return true;
    },

    /**
     * Obtiene el tiempo restante de bloqueo en segundos
     */
    getRemainingLockTime: (email, attemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);

        if (!data.lockedUntil) return 0;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((data.lockedUntil - now) / 1000));

        return remaining;
    },

    /**
     * Registra un intento fallido
     */
    recordFailedAttempt: (email, attemptsStorage, setAttemptsStorage) => {
        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);
        const newAttempts = data.attempts + 1;

        let newData = {
            attempts: newAttempts,
            lockedUntil: data.lockedUntil
        };

        // Si se alcanza el máximo de intentos, bloquear la cuenta
        if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            const lockDuration = RATE_LIMIT_CONFIG.lockoutDuration * 1000; // Convertir a millisegundos
            newData.lockedUntil = Date.now() + lockDuration;

            console.warn(`Cuenta bloqueada por ${RATE_LIMIT_CONFIG.lockoutDuration / 60} minutos: ${email}`);
        }

        RateLimitUtils.saveAttemptData(email, newData, attemptsStorage, setAttemptsStorage);
        return newData;
    },

    /**
     * Limpia los intentos después de un login exitoso
     */
    clearAttempts: (email, attemptsStorage, setAttemptsStorage) => {
        const key = RateLimitUtils.getStorageKey(email);
        setAttemptsStorage(prev => {
            const newStorage = { ...prev };
            delete newStorage[key];
            return newStorage;
        });

        console.log(`Intentos de login limpiados para: ${email}`);
    },

    /**
     * Formatea el tiempo restante para mostrar al usuario
     */
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
 * Proveedor del contexto de autenticación con sistema de límite de intentos
 */
export const AuthProvider = ({ children }) => {
    // Estados del contexto de autenticación (EXISTENTES - Sin cambios)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [authError, setAuthError] = useState(null);

    // Estados para manejo de páginas de error (EXISTENTES - Sin cambios)
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // NUEVOS ESTADOS para el sistema de límite de intentos
    const [attemptsStorage, setAttemptsStorage] = useState({}); // Almacenamiento en memoria de intentos
    const [lockoutInfo, setLockoutInfo] = useState(null); // Info de bloqueo para mostrar al usuario

    /**
     * Obtiene el token de autenticación de las cookies
     * (FUNCIÓN EXISTENTE - Sin cambios)
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
            console.error('Error al obtener el token de las cookies:', error);
            return null;
        }
    };

    /**
     * Decodifica un token JWT - simplificado
     * (FUNCIÓN EXISTENTE - Sin cambios)
     */
    const decodeToken = (token) => {
        try {
            if (!token) {
                return null;
            }

            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('Token con formato inválido');
                return null;
            }

            const payload = parts[1];
            if (!payload) {
                console.error('Payload del token vacío');
                return null;
            }

            const decodedPayload = atob(payload);
            const parsedPayload = JSON.parse(decodedPayload);

            // Validación mínima - solo verificar que existan los campos básicos
            if (!parsedPayload || !parsedPayload.id || !parsedPayload.exp) {
                console.error('Token no contiene campos requeridos');
                return null;
            }

            // Verificar expiración
            const currentTime = Math.floor(Date.now() / 1000);
            if (parsedPayload.exp <= currentTime) {
                console.info('El token ha expirado');
                return null;
            }

            return parsedPayload;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    /**
     * Obtiene información completa del usuario desde el servidor
     * (FUNCIÓN EXISTENTE - Sin cambios)
     */
    const getUserInfo = async () => {
        try {
            console.log('Obteniendo información del usuario...');

            const response = await fetch('http://localhost:4000/api/login/user-info', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta getUserInfo:', data);

                if (data && data.success && data.user) {
                    console.log('Información del usuario obtenida:', data.user);
                    setUserInfo(data.user);
                    setAuthError(null);
                    return data.user;
                } else {
                    console.warn('Respuesta sin éxito:', data?.message);
                    return null;
                }
            } else {
                console.error('Error en respuesta del servidor:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener información del usuario:', error);
            setAuthError('Error al obtener información del usuario');
            return null;
        }
    };

    /**
     * Limpia todos los datos de autenticación
     * (FUNCIÓN EXISTENTE - Sin cambios)
     */
    const clearAuthData = (isVoluntaryLogout = false) => {
        try {
            console.log('Limpiando datos de autenticación...', { isVoluntaryLogout });

            if (typeof document !== 'undefined') {
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }

            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);

            // Solo limpiar errores si es logout voluntario o login fallido
            if (isVoluntaryLogout) {
                setAuthError(null);
            }
        } catch (error) {
            console.error('Error al limpiar los datos de autenticación:', error);
        }
    };

    /**
     * Verifica el estado de autenticación del usuario
     * (FUNCIÓN EXISTENTE - Sin cambios)
     */
    const checkAuthStatus = async () => {
        try {
            // No verificar si se está haciendo login o logout
            if (isLoggingOut || isLoggingIn) {
                console.log('Proceso de autenticación en progreso, saltando verificación');
                return;
            }

            setLoading(true);
            setAuthError(null);

            console.log('Verificando estado de autenticación...');

            const token = getTokenFromCookies();

            if (token) {
                console.log('Token encontrado, decodificando...');
                const decodedToken = decodeToken(token);

                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    console.log('Token válido, configurando usuario...');

                    // Crear userData con valores del token
                    const userData = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || 'user'
                    };

                    setUser(userData);
                    setIsAuthenticated(true);

                    // Obtener información completa del usuario
                    console.log('Obteniendo información completa del usuario...');
                    await getUserInfo();
                } else {
                    console.info('Token expirado o inválido');
                    clearAuthData(false);
                }
            } else {
                console.info('No se encontró token');
                clearAuthData(false);
            }
        } catch (error) {
            console.error('Error al verificar la autenticación:', error);
            setAuthError('Error al verificar el estado de autenticación');
            clearAuthData(false);
        } finally {
            // Solo marcar como no loading si NO estamos en proceso de login
            if (!isLoggingIn) {
                setLoading(false);
            }
        }
    };

    /**
     * NUEVA FUNCIÓN: Verifica si un email está bloqueado antes del login
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
     * NUEVA FUNCIÓN: Obtiene información de advertencia sobre intentos restantes
     */
    const getAttemptsWarning = (email) => {
        if (!email) return null;

        const data = RateLimitUtils.getAttemptData(email, attemptsStorage);

        if (data.attempts >= RATE_LIMIT_CONFIG.warningThreshold && data.attempts < RATE_LIMIT_CONFIG.maxAttempts) {
            const remaining = RATE_LIMIT_CONFIG.maxAttempts - data.attempts;
            return `Cuidado: Te quedan ${remaining} intento${remaining === 1 ? '' : 's'} antes de que tu cuenta sea bloqueada temporalmente.`;
        }

        return null;
    };

    /**
     * Función de login MEJORADA con sistema de límite de intentos
     */
    const login = async (email, password) => {
        try {
            setIsLoggingIn(true);
            setLoading(true);
            setAuthError(null);
            setLockoutInfo(null); // Limpiar info de bloqueo previa

            console.log('Iniciando proceso de login con verificación de límites...');

            // Validación básica de entrada
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

            // NUEVA VERIFICACIÓN: Comprobar si la cuenta está bloqueada
            const lockStatus = checkAccountLockStatus(cleanEmail);
            if (lockStatus.isLocked) {
                console.warn('Intento de login en cuenta bloqueada:', cleanEmail);

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

            // Proceder con el login normal
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log('📡 Login response:', data);

            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                console.log('Login exitoso detectado');

                // NUEVO: Limpiar intentos fallidos después de login exitoso
                RateLimitUtils.clearAttempts(cleanEmail, attemptsStorage, setAttemptsStorage);

                // Esperar para que se establezca la cookie
                await new Promise(resolve => setTimeout(resolve, 800));

                const token = getTokenFromCookies();
                console.log('Token encontrado después del login:', !!token);

                if (token) {
                    const decodedToken = decodeToken(token);
                    console.log('Token decodificado exitosamente:', !!decodedToken);

                    if (decodedToken) {
                        const userData = {
                            id: decodedToken.id,
                            userType: decodedToken.userType || data.userType || 'user'
                        };

                        console.log('Configurando datos del usuario:', userData);

                        // Configurar todos los estados de una vez
                        setUser(userData);
                        setIsAuthenticated(true);
                        setAuthError(null);
                        setLockoutInfo(null);

                        // Obtener información completa del usuario
                        console.log('Obteniendo información completa...');
                        const userInfoResult = await getUserInfo();
                        console.log('Información del usuario obtenida:', !!userInfoResult);

                        // Finalizar todos los procesos ANTES de retornar
                        setIsLoggingIn(false);
                        setLoading(false);

                        // Esperar para asegurar que el estado se propagó
                        await new Promise(resolve => setTimeout(resolve, 200));

                        console.log('Login completado exitosamente para:', userData.userType);

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
                // NUEVO: Registrar intento fallido
                console.log('Login fallido, registrando intento:', cleanEmail);

                const attemptData = RateLimitUtils.recordFailedAttempt(cleanEmail, attemptsStorage, setAttemptsStorage);

                let errorMsg = data.message || 'Error en la autenticación';

                // Verificar si la cuenta se bloqueó con este intento
                if (attemptData.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
                    const lockDuration = Math.ceil(RATE_LIMIT_CONFIG.lockoutDuration / 60);
                    errorMsg = `Tu cuenta ha sido bloqueada temporalmente por ${lockDuration} minutos debido a múltiples intentos fallidos.`;

                    setLockoutInfo({
                        isLocked: true,
                        remainingTime: RATE_LIMIT_CONFIG.lockoutDuration,
                        formattedTime: RateLimitUtils.formatRemainingTime(RATE_LIMIT_CONFIG.lockoutDuration)
                    });
                } else {
                    // Mostrar advertencia si está cerca del límite
                    const warning = getAttemptsWarning(cleanEmail);
                    if (warning) {
                        errorMsg += `\n\n⚠️ ${warning}`;
                    }
                }

                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            const errorMsg = 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Función de logout - FUNCIONALIDAD EXISTENTE sin cambios
     */
    const logout = async () => {
        try {
            setIsLoggingOut(true);
            setAuthError(null);
            setLockoutInfo(null); // Limpiar info de bloqueo

            console.log('Iniciando proceso de logout...');

            try {
                // Intentar hacer logout en el servidor
                const response = await fetch('http://localhost:4000/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response && response.ok) {
                    console.log('Sesión cerrada correctamente en el servidor');
                } else {
                    console.warn('Error al cerrar sesión en el servidor, pero continuando con logout local');
                }
            } catch (serverError) {
                console.warn('Error de red al cerrar sesión en el servidor, continuando localmente:', serverError);
            }

            // Limpiar datos locales
            clearAuthData(true);

            console.log('Logout completado correctamente');
            return { success: true };

        } catch (error) {
            console.error('Error durante logout:', error);
            // Aún así limpiar datos locales
            clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            setIsLoggingOut(false);
        }
    };

    /**
     * Limpia errores de autenticación
     * MEJORADA para limpiar también info de bloqueo
     */
    const clearAuthError = () => {
        setAuthError(null);
        setLockoutInfo(null);
    };

    /**
     * NUEVA FUNCIÓN: Limpia manualmente los intentos de un email (uso administrativo)
     */
    const clearLoginAttempts = (email) => {
        if (!email) return;

        const cleanEmail = email.trim().toLowerCase();
        RateLimitUtils.clearAttempts(cleanEmail, attemptsStorage, setAttemptsStorage);

        // Si se está limpiando el email actual, también limpiar la UI
        setLockoutInfo(null);
        setAuthError(null);

        console.log('Intentos de login limpiados manualmente para:', cleanEmail);
    };

    // Verificar estado de autenticación al cargar la aplicación
    useEffect(() => {
        if (!isLoggingOut && !isLoggingIn) {
            console.log('Inicializando AuthProvider...');
            checkAuthStatus();
        }
    }, [isLoggingOut, isLoggingIn]);

    // Debug: Mostrar cambios en el estado
    useEffect(() => {
        console.log('Estado de autenticación actualizado:', {
            isAuthenticated,
            hasUser: !!user,
            hasUserInfo: !!userInfo,
            userType: user?.userType,
            isLoggingOut,
            isLoggingIn,
            hasLockoutInfo: !!lockoutInfo
        });
    }, [isAuthenticated, user, userInfo, isLoggingOut, isLoggingIn, lockoutInfo]);

    // NUEVO: Efecto para manejar el countdown del bloqueo en tiempo real
    useEffect(() => {
        let interval;

        if (lockoutInfo && lockoutInfo.isLocked && lockoutInfo.remainingTime > 0) {
            interval = setInterval(() => {
                const newRemainingTime = lockoutInfo.remainingTime - 1;

                if (newRemainingTime <= 0) {
                    // El bloqueo ha expirado
                    setLockoutInfo(null);
                    setAuthError(null);
                    console.log('Bloqueo de cuenta expirado');
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

    // Valor del contexto EXPANDIDO con nuevas funcionalidades
    const contextValue = {
        // Estados existentes
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        isLoggingOut,
        isLoggingIn,

        // NUEVOS ESTADOS para límite de intentos
        lockoutInfo,                    // Información sobre bloqueo actual

        // Funciones existentes
        login,
        logout,
        checkAuthStatus,
        getUserInfo,
        clearAuthError,

        // NUEVAS FUNCIONES para límite de intentos
        checkAccountLockStatus,         // Verificar si una cuenta está bloqueada
        getAttemptsWarning,            // Obtener advertencia sobre intentos restantes
        clearLoginAttempts,            // Limpiar intentos manualmente (uso administrativo)

        // NUEVAS CONSTANTES útiles para la UI
        rateLimitConfig: RATE_LIMIT_CONFIG  // Configuración del sistema para mostrar en UI
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
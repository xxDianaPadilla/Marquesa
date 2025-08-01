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
 * Proveedor del contexto de autenticación
 * NOTA: Todos los estados y funciones mantienen su funcionalidad original
 */
export const AuthProvider = ({ children }) => {
    // Estados del contexto de autenticación (EXISTENTES - Sin cambios)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [authError, setAuthError] = useState(null);
    
    // Estados para manejo de páginas de error (EXISTENTES - Sin cambios)
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Evita interferencias durante logout
    const [isLoggingIn, setIsLoggingIn] = useState(false); // Evita interferencias durante login

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
     * (FUNCIÓN EXISTENTE - Sin cambios, pero importante para el nuevo sistema)
     * 
     * IMPORTANTE: Esta función es clave para el nuevo comportamiento 401
     * - No ejecuta durante procesos de login/logout (previene mostrar 401 incorrectamente)
     * - Establece los estados que ProtectedRoutes usa para determinar 401 vs redirección
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
                    clearAuthData(false); // No es logout voluntario
                }
            } else {
                console.info('No se encontró token');
                clearAuthData(false); // No es logout voluntario
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
     * Función de login - FUNCIONALIDAD CLAVE PARA EL NUEVO SISTEMA 401
     * (FUNCIÓN EXISTENTE - Sin cambios pero crítica)
     * 
     * IMPORTANTE: Los estados isLoggingIn que maneja esta función previenen
     * que se muestren páginas 401 durante el proceso normal de login
     */
    const login = async (email, password) => {
        try {
            setIsLoggingIn(true); // CRÍTICO: Previene mostrar 401 durante login
            setLoading(true);
            setAuthError(null);
            console.log('🔐 Iniciando proceso de login...');
            
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

            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log('📡 Login response:', data);

            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                console.log('✅ Login exitoso detectado');
                
                // Esperar para que se establezca la cookie
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const token = getTokenFromCookies();
                console.log('🎫 Token encontrado después del login:', !!token);
                
                if (token) {
                    const decodedToken = decodeToken(token);
                    console.log('🔍 Token decodificado exitosamente:', !!decodedToken);
                    
                    if (decodedToken) {
                        const userData = {
                            id: decodedToken.id,
                            userType: decodedToken.userType || data.userType || 'user'
                        };
                        
                        console.log('👤 Configurando datos del usuario:', userData);
                        
                        // Configurar todos los estados de una vez
                        setUser(userData);
                        setIsAuthenticated(true);
                        setAuthError(null);
                        
                        // Obtener información completa del usuario
                        console.log('📋 Obteniendo información completa...');
                        const userInfoResult = await getUserInfo();
                        console.log('📋 Información del usuario obtenida:', !!userInfoResult);
                        
                        // CRÍTICO: Finalizar todos los procesos ANTES de retornar
                        setIsLoggingIn(false);
                        setLoading(false);
                        
                        // Esperar para asegurar que el estado se propagó
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        console.log('🎉 Login completado exitosamente para:', userData.userType);
                        
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
                const errorMsg = data.message || 'Error en la autenticación';
                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('❌ Error en el proceso de login:', error);
            const errorMsg = 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Función de logout - FUNCIONALIDAD CLAVE PARA EL NUEVO SISTEMA 401
     * (FUNCIÓN EXISTENTE - Sin cambios pero crítica)
     * 
     * IMPORTANTE: Los estados isLoggingOut que maneja esta función previenen
     * que se muestren páginas 401 durante el proceso normal de logout
     */
    const logout = async () => {
        try {
            setIsLoggingOut(true); // CRÍTICO: Previene mostrar 401 durante logout
            setAuthError(null);
            
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
            clearAuthData(true); // Marcar como logout voluntario
            
            console.log('Logout completado correctamente');
            return { success: true };

        } catch (error) {
            console.error('Error durante logout:', error);
            // Aún así limpiar datos locales
            clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            setIsLoggingOut(false); // CRÍTICO: Finalizar proceso de logout
        }
    };

    /**
     * Limpia errores de autenticación
     * (FUNCIÓN EXISTENTE - Sin cambios)
     */
    const clearAuthError = () => {
        setAuthError(null);
    };

    // Verificar estado de autenticación al cargar la aplicación
    // Solo si no hay procesos de auth en curso
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
            isLoggingIn
        });
    }, [isAuthenticated, user, userInfo, isLoggingOut, isLoggingIn]);

    // Valor del contexto (TODOS LOS ESTADOS EXISTENTES)
    const contextValue = {
        // Estados existentes - CRÍTICOS para el nuevo sistema 401
        user,                  // Usado por ProtectedRoutes para determinar autenticación
        userInfo,             // Información completa del usuario
        loading,              // Usado por ProtectedRoutes para evitar mostrar 401 durante carga
        isAuthenticated,      // Estado principal de autenticación
        authError,            // Errores de autenticación
        
        // Estados para páginas de error - CRÍTICOS para prevenir 401 durante transiciones
        isLoggingOut,         // Previene mostrar 401 durante logout
        isLoggingIn,          // Previene mostrar 401 durante login
        
        // Funciones existentes
        login,                // Función de login que maneja isLoggingIn
        logout,               // Función de logout que maneja isLoggingOut
        checkAuthStatus,      // Verificación de estado
        getUserInfo,          // Obtener información del usuario
        clearAuthError        // Limpiar errores
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
/**
 * Context de autenticación para la aplicación
 * Maneja el estado global de autenticación del usuario, login, logout
 * y verificación del estado de autenticación mediante cookies
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
 */
export const AuthProvider = ({ children }) => {
    // Estados del contexto de autenticación
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [authError, setAuthError] = useState(null);

    /**
     * Obtiene el token de autenticación de las cookies
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
     */
    const getUserInfo = async () => {
        try {
            if (!isAuthenticated) {
                return null;
            }

            const response = await fetch('http://localhost:4000/api/login/user-info', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data && data.success && data.user) {
                    setUserInfo(data.user);
                    setAuthError(null);
                    return data.user;
                } else {
                    console.error('Respuesta de información de usuario sin éxito:', data?.message);
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
     * Verifica el estado de autenticación del usuario
     */
    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            setAuthError(null);
            
            const token = getTokenFromCookies();
            
            if (token) {
                const decodedToken = decodeToken(token);
                
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    // Crear userData con valores por defecto si no existen
                    const userData = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || 'user' // Valor por defecto
                    };
                    
                    setUser(userData);
                    setIsAuthenticated(true);
                    await getUserInfo();
                } else {
                    console.info('Token expirado o inválido');
                    clearAuthData();
                }
            } else {
                clearAuthData();
            }
        } catch (error) {
            console.error('Error al verificar la autenticación:', error);
            setAuthError('Error al verificar el estado de autenticación');
            clearAuthData();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Limpia todos los datos de autenticación
     */
    const clearAuthData = () => {
        try {
            if (typeof document !== 'undefined') {
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
            
            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);
            setAuthError(null);
        } catch (error) {
            console.error('Error al limpiar los datos de autenticación:', error);
        }
    };

    /**
     * Función de login simplificada
     */
    const login = async (email, password) => {
        try {
            setAuthError(null);
            
            // Validación básica de entrada
            const emailValidation = validators.email(email);
            if (!emailValidation.isValid) {
                setAuthError(emailValidation.error);
                return { success: false, message: emailValidation.error };
            }
            
            const passwordValidation = validators.password(password);
            if (!passwordValidation.isValid) {
                setAuthError(passwordValidation.error);
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
            console.log('Login response:', data);

            // Aceptar ambos mensajes posibles de éxito
            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                console.log('✅ Login exitoso detectado');
                
                // Esperar para que se establezca la cookie
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const token = getTokenFromCookies();
                console.log('Token encontrado:', !!token);
                
                if (token) {
                    const decodedToken = decodeToken(token);
                    console.log('Token decodificado:', !!decodedToken);
                    
                    if (decodedToken) {
                        const userData = {
                            id: decodedToken.id,
                            userType: decodedToken.userType || data.userType || 'user' // Múltiples fuentes para userType
                        };
                        
                        setUser(userData);
                        setIsAuthenticated(true);
                        setAuthError(null);
                        
                        console.log('Estado actualizado:', userData);
                        
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
                return { success: false, message: errorMsg };
            } else {
                const errorMsg = data.message || 'Error en la autenticación';
                setAuthError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            const errorMsg = 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            return { success: false, message: errorMsg };
        }
    };

    /**
     * Función de logout
     */
    const logout = async () => {
        try {
            setAuthError(null);
            
            const response = await fetch('http://localhost:4000/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearAuthData();

            if (response && response.ok) {
                console.log('Sesión cerrada correctamente en el servidor');
                return { success: true };
            } else {
                console.warn('Error al cerrar sesión en el servidor, pero el estado local fue limpiado');
                return { success: true, warning: 'Sesión cerrada localmente' };
            }
        } catch (error) {
            console.error('Error de red al cerrar sesión:', error);
            clearAuthData();
            return { success: true, warning: 'Sesión cerrada localmente' };
        }
    };

    /**
     * Limpia errores de autenticación
     */
    const clearAuthError = () => {
        setAuthError(null);
    };

    // Verificar estado de autenticación al cargar la aplicación
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Valor del contexto
    const contextValue = {
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        login,
        logout,
        checkAuthStatus,
        getUserInfo,
        clearAuthError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
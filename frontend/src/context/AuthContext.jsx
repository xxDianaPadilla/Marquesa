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
 * Proveedor del contexto de autenticación
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const AuthProvider = ({ children }) => {
    // Estados del contexto de autenticación
    const [user, setUser] = useState(null); // Información básica del usuario
    const [loading, setLoading] = useState(true); // Estado de carga
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
    const [userInfo, setUserInfo] = useState(null); // Información completa del usuario

    /**
     * Obtiene el token de autenticación de las cookies
     * @returns {string|null} Token de autenticación o null si no existe
     */
    const getTokenFromCookies = () => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        return authCookie ? authCookie.split('=')[1] : null;
    };

    /**
     * Decodifica un token JWT para extraer la información del payload
     * @param {string} token - Token JWT a decodificar
     * @returns {Object|null} Payload decodificado o null si hay error
     */
    const decodeToken = (token) => {
        try {
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error decoding token: ', error);
            return null;
        }
    };

    /**
     * Obtiene información completa del usuario desde el servidor
     * @returns {Object|null} Información del usuario o null si hay error
     */
    const getUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/login/user-info', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUserInfo(data.user);
                    return data.user;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    };

    // Verificar estado de autenticación al cargar la aplicación
    useEffect(() => {
        checkAuthStatus();
    }, []);

    /**
     * Verifica el estado de autenticación del usuario
     * Comprueba si existe un token válido en las cookies
     */
    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const token = getTokenFromCookies();
            
            if (token) {
                const decodedToken = decodeToken(token);
                
                // Verificar si el token es válido y no ha expirado
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    setUser({
                        id: decodedToken.id,
                        userType: decodedToken.userType
                    });
                    setIsAuthenticated(true);
                    await getUserInfo();
                } else {
                    clearAuthData();
                }
            } else {
                clearAuthData();
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            clearAuthData();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Limpia todos los datos de autenticación del estado y cookies
     */
    const clearAuthData = () => {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
        setIsAuthenticated(false);
        setUserInfo(null);
    };

    /**
     * Función de login - autentica al usuario con email y password
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Object} Resultado del login con success, message y datos del usuario
     */
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Login response:', data);

            // Aceptar ambos mensajes posibles de éxito
            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                console.log('✅ Login exitoso detectado');
                
                // Esperar para que se establezca la cookie
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Obtener y verificar token
                const token = getTokenFromCookies();
                console.log('Token encontrado:', !!token);
                
                if (token) {
                    const decodedToken = decodeToken(token);
                    console.log('Token decodificado:', decodedToken);
                    
                    if (decodedToken) {
                        const userData = {
                            id: decodedToken.id,
                            userType: decodedToken.userType
                        };
                        
                        // Actualizar estado de autenticación
                        setUser(userData);
                        setIsAuthenticated(true);
                        
                        console.log('Estado actualizado:', userData);
                        
                        return { 
                            success: true, 
                            message: data.message, 
                            user: userData,
                            userType: data.userType // También incluir del response
                        };
                    }
                }
                
                return { success: false, message: 'Error procesando token' };
            } else {
                return { success: false, message: data.message || 'Error en la autenticación' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    /**
     * Función de logout - cierra la sesión del usuario
     * @returns {Object} Resultado del logout con success y posible error
     */
    const logout = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearAuthData();

            if (response.ok) {
                console.log('Sesión cerrada correctamente en el servidor');
                return { success: true };
            } else {
                console.warn('Error al cerrar sesión en el servidor, pero estado local limpiado');
                return { success: false, error: 'Error en el servidor' };
            }
        } catch (error) {
            console.error('Error de red al cerrar sesión:', error);
            clearAuthData();
            return { success: false, error: 'Error de conexión' };
        }
    };

    // Valor del contexto que se proporcionará a los componentes hijos
    const contextValue = {
        user,
        userInfo,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
        getUserInfo
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
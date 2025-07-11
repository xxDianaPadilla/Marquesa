import React, { createContext, useContext, useState, useEffect } from 'react';

// AuthContext.jsx
// Contexto para manejar la autenticación del usuario
const AuthContext = createContext();

// Hook para acceder al contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Componente proveedor del contexto de autenticación
// Maneja el estado de autenticación, usuario y funciones de login/logout
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    const getTokenFromCookies = () => {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        return authCookie ? authCookie.split('=')[1] : null;
    };
// Decodifica el token JWT para obtener la información del usuario
    // Asume que el token está en formato JWT y contiene un payload con la información del
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
// Obtiene la información del usuario desde el backend
    // Asume que el backend tiene un endpoint para obtener la información del usuario autenticado
    const getUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/auth/user-info', {
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

    useEffect(() => {
        checkAuthStatus();
    }, []);
// Verifica el estado de autenticación al cargar el componente
    // Comprueba si hay un token válido y actualiza el estado de autenticación
    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const token = getTokenFromCookies();
            
            if (token) {
                const decodedToken = decodeToken(token);
                
                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    // Token válido
                    setUser({
                        id: decodedToken.id,
                        userType: decodedToken.userType
                    });
                    setIsAuthenticated(true);
                    
                    // Obtener información adicional del usuario
                    await getUserInfo();
                } else {
                    // Token expirado
                    clearAuthData();
                }
            } else {
                // No hay token
                clearAuthData();
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            clearAuthData();
        } finally {
            setLoading(false);
        }
    };
// Limpia los datos de autenticación y actualiza el estado
    // Elimina la cookie de autenticación y resetea el estado del usuario
    const clearAuthData = () => {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
        setIsAuthenticated(false);
        setUserInfo(null);
    };
// Función para manejar el login del usuario
// Envía las credenciales al backend y actualiza el estado de autenticación
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            // Verifica la respuesta del servidor
            const data = await response.json();
            console.log('Login response:', data); // Debug

            if (data.message === "login successful") {
                // Esperar un poco para que la cookie se establezca
                setTimeout(async () => {
                    const token = getTokenFromCookies();
                    if (token) {
                        const decodedToken = decodeToken(token);
                        if (decodedToken) {
                            setUser({
                                id: decodedToken.id,
                                userType: decodedToken.userType
                            });
                            setIsAuthenticated(true);
                            
                            // Obtener información del usuario
                            await getUserInfo();
                        }
                    }
                }, 100);

                return { success: true, message: data.message };
            } else {
                // Login fallido
                return { success: false, message: data.message || 'Error en la autenticación' };
            }
        } catch (error) {
            console.error('Login error: ', error);
            return { success: false, message: 'Error de conexión' };
        }
    };
// Función para manejar el logout del usuario
// Envía una solicitud al backend para cerrar la sesión y limpia el estado local
    const logout = async () => {
        try {
            // Llamar al endpoint de logout en el backend
            const response = await fetch('http://localhost:4000/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Limpiar datos locales independientemente de la respuesta del servidor
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
            // Aún así limpiar datos locales
            clearAuthData();
            return { success: false, error: 'Error de conexión' };
        }
    };
// Contexto que se proporcionará a los componentes hijos
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
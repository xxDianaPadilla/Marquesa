import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

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

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const token = getTokenFromCookies();
            
            if (token) {
                const decodedToken = decodeToken(token);
                
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

    const clearAuthData = () => {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
        setIsAuthenticated(false);
        setUserInfo(null);
    };

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

            // ACEPTAR AMBOS MENSAJES POSIBLES
            if (data.message === "login successful" || data.message === "Inicio de sesión exitoso") {
                console.log('✅ Login exitoso detectado');
                
                // Esperar un poco para que se establezca la cookie
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Obtener token y decodificar
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
                        
                        // Actualizar estado
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
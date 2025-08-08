import React, { createContext, useContext, useState, useEffect, use } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

const validators = {
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

    password: (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'La contraseña es requerida' };
        }

        if (password.length < 8) {
            return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
        }

        return { isValid: true, error: null };
    },

    token: (token) => {
        if (!token || typeof token !== 'string') {
            return { isValid: false, error: 'Token inválido' };
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return { isValid: false, error: 'Formato de token invalido' };
        }

        return { isValid: true, error: null };
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [authError, setAuthError] = useState(null);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const getTokenFromStorage = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return token;
        } catch (error) {
            console.error('Error al obtener el token del storage: ', error);
            return null;
        }
    };

    const saveTokenToStorage = async (token) => {
        try {
            await AsyncStorage.setItem('authToken', token);
            return true;
        } catch (error) {
            console.error('Error al guardar el token en storage: ', error);
            return false;
        }
    };

    const removeTokenFromStorage = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            return true;
        } catch (error) {
            console.error('Error al eliminar el token del storage: ', error);
            return false;
        }
    };

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

            if (!parsedPayload || !parsedPayload.id || !parsedPayload.exp) {
                console.error('Token no contiene campos requeridos');
                return null;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            if (parsedPayload.exp <= currentTime) {
                console.info('El token ha expirado');
                return null;
            }

            return parsedPayload;
        } catch (error) {
            console.error('Error al decodificar el token: ', error);
            return null;
        }
    };

    const getUserInfo = async (token) => {
        try {
            console.log('Obteniendo información del usuario...');

            const response = await fetch('https://marquesa.onrender.com/api/login/user-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta getUserInfo: ', data);

                if (data && data.success && data.user) {
                    console.log('Información del usuario obtenida: ', data.user);
                    setUserInfo(data.user);
                    setAuthError(null);
                    return data.user;
                } else {
                    console.warn('Respuesta sin éxito: ', data?.message);
                    return null;
                }
            } else {
                console.error('Error en respuesta del servidor: ', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener información del usuario: ', error);
            setAuthError('Error al obtener información del usuario');
            return null;
        }
    };

    const clearAuthData = async (isVoluntaryLogout = false) => {
        try {
            console.log('Limpiando datos de autenticación...', { isVoluntaryLogout });

            await removeTokenFromStorage();

            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);

            if (isVoluntaryLogout) {
                setAuthError(null);
            }
        } catch (error) {
            console.error('Error al limpiar los datos de autenticación: ', error);
        }
    };

    const checkAuthStatus = async () => {
        try {
            if (isLoggingOut || isLoggingIn) {
                console.log('Proceso de autenticación en progreso, saltando verificación');
                return;
            }

            setLoading(true);
            setAuthError(null);

            console.log('Verificando estado de autenticación...');

            const token = await getTokenFromStorage();

            if (token) {
                console.log('Token encontrado, decodificando...');
                const decodedToken = decodeToken(token);

                if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                    console.log('Token válido, configurando usuario...');

                    const userData = {
                        id: decodedToken.id,
                        userType: decodedToken.userType || 'user'
                    };

                    setUser(userData);
                    setIsAuthenticated(true);

                    console.log('Obteniendo información completa del usuario...');
                    await getUserInfo(token);
                } else {
                    console.info('Token expirado o inválido');
                    await clearAuthData(false);
                }
            } else {
                console.info('No se encontró token');
                await clearAuthData(false);
            }
        } catch (error) {
            console.error('Error al verificar la autenticación: ', error);
            setAuthError('Error al verificar el estado de autenticación');
            await clearAuthData(false);
        } finally {
            if (!isLoggingIn) {
                setLoading(false);
            }
        }
    };

    const login = async (email, password) => {
        try {
            setIsLoggingIn(true);
            setLoading(true);
            setAuthError(null);
            console.log('Iniciando proceso de login...');

            const emailVerification = validators.email(email);
            if (!emailVerification.isValid) {
                setAuthError(emailVerification.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: emailVerification.error };
            }

            const passwordValidation = validators.password(password);
            if (!passwordValidation.isValid) {
                setAuthError(passwordValidation.error);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: passwordValidation.error };
            }

            const cleanEmail = email.trim().toLowerCase();

            const response = await fetch('https://marquesa.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: cleanEmail, password })
            });

            const data = await response.json();
            console.log('Login response: ', data);

            if (response.ok && (data.message === "login successful" || data.message === "Inicio de sesión exitoso")) {
                console.log('Login exitoso detectado');

                const token = data.token;

                if (token) {
                    const tokenSaved = await saveTokenToStorage(token);

                    if (tokenSaved) {
                        const decodedToken = decodeToken(token);
                        console.log('Token decodificado exitosamente: ', !!decodedToken);

                        if (decodedToken) {
                            const userData = {
                                id: decodedToken.id,
                                userType: decodedToken.userType || data.userType || 'user'
                            };

                            console.log('Configurando datos del usuario: ', userData);

                            setUser(userData);
                            setIsAuthenticated(true);
                            setAuthError(null);

                            console.log('Obteniendo información completa...');
                            const userInfoResult = await getUserInfo(token);
                            console.log('Informacón del usuario obtenida: ', !!userInfoResult);

                            setIsLoggingIn(false);
                            setLoading(false);

                            console.log('Login completado exitosamente para: ', userData.userType);

                            return {
                                success: true,
                                message: data.message,
                                user: userData,
                                userType: userData.userType
                            };
                        }
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
            console.error('Error en el proceso de login: ', error);
            const errorMsg = 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    const logout = async () => {
        try {
            setIsLoggingOut(true);
            setAuthError(null);

            console.log('Iniciando proceso de logout...');

            const token = await getTokenFromStorage();

            try {
                const response = await fetch('https://marquesa.onrender.com/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response && response.ok) {
                    console.log('Sesión cerrada correctamente en el servidor');
                } else {
                    console.log('Error al cerrar sesión en el servidor, pero continuando con logout local');
                }
            } catch (serverError) {
                console.warn('Error de red al cerrar sesión en el servidor, continuando localmente: ', serverError);
            }

            await clearAuthData(true);

            console.log('Logout completado correctamente');
            return { success: true };
        } catch (error) {
            console.error('Error durante logout: ', error);

            await clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            setIsLoggingOut(false);
        }
    };

    const clearAuthError = () => {
        setAuthError(null);
    };

    useEffect(() => {
        if (!isLoggingOut && !isLoggingIn) {
            console.log('Inicializando AuthProvider...');
            checkAuthStatus();
        }
    }, [isLoggingOut, isLoggingIn]);

    useEffect(() => {
        console.log('Estado de autenticación actualizado: ', {
            isAuthenticated,
            hasUser: !!user,
            hasUserInfo: !!userInfo,
            userType: user?.userType,
            isLoggingOut,
            isLoggingIn
        });
    }, [isAuthenticated, user, userInfo, isLoggingOut, isLoggingIn]);

    const contextValue = {
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        isLoggingOut,
        isLoggingIn,

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
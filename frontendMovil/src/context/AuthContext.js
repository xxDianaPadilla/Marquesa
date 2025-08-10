import React, { createContext, useContext, useState, useEffect } from "react";
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
    
    // Estados para favoritos
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);

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

    // ACTUALIZADO: Obtener favoritos del usuario
const getFavorites = async (token = null) => {
    try {
        setFavoritesLoading(true);
        setFavoritesError(null);

        const authToken = token || await getTokenFromStorage();
        if (!authToken) {
            console.log('No hay token para obtener favoritos');
            setFavorites([]);
            return [];
        }

        console.log('Obteniendo favoritos usando ruta específica...');

        // Usar la ruta específica de favoritos
        const response = await fetch('https://marquesa.onrender.com/api/clients/favorites', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Respuesta de favoritos: ', data);

            if (data && data.success) {
                const userFavorites = data.favorites || data.data || [];
                console.log('Favoritos obtenidos: ', userFavorites);
                setFavorites(userFavorites);
                return userFavorites;
            } else {
                console.warn('Error al obtener favoritos: ', data?.message);
                setFavorites([]);
                return [];
            }
        } else {
            console.error('Error en respuesta del servidor: ', response.status);
            setFavorites([]);
            return [];
        }
    } catch (error) {
        console.error('Error al obtener favoritos: ', error);
        setFavoritesError('Error al obtener favoritos');
        setFavorites([]);
        return [];
    } finally {
        setFavoritesLoading(false);
    }
};


    // NUEVA: Función para obtener datos completos de productos favoritos
    const fetchFavoriteProducts = async (productIds, token) => {
        try {
            if (!productIds || productIds.length === 0) {
                return [];
            }

            console.log('Obteniendo datos completos de productos favoritos:', productIds);

            // Obtener todos los productos
            const response = await fetch('https://marquesa.onrender.com/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data && data.products) {
                    // Filtrar solo los productos que están en favoritos
                    const favoriteProducts = data.products.filter(product => 
                        productIds.includes(product._id)
                    );
                    
                    console.log('Productos favoritos obtenidos:', favoriteProducts);
                    return favoriteProducts;
                }
            }
            
            return [];
        } catch (error) {
            console.error('Error al obtener datos de productos favoritos:', error);
            return [];
        }
    };
    const isFavorite = (productId) => {
    if (!favorites || !Array.isArray(favorites)) {
        console.log('No hay favoritos o no es un array');
        return false;
    }
    
    // Verificar si el productId está en el array de favoritos
    const found = favorites.some(fav => {
        if (typeof fav === 'string') {
            return fav === productId;
        }
        if (typeof fav === 'object' && fav !== null) {
            // Verificar diferentes posibles estructuras del objeto favorito
            return fav._id === productId || fav.productId === productId || fav.id === productId;
        }
        return false;
    });
    
    console.log(`¿Producto ${productId} está en favoritos?`, found);
    return found;
};
const clearAuthData = async (fromLogout = false) => {
    try {
        console.log('Limpiando datos de autenticación...');
        
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
        
        // Solo cambiar loading si no viene del logout
        if (!fromLogout) {
            setLoading(false);
        }
        
        console.log('Datos de autenticación limpiados exitosamente');
    } catch (error) {
        console.error('Error al limpiar datos de autenticación:', error);
        
        // Asegurar que al menos se limpien los estados principales
        setUser(null);
        setUserInfo(null);
        setIsAuthenticated(false);
        setFavorites([]);
        
        if (!fromLogout) {
            setLoading(false);
        }
    }
};

   // ACTUALIZADO: Agregar producto a favoritos
const addToFavorites = async (productId) => {
    try {
        setFavoritesError(null);

        const token = await getTokenFromStorage();
        if (!token) {
            setFavoritesError('No hay sesión activa');
            return { success: false, message: 'No hay sesión activa' };
        }

        console.log('Agregando a favoritos:', productId);

        const response = await fetch('https://marquesa.onrender.com/api/clients/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                productId: productId 
            })
        });

        const data = await response.json();
        console.log('Respuesta agregar favorito:', data);

        if (response.ok && data.success) {
            console.log('Producto agregado a favoritos exitosamente');
            // Actualizar la lista de favoritos
            await getFavorites(token);
            return { success: true, message: data.message || 'Producto agregado a favoritos' };
        } else {
            const errorMsg = data.message || 'Error al agregar a favoritos';
            console.error('Error del servidor:', data);
            setFavoritesError(errorMsg);
            return { success: false, message: errorMsg };
        }
    } catch (error) {
        console.error('Error al agregar a favoritos: ', error);
        const errorMsg = 'Error de conexión con el servidor';
        setFavoritesError(errorMsg);
        return { success: false, message: errorMsg };
    }
};


    // ACTUALIZADO: Remover producto de favoritos
const removeFromFavorites = async (productId) => {
    try {
        setFavoritesError(null);

        const token = await getTokenFromStorage();
        if (!token) {
            setFavoritesError('No hay sesión activa');
            return { success: false, message: 'No hay sesión activa' };
        }

        console.log('Removiendo de favoritos:', productId);

        const response = await fetch('https://marquesa.onrender.com/api/clients/favorites/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                productId: productId 
            })
        });

        const data = await response.json();
        console.log('Respuesta remover favorito:', data);

        if (response.ok && data.success) {
            console.log('Producto removido de favoritos exitosamente');
            // Actualizar la lista de favoritos
            await getFavorites(token);
            return { success: true, message: data.message || 'Producto removido de favoritos' };
        } else {
            const errorMsg = data.message || 'Error al remover de favoritos';
            console.error('Error del servidor:', data);
            setFavoritesError(errorMsg);
            return { success: false, message: errorMsg };
        }
    } catch (error) {
        console.error('Error al remover de favoritos: ', error);
        const errorMsg = 'Error de conexión con el servidor';
        setFavoritesError(errorMsg);
        return { success: false, message: errorMsg };
    }
};


    // Toggle favorito (agregar o remover)
   const toggleFavorite = async (productId) => {
    try {
        setFavoritesError(null);

        const token = await getTokenFromStorage();
        if (!token) {
            setFavoritesError('No hay sesión activa');
            return { success: false, message: 'No hay sesión activa' };
        }

        console.log('Toggle favorito:', productId);

        const response = await fetch('https://marquesa.onrender.com/api/clients/favorites/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                productId: productId 
            })
        });

        const data = await response.json();
        console.log('Respuesta toggle favorito:', data);

        if (response.ok && data.success) {
            console.log('Toggle favorito exitoso');
            // Actualizar la lista de favoritos
            await getFavorites(token);
            return { 
                success: true, 
                message: data.message || 'Favorito actualizado',
                isAdded: data.isAdded // Por si el servidor devuelve si fue agregado o removido
            };
        } else {
            const errorMsg = data.message || 'Error al actualizar favorito';
            console.error('Error del servidor:', data);
            setFavoritesError(errorMsg);
            return { success: false, message: errorMsg };
        }
    } catch (error) {
        console.error('Error al hacer toggle favorito: ', error);
        const errorMsg = 'Error de conexión con el servidor';
        setFavoritesError(errorMsg);
        return { success: false, message: errorMsg };
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
                    
                    // Obtener favoritos después de la autenticación
                    console.log('Obteniendo favoritos del usuario...');
                    await getFavorites(token);
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
                            console.log('Información del usuario obtenida: ', !!userInfoResult);

                            // Obtener favoritos después del login exitoso
                            console.log('Obteniendo favoritos después del login...');
                            await getFavorites(token);

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

    // Limpiar errores de favoritos
    const clearFavoritesError = () => {
        setFavoritesError(null);
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
            favoritesCount: favorites.length,
            isLoggingOut,
            isLoggingIn
        });
    }, [isAuthenticated, user, userInfo, favorites, isLoggingOut, isLoggingIn]);

    const contextValue = {
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        isLoggingOut,
        isLoggingIn,

        // Funciones y estados de favoritos
        favorites,
        favoritesLoading,
        favoritesError,
        
        // Funciones originales
        login,
        logout,
        checkAuthStatus,
        getUserInfo,
        clearAuthError,

       // Funciones de favoritos
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,  // ← Esta es la función que faltaba
    clearFavoritesError,

    // Función de limpieza (si la necesitas exportar)
    clearAuthData
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
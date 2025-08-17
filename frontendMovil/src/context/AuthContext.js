import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

    // Estados para favoritos - mejorados
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Estado para coordinar con CartContext
    const [authReady, setAuthReady] = useState(false);

    // Función para guardar token automáticamente
    const saveTokenToStorage = async (token) => {
        try {
            console.log('Guardando token en AsyncStorage...');
            await AsyncStorage.setItem('authToken', token);
            console.log('Token guardado exitosamente');
            return true;
        } catch (error) {
            console.error('Error al guardar el token en storage:', error);
            return false;
        }
    };

    // Obtenemos token con mejor manejo de errores
    const getBestAvailableToken = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                // Verificamos que el token no haya expirado
                const decoded = decodeToken(token);
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    return token;
                } else {
                    console.log('Token expirado, eliminando...');
                    await AsyncStorage.removeItem('authToken');
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }, []);

    const getTokenFromStorage = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return token;
        } catch (error) {
            console.error('Error al obtener el token del storage: ', error);
            return null;
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

    // Función para normalizar el ID del producto
    const getProductId = useCallback((product) => {
        if (!product) return null;
        return product._id || product.id || null;
    }, []);

    // Normalizamos y validar el producto antes de guardarlo
    const normalizeProduct = useCallback((product) => {
        if (!product) return null;

        const productId = getProductId(product);
        if (!productId) {
            console.error('Product has no valid ID:', product);
            return null;
        }

        // Creamos una copia normalizada del producto con todos los campos necesarios
        const normalizedProduct = {
            // IDs - asegurar que ambos estén presentes
            id: productId,
            _id: productId,

            // Información básica del producto
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            category: product.category || '',

            // Precio - manejar diferentes formatos
            price: product.price || 0,

            // Stock - puede ser undefined si no se proporciona
            stock: product.stock !== undefined ? Number(product.stock) : undefined,

            // Imágenes - normalizar estructura
            image: product.image || '',
            images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),

            // Metadatos de favoritos
            addedAt: new Date().toISOString(),
            userId: user?.id || 'guest',

            // Preservamos cualquier otro campo que pueda ser importante
            ...Object.keys(product).reduce((acc, key) => {
                if (!['id', '_id', 'name', 'description', 'category', 'price', 'stock', 'image', 'images'].includes(key)) {
                    acc[key] = product[key];
                }
                return acc;
            }, {})
        };

        return normalizedProduct;
    }, [user?.id, getProductId]);

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

            const response = await fetch('https://marquesa.onrender.com/api/login/userInfo', {
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

                    // Marcamos auth como listo después de obtener userInfo
                    setAuthReady(true);

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

    // Obtenemos favoritos con lógica mejorada
    const getFavorites = useCallback(async (token = null) => {
        try {
            setFavoritesLoading(true);
            setFavoritesError(null);

            if (!isAuthenticated) {
                console.log('Usuario no autenticado, limpiando favoritos');
                setFavorites([]);
                return [];
            }

            const authToken = token || await getBestAvailableToken();
            if (!authToken) {
                console.log('No hay token para obtener favoritos');
                setFavorites([]);
                return [];
            }

            console.log('Obteniendo favoritos desde el servidor...');

            // Petición con timeout
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta de favoritos:', data);

                if (data && data.success) {
                    // Procesamos favoritos correctamente
                    let userFavorites = [];

                    if (data.user && data.user.favorites) {
                        // Los favoritos están en data.user.favorites
                        userFavorites = data.user.favorites;
                    } else if (data.favorites) {
                        // Los favoritos están directamente en data.favorites
                        userFavorites = data.favorites;
                    } else if (data.data) {
                        // Los favoritos están en data.data
                        userFavorites = data.data;
                    }

                    console.log('Favoritos obtenidos del servidor:', userFavorites);

                    // Procesamos favoritos que pueden venir como array de objetos con productId
                    const processedFavorites = [];

                    if (Array.isArray(userFavorites)) {
                        for (const fav of userFavorites) {
                            if (typeof fav === 'string') {
                                // Es solo un ID de producto
                                processedFavorites.push({ _id: fav, id: fav });
                            } else if (fav && typeof fav === 'object') {
                                if (fav.productId) {
                                    // Tiene estructura { productId: "id", _id: "..." }
                                    if (typeof fav.productId === 'object' && fav.productId._id) {
                                        // El productId es un objeto poblado
                                        processedFavorites.push(normalizeProduct(fav.productId));
                                    } else if (typeof fav.productId === 'string') {
                                        // El productId es solo un string ID
                                        processedFavorites.push({
                                            _id: fav.productId,
                                            id: fav.productId,
                                            favId: fav._id
                                        });
                                    }
                                } else {
                                    // Es un producto directo
                                    const normalized = normalizeProduct(fav);
                                    if (normalized) {
                                        processedFavorites.push(normalized);
                                    }
                                }
                            }
                        }
                    }

                    // Filtramos null/undefined
                    const cleanFavorites = processedFavorites.filter(fav => fav !== null && fav !== undefined);

                    console.log('Favoritos procesados:', cleanFavorites);
                    setFavorites(cleanFavorites);
                    return cleanFavorites;
                } else {
                    console.warn('Error al obtener favoritos:', data?.message);
                    setFavorites([]);
                    return [];
                }
            } else if (response.status === 401) {
                console.log('Token expirado o inválido');
                setFavorites([]);
                return [];
            } else {
                console.error('Error en respuesta del servidor:', response.status);
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al obtener favoritos:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error al obtener favoritos';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            setFavoritesError(errorMessage);
            setFavorites([]);
            return [];
        } finally {
            setFavoritesLoading(false);
        }
    }, [isAuthenticated, getBestAvailableToken, normalizeProduct]);

    // Obtenemos datos completos de productos favoritos
    const fetchFavoriteProducts = useCallback(async (productIds, token) => {
        try {
            if (!productIds || productIds.length === 0) {
                return [];
            }

            console.log('Obteniendo datos completos de productos favoritos:', productIds);

            const authToken = token || await getBestAvailableToken();

            // Obtenemos todos los productos
            const operationPromise = fetch('https://marquesa.onrender.com/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();

                if (data && data.products) {
                    // Filtramos solo los productos que están en favoritos
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
    }, [getBestAvailableToken]);

    // Verificamos si un producto es favorito con lógica robusta
    const isFavorite = useCallback((productId) => {
        try {
            if (!productId || !isAuthenticated) return false;

            // Aseguramos que favorites sea un array antes de usar some()
            const currentFavorites = Array.isArray(favorites) ? favorites : [];
            return currentFavorites.some(fav => {
                if (typeof fav === 'string') {
                    return fav === productId;
                }
                if (typeof fav === 'object' && fav !== null) {
                    return getProductId(fav) === productId;
                }
                return false;
            });
        } catch (error) {
            console.error('Error checking if favorite:', error);
            return false;
        }
    }, [favorites, getProductId, isAuthenticated]);

    // Función para limpiar datos de auth
    const clearAuthData = async (fromLogout = false) => {
        try {
            console.log('🧹 Limpiando datos de autenticación...');

            // Marcamos auth como no listo
            setAuthReady(false);

            // Limpiamos token del storage
            await removeTokenFromStorage();

            // Limpiamos estados de usuario
            setUser(null);
            setUserInfo(null);
            setIsAuthenticated(false);
            setAuthError(null);

            // Limpiamos estados de favoritos
            setFavorites([]);
            setFavoritesError(null);

            // Cambiamos loading si no viene del logout
            if (!fromLogout) {
                setLoading(false);
            }

            console.log('Datos de autenticación limpiados exitosamente');
        } catch (error) {
            console.error('Error al limpiar datos de autenticación:', error);

            // Aseguramos que al menos se limpien los estados principales
            setAuthReady(false);
            setUser(null);
            setUserInfo(null);
            setIsAuthenticated(false);
            setFavorites([]);

            if (!fromLogout) {
                setLoading(false);
            }
        }
    };

    // Agregamos producto a favoritos con lógica mejorada
    const addToFavorites = useCallback(async (product) => {
        try {
            console.log('Adding to favorites - Raw product:', product);

            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión para agregar favoritos');
                return { success: false, message: 'Debes iniciar sesión para agregar favoritos' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            // Normalizamos el producto antes de agregarlo
            const normalizedProduct = normalizeProduct(product);

            if (!normalizedProduct) {
                console.error('Failed to normalize product:', product);
                return { success: false, message: 'Producto inválido' };
            }

            const productId = getProductId(normalizedProduct);

            if (!productId) {
                console.error('Product has no valid ID:', product);
                return { success: false, message: 'Producto sin ID válido' };
            }

            console.log('Agregando a favoritos:', productId);

            // Petición con timeout
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta agregar favorito:', data);

            if (response.ok && data.success) {
                console.log('Producto agregado a favoritos exitosamente');

                // Guardamos token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizamos la lista de favoritos
                await getFavorites(token);
                return { success: true, message: data.message || 'Producto agregado a favoritos' };
            } else {
                const errorMsg = data.message || 'Error al agregar a favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, normalizeProduct, getProductId, getFavorites, saveTokenToStorage]);

    // Removemos producto de favoritos con lógica mejorada
    const removeFromFavorites = useCallback(async (productId) => {
        try {
            if (!productId) {
                console.error('No productId provided for removal');
                return { success: false, message: 'ID de producto requerido' };
            }

            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            console.log('Removiendo de favoritos:', productId);

            // Petición con timeout
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta remover favorito:', data);

            if (response.ok && data.success) {
                console.log('Producto removido de favoritos exitosamente');

                // Guardamos token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizamos la lista de favoritos
                await getFavorites(token);
                return { success: true, message: data.message || 'Producto removido de favoritos' };
            } else {
                const errorMsg = data.message || 'Error al remover de favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);

            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, getFavorites, saveTokenToStorage]);

    // Toggle favorito con lógica mejorada
    const toggleFavorite = useCallback(async (product) => {
        try {
            if (!product) {
                console.error('No product provided to toggle');
                return { success: false, message: 'Producto requerido' };
            }

            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            const productId = getProductId(product);

            if (!productId) {
                console.error('Product has no valid ID for toggle:', product);
                return { success: false, message: 'Producto sin ID válido' };
            }

            console.log('Toggling favorite for product:', {
                productId,
                productName: product.name,
                currentlyFavorite: isFavorite(productId)
            });

            // Petición con timeout
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta toggle favorito:', data);

            if (response.ok && data.success) {
                console.log('Toggle favorito exitoso');

                // Guardamos token si viene en respuesta
                if (data.token) {
                    await saveTokenToStorage(data.token);
                }

                // Actualizamos la lista de favoritos
                await getFavorites(token);
                return {
                    success: true,
                    message: data.message || 'Favorito actualizado',
                    isAdded: data.action === 'added' || data.isAdded
                };
            } else {
                const errorMsg = data.message || 'Error al actualizar favorito';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);

            // Manejamos específico de errores de red vs servidor
            let errorMessage = 'Error de conexión con el servidor';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            setFavoritesError(errorMessage);
            return { success: false, message: errorMessage };
        }
    }, [isAuthenticated, getBestAvailableToken, getProductId, isFavorite, getFavorites, saveTokenToStorage]);

    // Limpiamos todos los favoritos
    const clearAllFavorites = useCallback(async () => {
        try {
            if (!isAuthenticated) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                return { success: false, message: 'No hay sesión activa' };
            }

            // Recargamos favoritos desde el servidor
            await getFavorites(token);
            return { success: true, message: 'Favoritos actualizados' };
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return { success: false, message: 'Error al limpiar favoritos' };
        }
    }, [isAuthenticated, getBestAvailableToken, getFavorites]);

    // Obtenemos un producto favorito por ID
    const getFavoriteProduct = useCallback((productId) => {
        if (!productId) return null;

        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        return currentFavorites.find(fav => getProductId(fav) === productId) || null;
    }, [favorites, getProductId]);

    // Refrescamos/recargamos favoritos
    const refreshFavorites = useCallback(async () => {
        if (isAuthenticated) {
            return await getFavorites();
        }
        return [];
    }, [getFavorites, isAuthenticated]);

    // Función mejorada para verificar estado de auth
    const checkAuthStatus = async () => {
        try {
            if (isLoggingOut || isLoggingIn) {
                console.log('Proceso de autenticación en progreso, saltando verificación');
                return;
            }

            setLoading(true);
            setAuthError(null);
            setAuthReady(false); 

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
                    const userInfoResult = await getUserInfo(token);

                    if (userInfoResult) {
                        // Obtenemos favoritos después de la autenticación
                        console.log('Obteniendo favoritos del usuario...');
                        await getFavorites(token);

                        setAuthReady(token);
                        console.log('Auth completamente inicializado y listo');
                    } else {
                        console.error('No se pudo obtener información del usuario');
                        await clearAuthData(false);
                    }
                } else {
                    console.info('Token expirado o inválido');
                    await clearAuthData(false);
                }
            } else {
                console.info('No se encontró token');
                await clearAuthData(false);
            }
        } catch (error) {
            console.error('Error al verificar la autenticación:', error);
            setAuthError('Error al verificar el estado de autenticación');
            await clearAuthData(false);
        } finally {
            if (!isLoggingIn) {
                setLoading(false);
            }
        }
    };

    // Función de login mejorada
    const login = async (email, password) => {
        try {
            setIsLoggingIn(true);
            setLoading(true);
            setAuthError(null);
            setAuthReady(false); 
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
            console.log('Login response:', data);

            if (response.ok && (data.message === "login successful" || data.message === "Inicio de sesión exitoso")) {
                console.log('Login exitoso detectado');

                const token = data.token;

                if (token) {
                    // Guardamos token inmediatamente
                    const tokenSaved = await saveTokenToStorage(token);

                    if (tokenSaved) {
                        const decodedToken = decodeToken(token);
                        console.log('Token decodificado exitosamente:', !!decodedToken);

                        if (decodedToken) {
                            const userData = {
                                id: decodedToken.id,
                                userType: decodedToken.userType || data.userType || 'user'
                            };

                            console.log('👤 Configurando datos del usuario:', userData);

                            setUser(userData);
                            setIsAuthenticated(true);
                            setAuthError(null);

                            console.log('Obteniendo información completa...');
                            const userInfoResult = await getUserInfo(token);

                            if (userInfoResult) {
                                // Obtenemos favoritos después del login exitoso
                                console.log('Obteniendo favoritos después del login...');
                                await getFavorites(token);

                                console.log('Login completado exitosamente para:', userData.userType);
                                setAuthReady(true);
                                console.log('Auth marcado como listo para CartContext');

                                setIsLoggingIn(false);
                                setLoading(false);

                                return {
                                    success: true,
                                    message: data.message,
                                    user: userData,
                                    userType: userData.userType
                                };
                            } else {
                                throw new Error('No se pudo obtener información del usuario');
                            }
                        }
                    } else {
                        throw new Error('No se pudo guardar el token');
                    }
                } else {
                    throw new Error('No se recibió token del servidor');
                }
            } else {
                const errorMsg = data.message || 'Error en la autenticación';
                setAuthError(errorMsg);
                setIsLoggingIn(false);
                setLoading(false);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error en el proceso de login:', error);
            const errorMsg = error.message || 'Error de conexión con el servidor';
            setAuthError(errorMsg);
            setIsLoggingIn(false);
            setLoading(false);
            return { success: false, message: errorMsg };
        }
    };

    // Función de logout mejorada
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
                console.warn('Error de red al cerrar sesión en el servidor, continuando localmente:', serverError);
            }

            await clearAuthData(true);

            console.log('Logout completado correctamente');
            return { success: true };
        } catch (error) {
            console.error('Error durante logout:', error);

            await clearAuthData(true);
            return { success: true, warning: 'Sesión cerrada localmente' };
        } finally {
            setIsLoggingOut(false);
        }
    };

    const clearAuthError = () => {
        setAuthError(null);
    };

    // Limpiamos errores de favoritos
    const clearFavoritesError = useCallback(() => {
        setFavoritesError(null);
    }, []);

    // Debug para ver cambios en favoritos
    useEffect(() => {
        console.log('Favorites updated:', {
            favorites,
            isArray: Array.isArray(favorites),
            length: favorites.length,
            type: typeof favorites
        });
    }, [favorites]);

    // Effect principal mejorado
    useEffect(() => {
        if (!isLoggingOut && !isLoggingIn) {
            console.log('Inicializando AuthProvider...');
            checkAuthStatus();
        }
    }, [isLoggingOut, isLoggingIn]);

    // Effect para debug de estados
    useEffect(() => {
        console.log('Estado de autenticación actualizado:', {
            isAuthenticated,
            hasUser: !!user,
            hasUserInfo: !!userInfo,
            userType: user?.userType,
            favoritesCount: favorites.length,
            isLoggingOut,
            isLoggingIn,
            authReady, 
            loading
        });
    }, [isAuthenticated, user, userInfo, favorites, isLoggingOut, isLoggingIn, authReady, loading]);

    // Effect separado para cargar favoritos - sin interferir con el carrito
    useEffect(() => {
        const loadFavoritesWhenReady = async () => {
            if (isAuthenticated && user?.id && userInfo && !isLoggingIn && !isLoggingOut) {
                console.log('Cargando favoritos (usuario completamente autenticado)...');
                await getFavorites();
            } else if (!isAuthenticated) {
                console.log('Limpiando favoritos (usuario no autenticado)...');
                setFavorites([]);
            }
        };

        // Pequeño delay para evitar race conditions
        const timeoutId = setTimeout(loadFavoritesWhenReady, 150);
        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, user?.id, userInfo, isLoggingIn, isLoggingOut, getFavorites]);

    // Aseguramos que favorites siempre sea un array
    const safeFavorites = Array.isArray(favorites) ? favorites : [];

    const contextValue = {
        user,
        userInfo,
        loading,
        isAuthenticated,
        authError,
        isLoggingOut,
        isLoggingIn,
        authReady, 

        // Estados de favoritos
        favorites: safeFavorites,
        favoritesLoading,
        favoritesError,
        favoritesCount: safeFavorites.length,

        // Funciones login
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
        isFavorite,
        clearFavoritesError,
        clearAllFavorites,
        getFavoriteProduct,
        refreshFavorites,
        fetchFavoriteProducts,
        getBestAvailableToken,
        getProductId,
        normalizeProduct,

        // Función de limpieza 
        clearAuthData,

        // Función para guardar tokens
        saveTokenToStorage
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
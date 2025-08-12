import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
    }
    return context;
};

// ACTUALIZADO: Sistema de autenticación cross-domain híbrido
export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);
    
    // ✅ CORRECCIÓN CRÍTICA: Usar setAuthToken del contexto
    const { user, isAuthenticated, getBestAvailableToken, setAuthToken } = useAuth();

    // Debug: Log cada vez que favorites cambie
    useEffect(() => {
        console.log('Favorites updated:', {
            favorites,
            isArray: Array.isArray(favorites),
            length: favorites.length,
            type: typeof favorites
        });
    }, [favorites]);

    /**
     * ✅ NUEVA FUNCIÓN: Crear headers de autenticación híbridos
     */
    const getAuthHeaders = useCallback(() => {
        const token = getBestAvailableToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }, [getBestAvailableToken]);

    // Función para normalizar el ID del producto (maneja tanto _id como id)
    const getProductId = useCallback((product) => {
        if (!product) return null;
        return product._id || product.id || null;
    }, []);

    // Función para normalizar y validar el producto antes de guardarlo
    const normalizeProduct = useCallback((product) => {
        if (!product) return null;
        
        const productId = getProductId(product);
        if (!productId) {
            console.error('Product has no valid ID:', product);
            return null;
        }

        // Crear una copia normalizada del producto con todos los campos necesarios
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
            
            // Preservar cualquier otro campo que pueda ser importante
            ...Object.keys(product).reduce((acc, key) => {
                if (!['id', '_id', 'name', 'description', 'category', 'price', 'stock', 'image', 'images'].includes(key)) {
                    acc[key] = product[key];
                }
                return acc;
            }, {})
        };

        console.log('Product normalized:', {
            original: product,
            normalized: normalizedProduct
        });

        return normalizedProduct;
    }, [user?.id, getProductId]);

    /**
     * ✅ ACTUALIZADA: Obtener favoritos desde el servidor con sistema híbrido
     */
    const getFavorites = useCallback(async (token = null) => {
        try {
            setIsLoading(true);
            setFavoritesError(null);

            if (!isAuthenticated) {
                console.log('Usuario no autenticado, limpiando favoritos');
                setFavorites([]);
                return [];
            }

            const authToken = token || getBestAvailableToken();
            if (!authToken) {
                console.log('No hay token para obtener favoritos');
                setFavorites([]);
                return [];
            }

            console.log('Obteniendo favoritos desde el servidor...');

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites', {
                method: 'GET',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta de favoritos:', data);

                // ✅ NUEVO: Manejo híbrido de tokens
                let receivedToken = null;

                // Primera prioridad: response body
                if (data.token) {
                    receivedToken = data.token;
                    if (setAuthToken && typeof setAuthToken === 'function') {
                        setAuthToken(receivedToken); // Guardar en estado local
                    }
                }

                // Segunda prioridad: cookie (con retraso)
                if (!receivedToken) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    receivedToken = getBestAvailableToken();
                    if (receivedToken && setAuthToken && typeof setAuthToken === 'function') {
                        setAuthToken(receivedToken);
                    }
                }

                if (data && data.success) {
                    // ✅ CORRECCIÓN CRÍTICA: Procesar favoritos correctamente
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
                    
                    // ✅ NUEVA LÓGICA: Procesar favoritos que pueden venir como array de objetos con productId
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
                                            favId: fav._id // Mantener ID del favorito si existe
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
                    
                    // Filtrar null/undefined
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
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
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
            setIsLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders, getBestAvailableToken, setAuthToken, normalizeProduct]);

    /**
     * ✅ ACTUALIZADA: Función para obtener datos completos de productos favoritos con sistema híbrido
     */
    const fetchFavoriteProducts = useCallback(async (productIds, token) => {
        try {
            if (!productIds || productIds.length === 0) {
                return [];
            }

            console.log('Obteniendo datos completos de productos favoritos:', productIds);

            const authToken = token || getBestAvailableToken();
            
            // ✅ NUEVA LÓGICA: Obtener todos los productos con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/products', {
                method: 'GET',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();
                
                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token && setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
                
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
    }, [getAuthHeaders, getBestAvailableToken, setAuthToken]);

    // Cargar favoritos cuando cambie el usuario
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            getFavorites();
        } else {
            setFavorites([]);
        }
    }, [isAuthenticated, user?.id, getFavorites]);

    /**
     * ✅ ACTUALIZADA: Agregar producto a favoritos usando API con sistema híbrido
     */
    const addToFavorites = useCallback(async (product) => {
        try {
            console.log('Adding to favorites - Raw product:', product);
            
            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión para agregar favoritos');
                return false;
            }

            const token = getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return false;
            }

            // Normalizar el producto antes de agregarlo
            const normalizedProduct = normalizeProduct(product);
            
            if (!normalizedProduct) {
                console.error('Failed to normalize product:', product);
                return false;
            }

            const productId = getProductId(normalizedProduct);
            
            if (!productId) {
                console.error('Product has no valid ID:', product);
                return false;
            }

            console.log('Agregando a favoritos:', productId);

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/add', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({ 
                    productId: productId 
                })
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta agregar favorito:', data);

            if (response.ok && data.success) {
                console.log('Producto agregado a favoritos exitosamente');
                
                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token && setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
                
                // Actualizar la lista de favoritos
                await getFavorites(token);
                return true;
            } else {
                const errorMsg = data.message || 'Error al agregar a favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
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
            return false;
        }
    }, [isAuthenticated, getAuthHeaders, getBestAvailableToken, setAuthToken, normalizeProduct, getProductId, getFavorites]);

    /**
     * ✅ ACTUALIZADA: Remover producto de favoritos usando API con sistema híbrido
     */
    const removeFromFavorites = useCallback(async (productId) => {
        try {
            if (!productId) {
                console.error('No productId provided for removal');
                return false;
            }

            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return false;
            }

            const token = getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return false;
            }

            console.log('Removiendo de favoritos:', productId);

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/remove', {
                method: 'DELETE',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({ 
                    productId: productId 
                })
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta remover favorito:', data);

            if (response.ok && data.success) {
                console.log('Producto removido de favoritos exitosamente');
                
                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token && setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
                
                // Actualizar la lista de favoritos
                await getFavorites(token);
                return true;
            } else {
                const errorMsg = data.message || 'Error al remover de favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
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
            return false;
        }
    }, [isAuthenticated, getAuthHeaders, getBestAvailableToken, setAuthToken, getFavorites]);

    // ACTUALIZADA: Verificar si un producto es favorito
    const isFavorite = useCallback((productId) => {
        try {
            if (!productId || !isAuthenticated) return false;
            
            // Asegurar que favorites sea un array antes de usar some()
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

    /**
     * ✅ ACTUALIZADA: Limpiar todos los favoritos con sistema híbrido
     */
    const clearAllFavorites = useCallback(async () => {
        try {
            if (!isAuthenticated) {
                return false;
            }

            const token = getBestAvailableToken();
            if (!token) {
                return false;
            }

            // Si el backend tiene un endpoint para limpiar todos los favoritos
            // puedes implementarlo aquí, por ahora simplemente recargamos
            await getFavorites(token);
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    }, [isAuthenticated, getBestAvailableToken, getFavorites]);

    /**
     * ✅ ACTUALIZADA: Toggle favorito usando API con sistema híbrido
     */
    const toggleFavorite = useCallback(async (product) => {
        try {
            if (!product) {
                console.error('No product provided to toggle');
                return false;
            }

            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión');
                return false;
            }

            const token = getBestAvailableToken();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return false;
            }

            const productId = getProductId(product);
            
            if (!productId) {
                console.error('Product has no valid ID for toggle:', product);
                return false;
            }
            
            console.log('Toggling favorite for product:', {
                productId,
                productName: product.name,
                currentlyFavorite: isFavorite(productId)
            });

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/favorites/toggle', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({ 
                    productId: productId 
                })
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta toggle favorito:', data);

            if (response.ok && data.success) {
                console.log('Toggle favorito exitoso');
                
                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token && setAuthToken && typeof setAuthToken === 'function') {
                    setAuthToken(data.token);
                }
                
                // Actualizar la lista de favoritos
                await getFavorites(token);
                return data.action === 'added'; // Retorna si fue agregado
            } else {
                const errorMsg = data.message || 'Error al actualizar favorito';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
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
            return false;
        }
    }, [isAuthenticated, getAuthHeaders, getBestAvailableToken, setAuthToken, getProductId, isFavorite, getFavorites]);

    // Función para obtener un producto favorito por ID (útil para debugging)
    const getFavoriteProduct = useCallback((productId) => {
        if (!productId) return null;
        
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        return currentFavorites.find(fav => getProductId(fav) === productId) || null;
    }, [favorites, getProductId]);

    // Función para refrescar/recargar favoritos (útil para debugging)
    const refreshFavorites = useCallback(() => {
        if (isAuthenticated) {
            getFavorites();
        }
    }, [getFavorites, isAuthenticated]);

    // Función para limpiar errores
    const clearFavoritesError = useCallback(() => {
        setFavoritesError(null);
    }, []);

    // Asegurar que favorites siempre sea un array para el value
    const safeFavorites = Array.isArray(favorites) ? favorites : [];

    const value = {
        favorites: safeFavorites,
        isLoading,
        favoritesError,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearAllFavorites,
        toggleFavorite,
        getFavoriteProduct,
        refreshFavorites,
        getFavorites,
        fetchFavoriteProducts,
        clearFavoritesError,
        favoritesCount: safeFavorites.length
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
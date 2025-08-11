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

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);
    const { user, isAuthenticated } = useAuth();

    // Debug: Log cada vez que favorites cambie
    useEffect(() => {
        console.log('Favorites updated:', {
            favorites,
            isArray: Array.isArray(favorites),
            length: favorites.length,
            type: typeof favorites
        });
    }, [favorites]);

    // Función para obtener el token del localStorage
    const getTokenFromStorage = useCallback(() => {
        try {
            return localStorage.getItem('authToken');
        } catch (error) {
            console.error('Error al obtener el token del storage:', error);
            return null;
        }
    }, []);

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

    // NUEVA: Obtener favoritos desde el servidor
    const getFavorites = useCallback(async (token = null) => {
        try {
            setIsLoading(true);
            setFavoritesError(null);

            if (!isAuthenticated) {
                console.log('Usuario no autenticado, limpiando favoritos');
                setFavorites([]);
                return [];
            }

            const authToken = token || getTokenFromStorage();
            if (!authToken) {
                console.log('No hay token para obtener favoritos');
                setFavorites([]);
                return [];
            }

            console.log('Obteniendo favoritos desde el servidor...');

            const response = await fetch('https://marquesa.onrender.com/api/clients/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta de favoritos:', data);

                if (data && data.success) {
                    const userFavorites = data.favorites || data.data || [];
                    console.log('Favoritos obtenidos:', userFavorites);
                    
                    // Normalizar favoritos si es necesario
                    const normalizedFavorites = userFavorites.map(fav => {
                        if (typeof fav === 'string') {
                            // Si es solo un ID, crear un objeto básico
                            return { _id: fav, id: fav };
                        }
                        return normalizeProduct(fav) || fav;
                    }).filter(fav => fav !== null);
                    
                    setFavorites(normalizedFavorites);
                    return normalizedFavorites;
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
            setFavoritesError('Error al obtener favoritos');
            setFavorites([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, getTokenFromStorage, normalizeProduct]);

    // NUEVA: Función para obtener datos completos de productos favoritos
    const fetchFavoriteProducts = useCallback(async (productIds, token) => {
        try {
            if (!productIds || productIds.length === 0) {
                return [];
            }

            console.log('Obteniendo datos completos de productos favoritos:', productIds);

            const authToken = token || getTokenFromStorage();
            
            // Obtener todos los productos
            const response = await fetch('https://marquesa.onrender.com/api/products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
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
    }, [getTokenFromStorage]);

    // Cargar favoritos cuando cambie el usuario
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            getFavorites();
        } else {
            setFavorites([]);
        }
    }, [isAuthenticated, user?.id, getFavorites]);

    // ACTUALIZADA: Agregar producto a favoritos usando API
    const addToFavorites = useCallback(async (product) => {
        try {
            console.log('Adding to favorites - Raw product:', product);
            
            if (!isAuthenticated) {
                setFavoritesError('Debes iniciar sesión para agregar favoritos');
                return false;
            }

            const token = getTokenFromStorage();
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
                return true;
            } else {
                const errorMsg = data.message || 'Error al agregar a favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            setFavoritesError('Error de conexión con el servidor');
            return false;
        }
    }, [isAuthenticated, getTokenFromStorage, normalizeProduct, getProductId, getFavorites]);

    // ACTUALIZADA: Remover producto de favoritos usando API
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

            const token = getTokenFromStorage();
            if (!token) {
                setFavoritesError('No hay sesión activa');
                return false;
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
                return true;
            } else {
                const errorMsg = data.message || 'Error al remover de favoritos';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            setFavoritesError('Error de conexión con el servidor');
            return false;
        }
    }, [isAuthenticated, getTokenFromStorage, getFavorites]);

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

    // ACTUALIZADA: Limpiar todos los favoritos
    const clearAllFavorites = useCallback(async () => {
        try {
            if (!isAuthenticated) {
                return false;
            }

            const token = getTokenFromStorage();
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
    }, [isAuthenticated, getTokenFromStorage, getFavorites]);

    // ACTUALIZADA: Toggle favorito usando API
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

            const token = getTokenFromStorage();
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
                return data.isAdded || !isFavorite(productId); // Retorna si fue agregado
            } else {
                const errorMsg = data.message || 'Error al actualizar favorito';
                console.error('Error del servidor:', data);
                setFavoritesError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setFavoritesError('Error de conexión con el servidor');
            return false;
        }
    }, [isAuthenticated, getTokenFromStorage, getProductId, isFavorite, getFavorites]);

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
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

    // Generar key única para cada usuario
    const getFavoritesKey = useCallback(() => {
        if (!isAuthenticated || !user?.id) return 'favorites_guest';
        return `favorites_user_${user.id}`;
    }, [isAuthenticated, user?.id]);

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

    // Cargar favoritos cuando cambie el usuario
    useEffect(() => {
        loadFavorites();
    }, [isAuthenticated, user?.id]);

    const loadFavorites = useCallback(() => {
        try {
            setIsLoading(true);
            const favoritesKey = getFavoritesKey();
            const savedFavorites = localStorage.getItem(favoritesKey);
            
            console.log('Loading favorites from localStorage:', {
                key: favoritesKey,
                rawData: savedFavorites
            });
            
            if (savedFavorites) {
                const parsed = JSON.parse(savedFavorites);
                console.log('Parsed favorites:', parsed, 'isArray:', Array.isArray(parsed));
                
                // Validación extra para asegurar que siempre sea un array
                if (Array.isArray(parsed)) {
                    // Re-normalizar productos al cargar (por si la estructura ha cambiado)
                    const normalizedFavorites = parsed
                        .map(product => normalizeProduct(product))
                        .filter(product => product !== null);
                    
                    setFavorites(normalizedFavorites);
                } else {
                    console.warn('Parsed favorites is not an array, setting empty array');
                    setFavorites([]);
                    // Limpiar localStorage si los datos están corruptos
                    localStorage.removeItem(favoritesKey);
                }
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            setFavorites([]);
            // Limpiar localStorage en caso de error de parsing
            try {
                const favoritesKey = getFavoritesKey();
                localStorage.removeItem(favoritesKey);
            } catch (cleanupError) {
                console.error('Error cleaning up localStorage:', cleanupError);
            }
        } finally {
            setIsLoading(false);
        }
    }, [getFavoritesKey, normalizeProduct]);

    const saveFavorites = useCallback((newFavorites) => {
        try {
            // Validación antes de guardar
            if (!Array.isArray(newFavorites)) {
                console.error('Attempting to save non-array as favorites:', newFavorites);
                return false;
            }

            const favoritesKey = getFavoritesKey();
            console.log('Saving favorites:', {
                key: favoritesKey,
                favorites: newFavorites,
                count: newFavorites.length
            });
            
            localStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
            return true;
        } catch (error) {
            console.error('Error guardando favoritos:', error);
            return false;
        }
    }, [getFavoritesKey]);

    const addToFavorites = useCallback((product) => {
        try {
            console.log('Adding to favorites - Raw product:', product);
            
            // Normalizar el producto antes de agregarlo
            const normalizedProduct = normalizeProduct(product);
            
            if (!normalizedProduct) {
                console.error('Failed to normalize product:', product);
                return false;
            }

            const productId = getProductId(normalizedProduct);
            
            // Asegurar que favorites sea un array antes de usar some()
            const currentFavorites = Array.isArray(favorites) ? favorites : [];
            const isAlreadyFavorite = currentFavorites.some(fav => getProductId(fav) === productId);
            
            if (!isAlreadyFavorite) {
                const newFavorites = [...currentFavorites, normalizedProduct];
                console.log('Adding product to favorites:', {
                    productId,
                    productName: normalizedProduct.name,
                    newCount: newFavorites.length
                });
                
                return saveFavorites(newFavorites);
            } else {
                console.log('Product already in favorites:', productId);
                return false;
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return false;
        }
    }, [favorites, normalizeProduct, getProductId, saveFavorites]);

    const removeFromFavorites = useCallback((productId) => {
        try {
            if (!productId) {
                console.error('No productId provided for removal');
                return false;
            }

            // Asegurar que favorites sea un array antes de usar filter()
            const currentFavorites = Array.isArray(favorites) ? favorites : [];
            
            // Buscar por cualquiera de los dos campos de ID
            const newFavorites = currentFavorites.filter(fav => {
                const favId = getProductId(fav);
                return favId !== productId;
            });
            
            console.log('Removing from favorites:', {
                productId,
                oldCount: currentFavorites.length,
                newCount: newFavorites.length,
                removed: currentFavorites.length !== newFavorites.length
            });
            
            return saveFavorites(newFavorites);
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    }, [favorites, getProductId, saveFavorites]);

    const isFavorite = useCallback((productId) => {
        try {
            if (!productId) return false;
            
            // Asegurar que favorites sea un array antes de usar some()
            const currentFavorites = Array.isArray(favorites) ? favorites : [];
            return currentFavorites.some(fav => getProductId(fav) === productId);
        } catch (error) {
            console.error('Error checking if favorite:', error);
            return false;
        }
    }, [favorites, getProductId]);

    const clearAllFavorites = useCallback(() => {
        try {
            return saveFavorites([]);
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    }, [saveFavorites]);

    const toggleFavorite = useCallback((product) => {
        try {
            if (!product) {
                console.error('No product provided to toggle');
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

            if (isFavorite(productId)) {
                removeFromFavorites(productId);
                return false; // Was removed
            } else {
                return addToFavorites(product); // Returns true if added successfully
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    }, [getProductId, isFavorite, removeFromFavorites, addToFavorites]);

    // Función para obtener un producto favorito por ID (útil para debugging)
    const getFavoriteProduct = useCallback((productId) => {
        if (!productId) return null;
        
        const currentFavorites = Array.isArray(favorites) ? favorites : [];
        return currentFavorites.find(fav => getProductId(fav) === productId) || null;
    }, [favorites, getProductId]);

    // Función para refrescar/recargar favoritos (útil para debugging)
    const refreshFavorites = useCallback(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Asegurar que favorites siempre sea un array para el value
    const safeFavorites = Array.isArray(favorites) ? favorites : [];

    const value = {
        favorites: safeFavorites,
        isLoading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearAllFavorites,
        toggleFavorite,
        getFavoriteProduct, // Nueva función para debugging
        refreshFavorites, // Nueva función para debugging
        favoritesCount: safeFavorites.length
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
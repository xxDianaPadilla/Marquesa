import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Generar key única para cada usuario
    const getFavoritesKey = () => {
        if (!isAuthenticated || !user?.id) return 'favorites_guest';
        return `favorites_user_${user.id}`;
    };

    // Función para normalizar el ID del producto (maneja tanto _id como id)
    const getProductId = (product) => {
        return product._id || product.id;
    };

    // Cargar favoritos cuando cambie el usuario
    useEffect(() => {
        loadFavorites();
    }, [isAuthenticated, user?.id]);

    const loadFavorites = () => {
        try {
            setIsLoading(true);
            const favoritesKey = getFavoritesKey();
            const savedFavorites = localStorage.getItem(favoritesKey);
            
            if (savedFavorites) {
                const parsed = JSON.parse(savedFavorites);
                setFavorites(Array.isArray(parsed) ? parsed : []);
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            setFavorites([]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveFavorites = (newFavorites) => {
        try {
            const favoritesKey = getFavoritesKey();
            localStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Error guardando favoritos:', error);
        }
    };

    const addToFavorites = (product) => {
        const productId = getProductId(product);
        const isAlreadyFavorite = favorites.some(fav => getProductId(fav) === productId);
        
        if (!isAlreadyFavorite) {
            // Normalizar el producto para asegurar que tenga un ID consistente
            const normalizedProduct = {
                ...product,
                id: productId, // Siempre mantener 'id' para consistencia
                _id: productId, // Mantener '_id' también por si acaso
                addedAt: new Date().toISOString(),
                userId: user?.id || 'guest'
            };
            
            const newFavorites = [...favorites, normalizedProduct];
            saveFavorites(newFavorites);
            return true;
        }
        return false;
    };

    const removeFromFavorites = (productId) => {
        // Buscar por cualquiera de los dos campos de ID
        const newFavorites = favorites.filter(fav => {
            const favId = getProductId(fav);
            return favId !== productId;
        });
        saveFavorites(newFavorites);
        return true;
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => getProductId(fav) === productId);
    };

    const clearAllFavorites = () => {
        saveFavorites([]);
    };

    const toggleFavorite = (product) => {
        const productId = getProductId(product);
        
        if (isFavorite(productId)) {
            removeFromFavorites(productId);
            return false;
        } else {
            addToFavorites(product);
            return true;
        }
    };

    const value = {
        favorites,
        isLoading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        clearAllFavorites,
        toggleFavorite,
        favoritesCount: favorites.length
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
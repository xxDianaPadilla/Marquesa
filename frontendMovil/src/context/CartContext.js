import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated, getBestAvailableToken } = useAuth();
    
    // Estados del carrito
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    // Base URL del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // Función helper para obtener headers con token
    const getAuthHeaders = useCallback(async () => {
        const token = await getBestAvailableToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }, [getBestAvailableToken]);

    // Función para manejar errores de red
    const handleNetworkError = (error) => {
        console.error('Cart Network Error:', error);
        
        if (error.message === 'TIMEOUT') {
            return 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.message?.includes('network')) {
            return 'Error de red. Verifica tu conexión a internet.';
        }
        
        return 'Error de conexión con el servidor';
    };

    // Función para realizar peticiones con timeout
    const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
        const operationPromise = fetch(url, options);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
        });

        return Promise.race([operationPromise, timeoutPromise]);
    };

    // Obtener carrito activo del usuario
    const getActiveCart = useCallback(async () => {
        try {
            if (!isAuthenticated || !user?.id) {
                console.log('Usuario no autenticado, limpiando carrito');
                setCart(null);
                setCartItemsCount(0);
                return null;
            }

            setCartLoading(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            console.log('Obteniendo carrito activo para usuario:', user.id);

            const response = await fetchWithTimeout(
                `${API_BASE_URL}/shopping-cart/active/${user.id}`,
                {
                    method: 'GET',
                    headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta getActiveCart:', data);

                if (data.success && data.cart) {
                    setCart(data.cart);
                    setCartItemsCount(data.cart.items ? data.cart.items.length : 0);
                    return data.cart;
                } else {
                    console.warn('No se pudo obtener carrito activo:', data.message);
                    setCart(null);
                    setCartItemsCount(0);
                    return null;
                }
            } else if (response.status === 404) {
                // No existe carrito activo, esto es normal
                console.log('No hay carrito activo para el usuario');
                setCart(null);
                setCartItemsCount(0);
                return null;
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al obtener carrito activo:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            setCart(null);
            setCartItemsCount(0);
            return null;
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders]);

    // Agregar producto al carrito
    const addToCart = useCallback(async (product, quantity = 1, itemType = 'product') => {
        try {
            if (!isAuthenticated || !user?.id) {
                return { 
                    success: false, 
                    message: 'Debes iniciar sesión para agregar productos al carrito' 
                };
            }

            if (!product || !product._id) {
                return { 
                    success: false, 
                    message: 'Producto inválido' 
                };
            }

            setCartLoading(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Agregando al carrito:', {
                productId: product._id,
                productName: product.name,
                quantity,
                itemType
            });

            const response = await fetchWithTimeout(
                `${API_BASE_URL}/shopping-cart/add-item`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        clientId: user.id,
                        itemId: product._id,
                        quantity: parseInt(quantity),
                        itemType
                    })
                }
            );

            const data = await response.json();
            console.log('Respuesta addToCart:', data);

            if (response.ok && data.success) {
                // Actualizar el carrito local
                setCart(data.shoppingCart);
                setCartItemsCount(data.shoppingCart.items ? data.shoppingCart.items.length : 0);
                
                return { 
                    success: true, 
                    message: data.message || 'Producto agregado al carrito',
                    cart: data.shoppingCart
                };
            } else {
                const errorMsg = data.message || 'Error al agregar al carrito';
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders]);

    // Actualizar cantidad de un item en el carrito
    const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
        try {
            if (!isAuthenticated || !user?.id) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            if (!itemId || !newQuantity || newQuantity < 1) {
                return { success: false, message: 'Parámetros inválidos' };
            }

            setCartLoading(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Actualizando cantidad:', { itemId, newQuantity });

            const response = await fetchWithTimeout(
                `${API_BASE_URL}/shopping-cart/update-quantity`,
                {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        clientId: user.id,
                        itemId,
                        quantity: parseInt(newQuantity)
                    })
                }
            );

            const data = await response.json();
            console.log('Respuesta updateItemQuantity:', data);

            if (response.ok && data.success) {
                // Actualizar el carrito local
                setCart(data.shoppingCart);
                setCartItemsCount(data.shoppingCart.items ? data.shoppingCart.items.length : 0);
                
                return { 
                    success: true, 
                    message: data.message || 'Cantidad actualizada',
                    cart: data.shoppingCart
                };
            } else {
                const errorMsg = data.message || 'Error al actualizar cantidad';
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders]);

    // Remover item del carrito
    const removeFromCart = useCallback(async (itemId) => {
        try {
            if (!isAuthenticated || !user?.id) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            if (!itemId) {
                return { success: false, message: 'ID de item requerido' };
            }

            setCartLoading(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Removiendo del carrito:', itemId);

            const response = await fetchWithTimeout(
                `${API_BASE_URL}/shopping-cart/remove-item`,
                {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({
                        clientId: user.id,
                        itemId
                    })
                }
            );

            const data = await response.json();
            console.log('Respuesta removeFromCart:', data);

            if (response.ok && data.success) {
                // Actualizar el carrito local
                setCart(data.shoppingCart);
                setCartItemsCount(data.shoppingCart.items ? data.shoppingCart.items.length : 0);
                
                return { 
                    success: true, 
                    message: data.message || 'Producto eliminado del carrito',
                    cart: data.shoppingCart
                };
            } else {
                const errorMsg = data.message || 'Error al eliminar del carrito';
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error al remover del carrito:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders]);

    // Limpiar carrito después de compra
    const clearCartAfterPurchase = useCallback(async () => {
        try {
            if (!isAuthenticated || !user?.id || !cart?._id) {
                return { success: false, message: 'No hay carrito para limpiar' };
            }

            setCartLoading(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Limpiando carrito después de compra:', cart._id);

            const response = await fetchWithTimeout(
                `${API_BASE_URL}/shopping-cart/${cart._id}/clear-after-purchase`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        userId: user.id
                    })
                }
            );

            const data = await response.json();
            console.log('Respuesta clearCartAfterPurchase:', data);

            if (response.ok && data.success) {
                // Actualizar con el nuevo carrito activo
                setCart(data.activeCart);
                setCartItemsCount(0);
                
                return { 
                    success: true, 
                    message: data.message || 'Carrito limpiado exitosamente',
                    activeCart: data.activeCart
                };
            } else {
                const errorMsg = data.message || 'Error al limpiar carrito';
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error al limpiar carrito:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated, user?.id, cart?._id, getAuthHeaders]);

    // Refrescar carrito
    const refreshCart = useCallback(async () => {
        if (isAuthenticated) {
            return await getActiveCart();
        }
        return null;
    }, [getActiveCart, isAuthenticated]);

    // Limpiar datos del carrito
    const clearCartData = useCallback(() => {
        setCart(null);
        setCartItemsCount(0);
        setCartError(null);
        setCartLoading(false);
    }, []);

    // Limpiar errores
    const clearCartError = useCallback(() => {
        setCartError(null);
    }, []);

    // Efectos
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            console.log('Usuario autenticado, cargando carrito...');
            getActiveCart();
        } else {
            console.log('Usuario no autenticado, limpiando carrito');
            clearCartData();
        }
    }, [isAuthenticated, user?.id]);

    // Calcular totales del carrito
    const cartTotal = cart?.total || 0;
    const cartSubtotal = cart?.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;

    // Verificar si un producto está en el carrito
    const isInCart = useCallback((productId) => {
        if (!cart?.items || !productId) return false;
        return cart.items.some(item => 
            item.itemId?._id === productId || item.itemId === productId
        );
    }, [cart?.items]);

    // Obtener cantidad de un producto en el carrito
    const getItemQuantity = useCallback((productId) => {
        if (!cart?.items || !productId) return 0;
        const item = cart.items.find(item => 
            item.itemId?._id === productId || item.itemId === productId
        );
        return item?.quantity || 0;
    }, [cart?.items]);

    const contextValue = {
        // Estado del carrito
        cart,
        cartLoading,
        cartError,
        cartItemsCount,
        cartTotal,
        cartSubtotal,

        // Funciones del carrito
        getActiveCart,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        clearCartAfterPurchase,
        refreshCart,
        clearCartData,
        clearCartError,

        // Utilidades
        isInCart,
        getItemQuantity,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
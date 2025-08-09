import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../context/AuthContext';

const useShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    
    // NUEVO: Estados para manejo de descuentos
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const { user, isAuthenticated, userInfo } = useAuth();

    const fetchShoppingCart = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await fetch(`http://localhost:4000/api/shoppingCart/client/${user.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos del backend:', data);

                if (data.success && data.shoppingCart) {
                    const cart = data.shoppingCart;

                    if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
                        const transformedItems = cart.items.map(item => {
                            let transformedItem = {
                                id: item.itemId?._id || item.itemId,
                                quantity: item.quantity || 1,
                                itemType: item.itemType,
                                subtotal: item.subtotal,
                                _originalItem: item
                            };

                            if (item.itemType === 'product') {
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.name || 'Producto sin nombre',
                                    description: item.itemId?.description || '',
                                    price: item.itemId?.price || 0,
                                    image: item.itemId?.images?.[0]?.image || item.itemId?.image || ''
                                };
                            } else if (item.itemType === 'custom') {
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.productToPersonalize || 'Producto personalizado',
                                    description: item.itemId?.extraComments || 'Producto personalizado',
                                    price: item.itemId?.totalPrice || 0,
                                    image: item.itemId?.referenceImage || '🎨'
                                };
                            } else {
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.name || item.itemId?.productToPersonalize || 'Producto',
                                    description: item.itemId?.description || item.itemId?.extraComments || '',
                                    price: item.itemId?.price || item.itemId?.totalPrice || 0,
                                    image: item.itemId?.images?.[0]?.image || item.itemId?.referenceImage || '📦'
                                };
                            }

                            return transformedItem;
                        });

                        setCartItems(transformedItems);
                        setCartTotal(cart.total || 0);
                    } else {
                        setCartItems([]);
                        setCartTotal(0);
                    }
                } else {
                    setCartItems([]);
                    setCartTotal(0);
                }
            } else if (response.status === 404) {
                setCartItems([]);
                setCartTotal(0);
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al obtener el carrito: ', error);
            setError('Error al cargar el carrito de compras');
            setCartItems([]);
            setCartTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    const updateQuantity = useCallback(async (itemId, newQuantity) => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        if (newQuantity < 1 || newQuantity > 99) {
            setError('La cantidad debe estar entre 1 y 99');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/update-quantity`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId,
                    quantity: newQuantity
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCartItems(prevItems =>
                        prevItems.map(item => {
                            if (item.id === itemId || item._originalItem?.itemId === itemId) {
                                const updatedPrice = item.price * newQuantity;
                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    subtotal: updatedPrice
                                };
                            }
                            return item;
                        })
                    );

                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al actualizar cantidad');
                }
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al actualizar cantidad: ', error);
            setError(error.message || 'Error al actualizar la cantidad');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const removeItem = useCallback(async (itemId) => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/remove-item`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCartItems(prevItems =>
                        prevItems.filter(item =>
                            item.id !== itemId && item._originalItem?.itemId !== itemId
                        )
                    );

                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al eliminar producto');
                }
            } else {
                throw new Error('Error al eliminar item: ', error);
            }
        } catch (error) {
            console.error('Error al eliminar item: ', error);
            setError(error.message || 'Error al eliminar el producto');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const addToCart = useCallback(async (productId, quantity = 1, itemType = 'product') => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/add-item`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: productId,
                    quantity: quantity,
                    itemType: itemType
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al agregar producto');
                }
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al agregar al carrito: ', error);
            setError(error.message || 'Error al agregar el producto al carrito');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    // NUEVA FUNCIÓN: Aplicar descuento
    const applyDiscount = useCallback((discountData, amount) => {
        setAppliedDiscount(discountData);
        setDiscountAmount(amount);
    }, []);

    // NUEVA FUNCIÓN: Remover descuento
    const removeDiscount = useCallback(() => {
        setAppliedDiscount(null);
        setDiscountAmount(0);
    }, []);

    // NUEVA FUNCIÓN: Marcar código como usado al procesar pago
    const markDiscountAsUsed = useCallback(async (orderId = null) => {
        if (!appliedDiscount || !user?.id) {
            return false;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/clients/${user.id}/use-code`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codeId: appliedDiscount.codeId,
                    orderId: orderId
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // Limpiar descuento aplicado después de marcarlo como usado
                removeDiscount();
                return true;
            } else {
                console.error('Error marcando código como usado:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error al marcar código como usado:', error);
            return false;
        }
    }, [appliedDiscount, user?.id, removeDiscount]);

    // NUEVA FUNCIÓN: Obtener códigos promocionales del cliente
    const getPromotionalCodes = useCallback(async (status = null) => {
        if (!isAuthenticated || !user?.id) {
            return { success: false, codes: [] };
        }

        try {
            const url = status 
                ? `http://localhost:4000/api/clients/${user.id}/promotional-codes?status=${status}`
                : `http://localhost:4000/api/clients/${user.id}/promotional-codes`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                return {
                    success: true,
                    codes: data.codes,
                    activeCount: data.activeCount,
                    usedCount: data.usedCount,
                    expiredCount: data.expiredCount
                };
            } else {
                return { success: false, codes: [], message: data.message };
            }
        } catch (error) {
            console.error('Error obteniendo códigos promocionales:', error);
            return { success: false, codes: [], message: 'Error al obtener códigos' };
        }
    }, [isAuthenticated, user?.id]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        await fetchShoppingCart();
    }, [fetchShoppingCart]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchShoppingCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            setError(null);
            // Limpiar descuentos si no hay usuario autenticado
            setAppliedDiscount(null);
            setDiscountAmount(0);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    // Calcular subtotal sin descuentos
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    // Calcular subtotal con descuentos aplicados
    const subtotalWithDiscount = Math.max(0, subtotal - discountAmount);

    // Calcular total final (incluyendo envío si es necesario)
    const finalTotal = subtotalWithDiscount;

    return {
        // Estados existentes
        cartItems,
        cartTotal,
        subtotal,
        loading,
        error,
        updating,
        isAuthenticated,
        user,
        userInfo,

        // Nuevos estados para descuentos
        appliedDiscount,
        discountAmount,
        subtotalWithDiscount,
        finalTotal,

        // Funciones existentes
        updateQuantity,
        removeItem,
        addToCart,
        clearError,
        refreshCart,

        // Nuevas funciones para descuentos
        applyDiscount,
        removeDiscount,
        markDiscountAsUsed,
        getPromotionalCodes,

        // Propiedades calculadas
        itemCount: cartItems.length,
        isEmpty: cartItems.length === 0,
        hasDiscount: appliedDiscount !== null
    };
};

export default useShoppingCart;
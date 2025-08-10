import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../context/AuthContext';

const useShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [subTotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    // NUEVO: Estados para manejo de descuentos
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        console.log('🔍 ESTADO DESCUENTO CAMBIÓ:', {
            appliedDiscount,
            discountAmount,
            hasDiscount: !!appliedDiscount,
            timestamp: new Date().toISOString()
        });
    }, [appliedDiscount, discountAmount]);

    const { user, isAuthenticated, userInfo } = useAuth();

    // ✅ FUNCIÓN CORREGIDA: Obtener carrito activo (nueva lógica)
    const fetchShoppingCart = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            return;
        }

        try {
            setError(null);

            // ✅ CAMBIO PRINCIPAL: Usar la nueva ruta /active/:userId
            const response = await fetch(`http://localhost:4000/api/shoppingCart/active/${user.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos del backend (carrito activo):', data);

                // ✅ ESTRUCTURA ACTUALIZADA: La nueva ruta devuelve { cart } en lugar de { shoppingCart }
                if (data.cart) {
                    const cart = data.cart;

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
            console.error('Error al obtener el carrito activo: ', error);
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
        console.log('✅ APLICANDO DESCUENTO:', {
            discountData,
            amount,
            timestamp: new Date().toISOString()
        });

        setAppliedDiscount(discountData);
        setDiscountAmount(amount);

        // ✅ NUEVO: Guardar en sessionStorage como backup
        try {
            sessionStorage.setItem('tempAppliedDiscount', JSON.stringify({
                discountData,
                amount,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('No se pudo guardar descuento en sessionStorage:', error);
        }
    }, []);

    // NUEVA FUNCIÓN: Remover descuento
    const removeDiscount = useCallback(() => {
        console.log('❌ REMOVIENDO DESCUENTO:', {
            previousDiscount: appliedDiscount,
            timestamp: new Date().toISOString()
        });

        setAppliedDiscount(null);
        setDiscountAmount(0);

        // Limpiar sessionStorage
        try {
            sessionStorage.removeItem('tempAppliedDiscount');
        } catch (error) {
            console.warn('No se pudo limpiar sessionStorage:', error);
        }
    }, [appliedDiscount]);

    const recoverDiscountFromStorage = useCallback(() => {
        try {
            const stored = sessionStorage.getItem('tempAppliedDiscount');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Solo recuperar si es reciente (menos de 30 minutos)
                if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    console.log('🔄 RECUPERANDO DESCUENTO DE STORAGE:', parsed);
                    setAppliedDiscount(parsed.discountData);
                    setDiscountAmount(parsed.amount);
                    return true;
                } else {
                    sessionStorage.removeItem('tempAppliedDiscount');
                }
            }
        } catch (error) {
            console.warn('Error recuperando descuento:', error);
        }
        return false;
    }, []);

    // FUNCIÓN CORREGIDA: Marcar descuento como usado con orden real
    const markDiscountAsUsedWithRealOrder = useCallback(async (realOrderId) => {
        console.log('🎫 === INICIO MARCAR DESCUENTO COMO USADO ===');
        console.log('Datos iniciales:', {
            appliedDiscount,
            discountAmount,
            hasDiscount: !!appliedDiscount,
            hasUser: !!user?.id,
            hasOrderId: !!realOrderId,
            userId: user?.id,
            orderId: realOrderId
        });

        // ✅ NUEVO: Intentar recuperar descuento si se perdió
        if (!appliedDiscount) {
            console.log('⚠️ Descuento no encontrado, intentando recuperar...');
            const recovered = recoverDiscountFromStorage();
            if (!recovered) {
                console.error('❌ No se pudo recuperar el descuento aplicado');
                return false;
            }
        }

        if (!appliedDiscount || !user?.id || !realOrderId) {
            console.error('❌ Datos faltantes para marcar descuento:', {
                hasDiscount: !!appliedDiscount,
                hasUser: !!user?.id,
                hasOrderId: !!realOrderId,
                appliedDiscountValue: appliedDiscount,
                userIdValue: user?.id,
                orderIdValue: realOrderId
            });
            return false;
        }

        try {
            console.log('📤 Enviando request para marcar código como usado:', {
                userId: user.id,
                codeId: appliedDiscount.codeId,
                orderId: realOrderId,
                url: `http://localhost:4000/api/clients/${user.id}/use-code`
            });

            const response = await fetch(`http://localhost:4000/api/clients/${user.id}/use-code`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codeId: appliedDiscount.codeId,
                    orderId: realOrderId
                })
            });

            console.log('📥 Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            const data = await response.json();
            console.log('📊 Datos de respuesta:', data);

            if (response.ok && data.success) {
                console.log('✅ SUCCESS: Código marcado como usado exitosamente:', data.usedCode);

                // Limpiar descuento aplicado después de marcarlo como usado
                removeDiscount();
                return true;
            } else {
                console.error('❌ Error en respuesta del servidor:', {
                    status: response.status,
                    message: data.message,
                    data: data
                });
                return false;
            }
        } catch (error) {
            console.error('❌ EXCEPCIÓN al marcar código como usado:', error);
            return false;
        }
    }, [appliedDiscount, user?.id, removeDiscount, recoverDiscountFromStorage]);

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

    // ✅ FUNCIÓN CORREGIDA: Limpiar carrito después de compra (mejorada)
    const clearCartAfterPurchase = useCallback(async (shoppingCartId) => {
        if (!isAuthenticated || !user?.id) {
            console.error('Usuario no autenticado para limpiar carrito');
            return false;
        }

        if (!shoppingCartId) {
            console.error('ID del carrito es requerido para limpiar');
            setError('ID del carrito no válido');
            return false;
        }

        try {
            setError(null);

            console.log('Limpiando carrito después de compra:', {
                cartId: shoppingCartId,
                userId: user.id
            });

            const response = await fetch(`http://localhost:4000/api/shoppingCart/${shoppingCartId}/clear-after-purchase`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });

            const data = await response.json();

            if (response.ok && data) {
                console.log('Respuesta del servidor al limpiar carrito:', data);

                // ✅ MEJORA: Limpiar el estado local del carrito inmediatamente
                setCartItems([]);
                setCartTotal(0);
                setSubtotal(0);

                // Limpiar descuentos aplicados
                setAppliedDiscount(null);
                setDiscountAmount(0);

                console.log('Carrito limpiado exitosamente después de la compra:', {
                    completedCart: data.completedCartId,
                    newCart: data.activeCart,
                    cleared: data.cleared
                });

                // ✅ MEJORA: Recargar carrito usando la nueva lógica
                await fetchShoppingCart();

                return {
                    success: true,
                    message: data.message,
                    completedCartId: data.completedCartId,
                    activeCart: data.activeCart,
                    cleared: data.cleared
                };
            } else {
                throw new Error(data.message || 'Error al limpiar carrito');
            }
        } catch (error) {
            console.error('Error al limpiar carrito después de compra:', error);
            setError(`Error al limpiar el carrito: ${error.message}`);
            return {
                success: false,
                message: error.message || 'Error al limpiar el carrito después de la compra'
            };
        }
    }, [user?.id, isAuthenticated, fetchShoppingCart]);

    // ✅ NUEVA FUNCIÓN: Limpiar carritos duplicados (usar una sola vez)
    const cleanupDuplicateCarts = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            console.error('Usuario no autenticado para limpieza');
            return false;
        }

        try {
            console.log('Ejecutando limpieza de carritos duplicados...');

            const response = await fetch(`http://localhost:4000/api/shoppingCart/cleanup-duplicates`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Limpieza completada:', data);

                // Recargar el carrito después de la limpieza
                await fetchShoppingCart();

                return {
                    success: true,
                    message: data.message,
                    cleanedCarts: data.cleanedCarts,
                    usersAffected: data.usersAffected
                };
            } else {
                throw new Error(data.message || 'Error en la limpieza');
            }
        } catch (error) {
            console.error('Error en limpieza de carritos:', error);
            return {
                success: false,
                message: error.message || 'Error al limpiar carritos duplicados'
            };
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

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
            // ⚠️ AQUÍ PODRÍA ESTAR EL PROBLEMA: Se limpia el descuento al cambiar autenticación
            console.log('🔄 Limpiando estado por cambio de autenticación');
            setAppliedDiscount(null);
            setDiscountAmount(0);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const isEmpty = cartItems.length === 0;

    const debugDiscountState = useCallback(() => {
        console.log('🔍 DEBUG ESTADO DESCUENTO:', {
            appliedDiscount,
            discountAmount,
            hasDiscount: !!appliedDiscount,
            cartItems: cartItems.length,
            isEmpty,
            isAuthenticated,
            userId: user?.id,
            timestamp: new Date().toISOString(),
            sessionStorage: (() => {
                try {
                    return sessionStorage.getItem('tempAppliedDiscount');
                } catch (e) {
                    return 'No disponible';
                }
            })()
        });
    }, [appliedDiscount, discountAmount, cartItems.length, isEmpty, isAuthenticated, user?.id]);

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
        markDiscountAsUsedWithRealOrder,
        getPromotionalCodes,

        debugDiscountState,
        recoverDiscountFromStorage,

        clearCartAfterPurchase,
        cleanupDuplicateCarts,

        // Propiedades calculadas
        itemCount: cartItems.length,
        isEmpty: cartItems.length === 0,
        hasDiscount: appliedDiscount !== null
    };
};

export default useShoppingCart;
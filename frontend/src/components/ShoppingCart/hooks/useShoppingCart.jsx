import { useState, useEffect, useCallback } from "react"; // Importando React
import { useAuth } from '../../../context/AuthContext'; // Importando el context para manejar el carrito

// Hook para manejar las acciones del carrito de compras
const useShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [subTotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const [activeCartId, setActiveCartId] = useState(null);

    // NUEVO: Estados para manejo de descuentos
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [pendingDiscount, setPendingDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        console.log('🔍 ESTADO DESCUENTO CAMBIÓ:', {
            appliedDiscount,
            discountAmount,
            hasDiscount: !!appliedDiscount,
            timestamp: new Date().toISOString()
        });
    }, [appliedDiscount, discountAmount]);

    const { user, isAuthenticated, userInfo, getBestAvailableToken, setAuthToken } = useAuth();

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

    // Obtener carrito activo (nueva lógica) con sistema híbrido
    const fetchShoppingCart = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            return;
        }

        try {
            setError(null);

            const response = await fetch(
                `https://marquesa.onrender.com/api/shoppingCart/active/${user.id}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Carrito recibido:', data);

                if (data.token) {
                    setAuthToken(data.token);
                }

                if (data.cart) {
                    const cart = data.cart;
                    setActiveCartId(cart._id);

                    // Procesar descuentos del carrito
                    if (cart.pendingDiscount) {
                        console.log('Descuento pendiente encontrado:', cart.pendingDiscount);
                        setPendingDiscount(cart.pendingDiscount);
                        setDiscountAmount(cart.pendingDiscount.amount || 0);
                    } else {
                        setPendingDiscount(null);
                        setDiscountAmount(0);
                    }

                    if (cart.appliedDiscount) {
                        console.log('Descuento aplicado encontrado:', cart.appliedDiscount);
                        setAppliedDiscount(cart.appliedDiscount);
                    } else {
                        setAppliedDiscount(null);
                    }

                    // Transformar items
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
                                    image: item.itemId?.image || item.itemId?.images?.[0]?.image || item.itemId?.images?.[0] || '',
                                    images: item.itemId?.images || []
                                };
                            } else if (item.itemType === 'custom') {
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.productToPersonalize || 'Producto personalizado',
                                    description: item.itemId?.extraComments || 'Producto personalizado',
                                    price: item.itemId?.totalPrice || 0,
                                    image: item.itemId?.referenceImage || item.itemId?.image || '',
                                    referenceImage: item.itemId?.referenceImage || ''
                                };
                            }

                            return transformedItem;
                        });

                        setCartItems(transformedItems);
                        setSubtotal(cart.subtotal || 0);
                        setCartTotal(cart.total || 0);
                    } else {
                        setCartItems([]);
                        setSubtotal(0);
                        setCartTotal(0);
                    }
                } else {
                    setCartItems([]);
                    setSubtotal(0);
                    setCartTotal(0);
                }
            } else if (response.status === 404) {
                setCartItems([]);
                setSubtotal(0);
                setCartTotal(0);
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al obtener el carrito activo:', error);
            setError('Error al cargar el carrito de compras');
            setCartItems([]);
            setSubtotal(0);
            setCartTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, setAuthToken]);

    // Función updateQuantity con sistema híbrido
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

            const operationPromise = fetch(`https://marquesa.onrender.com/api/shoppingCart/updateQuantity`, {
                method: 'PUT',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId,
                    quantity: newQuantity
                })
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // ✅ NUEVO: Manejo híbrido de tokens
                    if (data.token) {
                        setAuthToken(data.token);
                    }

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

            // ✅ NUEVO: Manejo específico de errores
            let errorMessage = 'Error al actualizar la cantidad';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            }

            setError(errorMessage);
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart, getAuthHeaders, setAuthToken]);

    // ✅ ACTUALIZADA: Función removeItem con sistema híbrido
    const removeItem = useCallback(async (itemId) => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            // ✅ OPCIÓN 1: Usar la ruta específica (preferida)
            let response = await fetch(`https://marquesa.onrender.com/api/shoppingCart/removeItem`, {
                method: 'DELETE',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId
                })
            });

            // ✅ OPCIÓN 2: Si la anterior falla, usar ruta alternativa
            if (!response.ok && response.status === 404) {
                console.log('⚠️ Ruta principal falló, intentando ruta alternativa...');

                response = await fetch(`https://marquesa.onrender.com/api/shoppingCart/client/${user.id}/items`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        itemId: itemId
                    })
                });
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Producto eliminado exitosamente');

                    if (data.token) {
                        setAuthToken(data.token);
                    }

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
                const errorText = await response.text();
                console.error('❌ Error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error eliminando item:', error);
            setError('Error al eliminar el producto');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart, getAuthHeaders, setAuthToken]);

    // ✅ ACTUALIZADA: Función addToCart con sistema híbrido
    const addToCart = useCallback(async (productId, quantity = 1, itemType = 'product') => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const operationPromise = fetch(`https://marquesa.onrender.com/api/shoppingCart/addItem`, {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: productId,
                    quantity: quantity,
                    itemType: itemType
                })
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // ✅ NUEVO: Manejo híbrido de tokens
                    if (data.token) {
                        setAuthToken(data.token);
                    }

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

            // ✅ NUEVO: Manejo específico de errores
            let errorMessage = 'Error al agregar el producto al carrito';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            }

            setError(errorMessage);
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart, getAuthHeaders, setAuthToken]);

    // NUEVA FUNCIÓN: Aplicar descuento
    const applyDiscount = useCallback(async (discountInfo, amount) => {
        if (!activeCartId) {
            console.error('No hay carrito activo');
            return false;
        }

        try {
            console.log('Aplicando descuento pendiente al carrito:', {
                cartId: activeCartId,
                discountInfo,
                amount
            });

            const response = await fetch(
                `https://marquesa.onrender.com/api/shoppingCart/${activeCartId}/pendingDiscount`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        code: discountInfo.code,
                        codeId: discountInfo.codeId,
                        name: discountInfo.name,
                        discount: discountInfo.discount,
                        amount: amount,
                        color: discountInfo.color,
                        textColor: discountInfo.textColor
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('Descuento pendiente aplicado:', data.cart);

                setPendingDiscount(data.cart.pendingDiscount);
                setDiscountAmount(amount);

                if (data.token) {
                    setAuthToken(data.token);
                }

                return true;
            } else {
                console.error('Error aplicando descuento:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error aplicando descuento:', error);
            return false;
        }
    }, [activeCartId, getAuthHeaders, setAuthToken]);

    // Remover descuento
    const removeDiscount = useCallback(async () => {
        if (!activeCartId) {
            console.error('No hay carrito activo');
            return false;
        }

        try {
            const response = await fetch(
                `https://marquesa.onrender.com/api/shoppingCart/${activeCartId}/pendingDiscount`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: getAuthHeaders()
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('Descuento pendiente removido');

                setPendingDiscount(null);
                setDiscountAmount(0);

                if (data.token) {
                    setAuthToken(data.token);
                }

                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error removiendo descuento:', error);
            return false;
        }
    }, [activeCartId, getAuthHeaders, setAuthToken]);

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

    //Función markDiscountAsUsedWithRealOrder con sistema híbrido
    const markDiscountAsUsedWithRealOrder = useCallback(async (realOrderId) => {
        console.log('=== INICIO MARCAR DESCUENTO COMO USADO ===');

        if (!pendingDiscount || !user?.id || !realOrderId || !activeCartId) {
            console.error('Datos faltantes:', {
                hasPendingDiscount: !!pendingDiscount,
                hasUser: !!user?.id,
                hasOrderId: !!realOrderId,
                hasCartId: !!activeCartId
            });
            return false;
        }

        try {
            // PASO 1: Confirmar descuento en el carrito
            console.log('Confirmando descuento en el carrito...');

            const confirmResponse = await fetch(
                `https://marquesa.onrender.com/api/shoppingCart/${activeCartId}/confirmDiscount`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ orderId: realOrderId })
                }
            );

            const confirmData = await confirmResponse.json();

            if (!confirmResponse.ok || !confirmData.success) {
                console.error('Error confirmando descuento en carrito:', confirmData.message);
                return false;
            }

            console.log('Descuento confirmado en carrito:', confirmData.cart);

            // PASO 2: Marcar código como usado en el cliente
            console.log('Marcando código como usado en cliente...');

            const useCodeResponse = await fetch(
                `https://marquesa.onrender.com/api/clients/${user.id}/useCode`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        codeId: pendingDiscount.codeId,
                        orderId: realOrderId
                    })
                }
            );

            const useCodeData = await useCodeResponse.json();

            if (useCodeResponse.ok && useCodeData.success) {
                console.log('Código marcado como usado exitosamente');

                if (useCodeData.token) {
                    setAuthToken(useCodeData.token);
                }

                // Limpiar descuento pendiente local
                setPendingDiscount(null);
                setDiscountAmount(0);

                return true;
            } else {
                console.error('Error marcando código como usado:', useCodeData.message);
                return false;
            }
        } catch (error) {
            console.error('EXCEPCIÓN al marcar código como usado:', error);
            return false;
        }
    }, [pendingDiscount, user?.id, activeCartId, getAuthHeaders, setAuthToken]);

    // ✅ ACTUALIZADA: Función getPromotionalCodes con sistema híbrido
    const getPromotionalCodes = useCallback(async (status = null) => {
        if (!isAuthenticated || !user?.id) {
            return { success: false, codes: [] };
        }

        try {
            const url = status
                ? `https://marquesa.onrender.com/api/clients/${user.id}/promotionalCodes?status=${status}`
                : `https://marquesa.onrender.com/api/clients/${user.id}/promotionalCodes`;

            const operationPromise = fetch(url, {
                method: 'GET',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders() // ✅ NUEVO: Headers híbridos
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();

            if (response.ok && data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token) {
                    setAuthToken(data.token);
                }

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

            // ✅ NUEVO: Manejo específico de errores
            let errorMessage = 'Error al obtener códigos';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            }

            return { success: false, codes: [], message: errorMessage };
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, setAuthToken]);

    // Limpiar carrito después de compra (mejorada) con sistema híbrido
    const clearCartAfterPurchase = useCallback(async (shoppingCartId, orderId) => {
        if (!isAuthenticated || !user?.id) {
            console.error('Usuario no autenticado');
            return false;
        }

        if (!shoppingCartId) {
            console.error('ID del carrito es requerido');
            return false;
        }

        try {
            console.log('Limpiando carrito después de compra:', {
                cartId: shoppingCartId,
                orderId,
                userId: user.id
            });

            const response = await fetch(
                `https://marquesa.onrender.com/api/shoppingCart/${shoppingCartId}/clearAfterPurchase`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        userId: user.id,
                        orderId: orderId
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data) {
                console.log('Carrito limpiado con descuento confirmado:', data);

                if (data.token) {
                    setAuthToken(data.token);
                }

                // Limpiar estado local
                setCartItems([]);
                setCartTotal(0);
                setSubtotal(0);
                setAppliedDiscount(null);
                setPendingDiscount(null);
                setDiscountAmount(0);

                // Recargar carrito
                await fetchShoppingCart();

                return {
                    success: true,
                    message: data.message,
                    discountConfirmed: data.discountConfirmed
                };
            } else {
                throw new Error(data.message || 'Error al limpiar carrito');
            }
        } catch (error) {
            console.error('Error al limpiar carrito:', error);
            setError('Error al limpiar el carrito');
            return {
                success: false,
                message: error.message
            };
        }
    }, [user?.id, isAuthenticated, fetchShoppingCart, getAuthHeaders, setAuthToken]);

    // ✅ NUEVA FUNCIÓN: Limpiar carritos duplicados (usar una sola vez) con sistema híbrido
    const cleanupDuplicateCarts = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            console.error('Usuario no autenticado para limpieza');
            return false;
        }

        try {
            console.log('Ejecutando limpieza de carritos duplicados...');

            const operationPromise = fetch(`https://marquesa.onrender.com/api/shoppingCart/cleanupDuplicates`, {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders() // ✅ NUEVO: Headers híbridos
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();

            if (response.ok) {
                console.log('Limpieza completada:', data);

                // ✅ NUEVO: Manejo híbrido de tokens
                if (data.token) {
                    setAuthToken(data.token);
                }

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

            // ✅ NUEVO: Manejo específico de errores
            let errorMessage = 'Error al limpiar carritos duplicados';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart, getAuthHeaders, setAuthToken]);

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
            setSubtotal(0);
            setLoading(false);
            setError(null);
            setAppliedDiscount(null);
            setPendingDiscount(null);
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
    const subtotalWithDiscount = Math.max(0, subTotal - discountAmount);

    // Calcular total final (incluyendo envío si es necesario)
    const finalTotal = subtotalWithDiscount;

    return {
        // Estados existentes
        cartItems,
        cartTotal,
        subtotal: subTotal,
        loading,
        error,
        updating,
        isAuthenticated,
        user,
        userInfo,
        activeCartId,

        // Nuevos estados para descuentos
        appliedDiscount,
        pendingDiscount,
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
        clearCartAfterPurchase,
        getPromotionalCodes,

        debugDiscountState,
        recoverDiscountFromStorage,

        clearCartAfterPurchase,
        cleanupDuplicateCarts,

        // Propiedades calculadas
        itemCount: cartItems.length,
        isEmpty: cartItems.length === 0,
        hasDiscount: pendingDiscount !== null || appliedDiscount !== null
    };
};

export default useShoppingCart;
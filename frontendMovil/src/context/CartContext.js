import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
    const { user, isAuthenticated, userInfo, getBestAvailableToken, authReady } = useAuth();
    
    // Estados del carrito
    const [cart, setCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [updating, setUpdating] = useState(false);

    // Estados para manejo de descuentos
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Referencias para evitar dependencias circulares
    const lastUserId = useRef(null);
    const isInitializing = useRef(false);
    const cartLoadPromise = useRef(null);
    const hasInitializedForUser = useRef(false);

    // Base URL del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // ✅ FUNCIONES HELPER PARA PRODUCTCARD - AGREGADAS AL CONTEXTO
    const isInCart = useCallback((productId) => {
        return cartItems.some(item => item.id === productId);
    }, [cartItems]);

    const getItemQuantity = useCallback((productId) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }, [cartItems]);

    // ✅ FUNCIÓN HELPER PARA OBTENER HEADERS - SIN DEPENDENCIAS DINÁMICAS
    const getAuthHeaders = useCallback(async () => {
        try {
            const token = await getBestAvailableToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            return headers;
        } catch (error) {
            console.error('Error obteniendo headers:', error);
            return { 'Content-Type': 'application/json' };
        }
    }, [getBestAvailableToken]);

    // ✅ FUNCIÓN PARA GUARDAR TOKEN - SIN DEPENDENCIAS DINÁMICAS
    const handleTokenResponse = useCallback(async (data) => {
        if (data.token) {
            try {
                const AsyncStorage = await import('@react-native-async-storage/async-storage').then(module => module.default);
                await AsyncStorage.setItem('authToken', data.token);
                console.log('Token guardado automáticamente');
            } catch (error) {
                console.warn('No se pudo guardar token automáticamente:', error);
            }
        }
    }, []);

    // ✅ FUNCIÓN PARA TRANSFORMAR ITEMS - SIN DEPENDENCIAS
    const transformCartItem = useCallback((item) => {
        console.log('Transformando item:', {
            itemType: item.itemType,
            itemId: item.itemId,
            hasItemId: !!item.itemId,
            itemIdType: typeof item.itemId
        });

        // Base del item transformado
        let transformedItem = {
            id: item.itemId?._id || item.itemId || item._id,
            quantity: item.quantity || 1,
            itemType: item.itemType || 'product',
            subtotal: item.subtotal || 0,
            _originalItem: item
        };

        if (item.itemType === 'product') {
            // Productos normales
            const product = item.itemId || {};
            transformedItem = {
                ...transformedItem,
                name: product.name || 'Producto sin nombre',
                description: product.description || '',
                price: product.price || 0,
                image: product.images?.[0]?.image || product.image || 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Producto',
                category: product.category || null,
                brand: product.brand || null
            };
        } else if (item.itemType === 'custom') {
            // PRODUCTOS PERSONALIZADOS 
            const customProduct = item.itemId || {};
            
            // Obtener información del producto personalizado
            const productName = customProduct.productToPersonalize || 'Producto personalizado';
            const extraComments = customProduct.extraComments || '';
            const totalPrice = customProduct.totalPrice || 0;
            const referenceImage = customProduct.referenceImage;
            
            // Construimos descripción más detallada para productos personalizados
            let description = 'Producto personalizado';
            if (extraComments) {
                description = extraComments;
            }
            
            // Agregamos detalles de personalización si están disponibles
            const personalizationDetails = [];
            if (customProduct.personalizationType) {
                personalizationDetails.push(`Tipo: ${customProduct.personalizationType}`);
            }
            if (customProduct.designDetails) {
                personalizationDetails.push(`Diseño: ${customProduct.designDetails}`);
            }
            if (customProduct.materialPreferences) {
                personalizationDetails.push(`Material: ${customProduct.materialPreferences}`);
            }
            if (customProduct.colorPreferences) {
                personalizationDetails.push(`Color: ${customProduct.colorPreferences}`);
            }
            if (customProduct.sizePreferences) {
                personalizationDetails.push(`Tamaño: ${customProduct.sizePreferences}`);
            }
            
            if (personalizationDetails.length > 0) {
                description = `${description}\n• ${personalizationDetails.join('\n• ')}`;
            }

            transformedItem = {
                ...transformedItem,
                name: productName,
                description: description,
                price: totalPrice,
                image: referenceImage || '🎨',
                isCustom: true,
                customizationDetails: {
                    productToPersonalize: customProduct.productToPersonalize,
                    extraComments: customProduct.extraComments,
                    personalizationType: customProduct.personalizationType,
                    designDetails: customProduct.designDetails,
                    materialPreferences: customProduct.materialPreferences,
                    colorPreferences: customProduct.colorPreferences,
                    sizePreferences: customProduct.sizePreferences,
                    referenceImage: customProduct.referenceImage,
                    totalPrice: customProduct.totalPrice
                }
            };
        } else {
            // FALLBACK PARA OTROS TIPOS DE ITEMS
            const itemData = item.itemId || {};
            transformedItem = {
                ...transformedItem,
                name: itemData.name || itemData.productToPersonalize || 'Producto',
                description: itemData.description || itemData.extraComments || '',
                price: itemData.price || itemData.totalPrice || 0,
                image: itemData.images?.[0]?.image || itemData.referenceImage || '📦'
            };
        }

        console.log('Item transformado:', {
            id: transformedItem.id,
            name: transformedItem.name,
            itemType: transformedItem.itemType,
            price: transformedItem.price,
            quantity: transformedItem.quantity,
            isCustom: transformedItem.isCustom
        });

        return transformedItem;
    }, []);

    // ✅ FUNCIÓN PARA MANEJAR ERRORES DE RED - SIN DEPENDENCIAS
    const handleNetworkError = useCallback((error) => {
        console.error('Cart Network Error:', error);
        
        if (error.message === 'TIMEOUT') {
            return 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.message?.includes('network')) {
            return 'Error de red. Verifica tu conexión a internet.';
        }
        
        return 'Error de conexión con el servidor';
    }, []);

    // ✅ FUNCIÓN PARA PARSEAR RESPUESTAS - OPTIMIZADA
    const parseResponse = useCallback(async (response, operationName) => {
        try {
            console.log(`${operationName} - Status:`, response.status);
            console.log(`${operationName} - URL:`, response.url);

            const responseText = await response.text();
            console.log(`${operationName} - Response text (first 200 chars):`, responseText.substring(0, 200));

            if (responseText.trim().startsWith('<')) {
                console.error(`${operationName} - Servidor devolvió HTML en lugar de JSON`);
                throw new Error(`Servidor devolvió página HTML. Verifica que el endpoint ${response.url} sea correcto`);
            }

            const data = JSON.parse(responseText);
            console.log(`${operationName} - JSON parseado exitosamente:`, data);
            
            // Guardar token si viene en la respuesta
            await handleTokenResponse(data);
            
            return data;

        } catch (parseError) {
            console.error(`${operationName} - Error al parsear respuesta:`, parseError);
            throw new Error(`Respuesta inválida del servidor: ${parseError.message}`);
        }
    }, [handleTokenResponse]);

    // ✅ FUNCIÓN PARA PETICIONES CON TIMEOUT - SIN DEPENDENCIAS
    const fetchWithTimeout = useCallback(async (url, options, timeoutMs = 30000) => {
        const operationPromise = fetch(url, options);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
        });

        return Promise.race([operationPromise, timeoutPromise]);
    }, []);

    // ✅ OBTENEMOS CARRITO ACTIVO - DEPENDENCIAS MÍNIMAS Y ESTABLES
    const getActiveCart = useCallback(async (forceReload = false) => {
        try {
            if (!isAuthenticated || !user?.id || !authReady) {
                console.log('Prerrequisitos no cumplidos para cargar carrito:', {
                    isAuthenticated,
                    hasUserId: !!user?.id,
                    authReady
                });
                
                setCart(null);
                setCartItems([]);
                setCartItemsCount(0);
                setCartTotal(0);
                setSubtotal(0);
                return null;
            }

            // Evitar llamadas duplicadas
            if (!forceReload && isInitializing.current) {
                console.log('Carga de carrito ya en progreso, esperando...');
                return cartLoadPromise.current;
            }

            // Verificar si ya se inicializó para este usuario
            const userKey = `${user.id}-${authReady}`;
            if (!forceReload && hasInitializedForUser.current === userKey && cart !== null) {
                console.log('Carrito ya inicializado para este usuario, saltando...');
                return cart;
            }

            isInitializing.current = true;
            setCartLoading(true);
            setCartError(null);

            cartLoadPromise.current = (async () => {
                try {
                    const headers = await getAuthHeaders();
                    console.log('Obteniendo carrito activo para usuario:', user.id);

                    const url = `${API_BASE_URL}/shoppingCart/active/${user.id}`;
                    console.log('URL completa:', url);

                    const response = await fetchWithTimeout(url, {
                        method: 'GET',
                        headers
                    });

                    const data = await parseResponse(response, 'getActiveCart');

                    if (response.ok) {
                        if (data.cart) {
                            const cart = data.cart;
                            setCart(cart);

                            // PROCESAMIENTO DE ITEMS
                            if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
                                console.log(`🛒 Procesando ${cart.items.length} items del carrito...`);
                                
                                const transformedItems = cart.items.map((item, index) => {
                                    console.log(`Procesando item ${index + 1}:`, {
                                        itemType: item.itemType,
                                        hasItemId: !!item.itemId,
                                        itemIdKeys: item.itemId ? Object.keys(item.itemId) : 'N/A'
                                    });
                                    
                                    return transformCartItem(item);
                                }).filter(item => item.id); 

                                console.log(`Items transformados: ${transformedItems.length}`);
                                console.log('Items por tipo:', transformedItems.reduce((acc, item) => {
                                    acc[item.itemType] = (acc[item.itemType] || 0) + 1;
                                    return acc;
                                }, {}));

                                setCartItems(transformedItems);
                                setCartItemsCount(transformedItems.length);
                                setCartTotal(cart.total || 0);
                                
                                // Calculamos subtotal considerando todos los tipos de productos
                                const calculatedSubtotal = transformedItems.reduce((sum, item) => {
                                    const itemPrice = item.price || 0;
                                    const itemQuantity = item.quantity || 1;
                                    return sum + (itemPrice * itemQuantity);
                                }, 0);
                                
                                setSubtotal(calculatedSubtotal);
                                
                                console.log(`Carrito cargado: ${transformedItems.length} items, subtotal: ${calculatedSubtotal}`);
                            } else {
                                setCartItems([]);
                                setCartItemsCount(0);
                                setCartTotal(0);
                                setSubtotal(0);
                                console.log('Carrito vacío cargado');
                            }

                            hasInitializedForUser.current = userKey;
                            return cart;
                        } else {
                            console.log('No hay carrito activo para el usuario');
                            setCart(null);
                            setCartItems([]);
                            setCartItemsCount(0);
                            setCartTotal(0);
                            setSubtotal(0);
                            hasInitializedForUser.current = userKey;
                            return null;
                        }
                    } else if (response.status === 404) {
                        console.log('No hay carrito activo para el usuario');
                        setCart(null);
                        setCartItems([]);
                        setCartItemsCount(0);
                        setCartTotal(0);
                        setSubtotal(0);
                        hasInitializedForUser.current = userKey;
                        return null;
                    } else {
                        throw new Error(`Error del servidor: ${response.status} - ${data.message || 'Sin mensaje'}`);
                    }
                } catch (error) {
                    console.error('Error al obtener carrito activo:', error);
                    const errorMessage = handleNetworkError(error);
                    setCartError(errorMessage);
                    setCart(null);
                    setCartItems([]);
                    setCartItemsCount(0);
                    setCartTotal(0);
                    setSubtotal(0);
                    throw error;
                }
            })();

            return await cartLoadPromise.current;

        } catch (error) {
            return null;
        } finally {
            isInitializing.current = false;
            setCartLoading(false);
            cartLoadPromise.current = null;
        }
    }, [
        // ✅ DEPENDENCIAS MÍNIMAS Y ESTABLES
        isAuthenticated, 
        user?.id, 
        authReady, 
        getAuthHeaders, 
        parseResponse, 
        fetchWithTimeout, 
        transformCartItem, 
        handleNetworkError
    ]);

    // ✅ AGREGAR AL CARRITO - DEPENDENCIAS OPTIMIZADAS
    const addToCart = useCallback(async (productOrId, quantity = 1, itemType = 'product', customData = null) => {
        try {
            if (!isAuthenticated || !user?.id) {
                return { 
                    success: false, 
                    message: 'Debes iniciar sesión para agregar productos al carrito' 
                };
            }

            // Manejar tanto objetos producto como IDs
            let productId;
            if (typeof productOrId === 'string') {
                productId = productOrId;
            } else if (productOrId && (productOrId._id || productOrId.id)) {
                productId = productOrId._id || productOrId.id;
            } else {
                return { 
                    success: false, 
                    message: 'Producto inválido' 
                };
            }

            setUpdating(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            // Cuerpo de request adaptado para productos personalizados
            let requestBody = {
                clientId: user.id,
                itemId: productId,
                quantity: parseInt(quantity),
                itemType
            };

            // Si es producto personalizado, agregar datos adicionales
            if (itemType === 'custom' && customData) {
                requestBody = {
                    ...requestBody,
                    customData: customData
                };
            }

            console.log('Agregando al carrito:', requestBody);

            const url = `${API_BASE_URL}/shoppingCart/addItem`;
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            const data = await parseResponse(response, 'addToCart');

            if (response.ok && data.success) {
                await getActiveCart(true);
                
                const message = itemType === 'custom' 
                    ? 'Producto personalizado agregado al carrito'
                    : data.message || 'Producto agregado al carrito';
                
                console.log('Producto agregado exitosamente al carrito');
                return { 
                    success: true, 
                    message: message
                };
            } else {
                const errorMsg = data.message || 'Error al agregar al carrito';
                console.error('❌ Error en respuesta del servidor:', errorMsg);
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, parseResponse, fetchWithTimeout, handleNetworkError, getActiveCart]);

    // ✅ ACTUALIZAR CANTIDAD - DEPENDENCIAS OPTIMIZADAS
    const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
        try {
            if (!isAuthenticated || !user?.id) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            if (!itemId || !newQuantity || newQuantity < 1 || newQuantity > 99) {
                return { success: false, message: 'La cantidad debe estar entre 1 y 99' };
            }

            setUpdating(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Actualizando cantidad:', { itemId, newQuantity });

            const url = `${API_BASE_URL}/shoppingCart/updateQuantity`;
            const response = await fetchWithTimeout(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    clientId: user.id,
                    itemId,
                    quantity: parseInt(newQuantity)
                })
            });

            const data = await parseResponse(response, 'updateItemQuantity');

            if (response.ok && data.success) {
                // Actualización optimista mejorada
                setCartItems(prevItems =>
                    prevItems.map(item => {
                        if (item.id === itemId || item._originalItem?.itemId === itemId) {
                            const updatedSubtotal = item.price * newQuantity;
                            return {
                                ...item,
                                quantity: newQuantity,
                                subtotal: updatedSubtotal
                            };
                        }
                        return item;
                    })
                );

                // Recalcular subtotal
                setSubtotal(prevSubtotal => {
                    const currentItem = cartItems.find(item => 
                        item.id === itemId || item._originalItem?.itemId === itemId
                    );
                    if (currentItem) {
                        const oldItemTotal = currentItem.price * currentItem.quantity;
                        const newItemTotal = currentItem.price * newQuantity;
                        return prevSubtotal - oldItemTotal + newItemTotal;
                    }
                    return prevSubtotal;
                });

                await getActiveCart(true);
                
                return { 
                    success: true, 
                    message: data.message || 'Cantidad actualizada'
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
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, parseResponse, fetchWithTimeout, handleNetworkError, getActiveCart]);

    // ✅ REMOVER ITEM - DEPENDENCIAS OPTIMIZADAS
    const removeFromCart = useCallback(async (itemId) => {
        try {
            if (!itemId) {
                console.error('No productId provided for removal');
                return { success: false, message: 'ID de producto requerido' };
            }

            if (!isAuthenticated) {
                setCartError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            const token = await getBestAvailableToken();
            if (!token) {
                setCartError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            setUpdating(true);
            setCartError(null);

            const headers = await getAuthHeaders();
            
            console.log('Removiendo del carrito:', itemId);

            // Intentar ruta específica primero
            let response = await fetchWithTimeout(`${API_BASE_URL}/shoppingCart/removeItem`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId
                })
            });

            // Si falla, usar ruta alternativa
            if (!response.ok && response.status === 404) {
                console.log('Ruta principal falló, intentando ruta alternativa...');
                response = await fetchWithTimeout(`${API_BASE_URL}/shoppingCart/client/${user.id}/items`, {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({
                        itemId: itemId
                    })
                });
            }

            const data = await parseResponse(response, 'removeFromCart');

            if (response.ok && data.success) {
                console.log('Producto eliminado exitosamente');

                const removedItem = cartItems.find(item =>
                    item.id === itemId || item._originalItem?.itemId === itemId
                );

                if (removedItem) {
                    console.log(`Eliminando ${removedItem.itemType === 'custom' ? 'producto personalizado' : 'producto'}: ${removedItem.name}`);
                }

                setCartItems(prevItems =>
                    prevItems.filter(item =>
                        item.id !== itemId && item._originalItem?.itemId !== itemId
                    )
                );

                await getActiveCart(true);
                
                return { 
                    success: true, 
                    message: data.message || 'Producto removido del carrito'
                };
            } else {
                const errorMsg = data.message || 'Error al remover del carrito';
                console.error('Error del servidor:', data);
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setUpdating(false);
        }
    }, [
        isAuthenticated, 
        user?.id, 
        getBestAvailableToken, 
        getAuthHeaders, 
        parseResponse, 
        fetchWithTimeout, 
        handleNetworkError, 
        getActiveCart
    ]);

    // ✅ FUNCIONES UTILITARIAS SIN DEPENDENCIAS PROBLEMÁTICAS
    const clearCartError = useCallback(() => {
        setCartError(null);
    }, []);

    const isCustomProduct = useCallback((item) => {
        return item.itemType === 'custom' || item.isCustom === true;
    }, []);

    const getCustomizationDetails = useCallback((item) => {
        if (!isCustomProduct(item)) return null;
        
        return item.customizationDetails || {
            productToPersonalize: item._originalItem?.itemId?.productToPersonalize,
            extraComments: item._originalItem?.itemId?.extraComments,
            personalizationType: item._originalItem?.itemId?.personalizationType,
            designDetails: item._originalItem?.itemId?.designDetails,
            materialPreferences: item._originalItem?.itemId?.materialPreferences,
            colorPreferences: item._originalItem?.itemId?.colorPreferences,
            sizePreferences: item._originalItem?.itemId?.sizePreferences,
            referenceImage: item._originalItem?.itemId?.referenceImage,
            totalPrice: item._originalItem?.itemId?.totalPrice
        };
    }, [isCustomProduct]);

    const getCartStats = useCallback(() => {
        const stats = cartItems.reduce((acc, item) => {
            const type = item.itemType || 'product';
            acc[type] = (acc[type] || 0) + 1;
            acc.total += 1;
            return acc;
        }, { total: 0, product: 0, custom: 0 });

        return stats;
    }, [cartItems]);

    const getProductImage = useCallback((item) => {
        if (!item) return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Sin+Imagen';

        // Si ya tiene imagen procesada
        if (item.image && item.image !== '🎨' && item.image !== '📦') {
            return item.image;
        }

        // Para productos personalizados
        if (item.itemType === 'custom') {
            const customData = item._originalItem?.itemId || item.customizationDetails || {};
            if (customData.referenceImage) {
                return customData.referenceImage;
            }
            return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Personalizado';
        }

        // Para productos normales
        const product = item._originalItem?.itemId || item;
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'object' && firstImage.image) {
                return firstImage.image;
            }
            if (typeof firstImage === 'string') {
                return firstImage;
            }
        }

        if (product.image) {
            return product.image;
        }

        return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Producto';
    }, []);

    // ✅ EFECTO PRINCIPAL OPTIMIZADO - DEPENDENCIAS MÍNIMAS
    useEffect(() => {
        const handleAuthChange = async () => {
            console.log('AuthContext cambió:', {
                isAuthenticated,
                userId: user?.id,
                hasUserInfo: !!userInfo,
                authReady,
                hasInitializedForUser: hasInitializedForUser.current,
                isInitializing: isInitializing.current
            });

            if (isAuthenticated && user?.id && userInfo && authReady) {
                const userKey = `${user.id}-${authReady}`;
                
                if (hasInitializedForUser.current !== userKey) {
                    console.log('Usuario completamente autenticado, cargando carrito...');
                    
                    try {
                        await getActiveCart(true);
                        console.log('Carrito cargado exitosamente después del login');
                    } catch (error) {
                        console.error('Error al cargar carrito después del login:', error);
                        setCartError('Error al cargar el carrito');
                    }
                } else {
                    console.log('Carrito ya inicializado para este usuario');
                }
            } else if (!isAuthenticated) {
                console.log('Usuario no autenticado, limpiando carrito');
                setCart(null);
                setCartItems([]);
                setCartItemsCount(0);
                setCartTotal(0);
                setSubtotal(0);
                setCartError(null);
                hasInitializedForUser.current = false;
            } else {
                console.log('Esperando que la autenticación esté completamente lista...');
            }
        };

        handleAuthChange();
    }, [isAuthenticated, user?.id, userInfo, authReady]); // ✅ Solo las dependencias esenciales

    // ✅ CONTEXT VALUE CON TODAS LAS FUNCIONES NECESARIAS
    const contextValue = {
        // Estado del carrito
        cart,
        cartItems,
        cartLoading,
        cartError,
        cartItemsCount,
        cartTotal,
        subtotal,
        updating,
        
        // Estados de descuentos
        appliedDiscount,
        discountAmount,

        // Funciones principales del carrito
        getActiveCart,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        clearCartError,

        // ✅ FUNCIONES HELPER PARA PRODUCTCARD
        isInCart,
        getItemQuantity,

        // Funciones para productos personalizados
        isCustomProduct,
        getCustomizationDetails,
        getCartStats,
        getProductImage,

        // Propiedades calculadas
        isEmpty: cartItems.length === 0,
        itemCount: cartItems.length,
        hasDiscount: appliedDiscount !== null,

        // Info de usuario
        isAuthenticated,
        user,
        userInfo
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
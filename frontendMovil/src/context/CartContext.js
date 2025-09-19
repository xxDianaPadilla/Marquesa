// Importación de React y hooks necesarios para el contexto del carrito
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
// Importación del hook de autenticación personalizado
import { useAuth } from './AuthContext';

// Creación del contexto del carrito
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
    // Obtener el contexto actual
    const context = useContext(CartContext);
    // Validar que el hook se use dentro de un CartProvider
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    // Retornar el contexto si es válido
    return context;
};

// Componente proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
    // Desestructurar datos necesarios del contexto de autenticación
    const { user, isAuthenticated, userInfo, getBestAvailableToken, authReady } = useAuth();

    // Estados principales del carrito
    const [cart, setCart] = useState(null);
    // Lista de items del carrito
    const [cartItems, setCartItems] = useState([]);
    // Estado de carga del carrito
    const [cartLoading, setCartLoading] = useState(false);
    // Estado de error del carrito
    const [cartError, setCartError] = useState(null);
    // Contador de items en el carrito
    const [cartItemsCount, setCartItemsCount] = useState(0);
    // Total del carrito
    const [cartTotal, setCartTotal] = useState(0);
    // Subtotal del carrito
    const [subtotal, setSubtotal] = useState(0);
    // Estado para indicar si se está actualizando el carrito
    const [updating, setUpdating] = useState(false);

    // Estados para manejo de descuentos
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    // Cantidad de descuento aplicado
    const [discountAmount, setDiscountAmount] = useState(0);

    // Referencias para evitar dependencias circulares
    const lastUserId = useRef(null);
    // Referencia para controlar inicialización
    const isInitializing = useRef(false);
    // Referencia para promesa de carga del carrito
    const cartLoadPromise = useRef(null);
    // Referencia para controlar si ya se inicializó para el usuario
    const hasInitializedForUser = useRef(false);

    // URL base del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // Función para verificar si un producto está en el carrito
    const isInCart = useCallback((productId) => {
        // Verificar si algún item del carrito coincide con el productId
        return cartItems.some(item => item.id === productId);
    }, [cartItems]);

    // Función para obtener la cantidad de un item específico en el carrito
    const getItemQuantity = useCallback((productId) => {
        // Buscar el item en el carrito
        const item = cartItems.find(item => item.id === productId);
        // Retornar la cantidad si existe, 0 si no existe
        return item ? item.quantity : 0;
    }, [cartItems]);

    // Función helper para obtener headers de autenticación sin dependencias dinámicas
    const getAuthHeaders = useCallback(async () => {
        try {
            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            // Crear headers base
            const headers = {
                'Content-Type': 'application/json',
            };
            // Agregar header de autorización si existe token
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            return headers;
        } catch (error) {
            // Log de error al obtener headers
            console.error('Error obteniendo headers:', error);
            // Retornar headers básicos en caso de error
            return { 'Content-Type': 'application/json' };
        }
    }, [getBestAvailableToken]);

    // Función para guardar token sin dependencias dinámicas
    const handleTokenResponse = useCallback(async (data) => {
        // Verificar si la respuesta contiene un token
        if (data.token) {
            try {
                // Importar AsyncStorage dinámicamente
                const AsyncStorage = await import('@react-native-async-storage/async-storage').then(module => module.default);
                // Guardar token en el almacenamiento
                await AsyncStorage.setItem('authToken', data.token);
                // Log de confirmación
                console.log('Token guardado automáticamente');
            } catch (error) {
                // Log de advertencia si no se puede guardar
                console.warn('No se pudo guardar token automáticamente:', error);
            }
        }
    }, []);

    // Función para transformar items del carrito sin dependencias
    const transformCartItem = useCallback((item) => {
        // Log del item que se está transformando
        console.log('Transformando item:', {
            itemType: item.itemType,
            itemId: item.itemId,
            hasItemId: !!item.itemId,
            itemIdType: typeof item.itemId
        });

        // Crear base del item transformado
        let transformedItem = {
            id: item.itemId?._id || item.itemId || item._id,
            quantity: item.quantity || 1,
            itemType: item.itemType || 'product',
            subtotal: item.subtotal || 0,
            _originalItem: item
        };

        // Verificar si es un producto normal
        if (item.itemType === 'product') {
            // Productos normales
            const product = item.itemId || {};
            // Completar información del producto normal
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

            // Construir descripción más detallada para productos personalizados
            let description = 'Producto personalizado';
            // Usar comentarios extra como descripción si están disponibles
            if (extraComments) {
                description = extraComments;
            }

            // Crear array para detalles de personalización
            const personalizationDetails = [];
            // Agregar tipo de personalización si existe
            if (customProduct.personalizationType) {
                personalizationDetails.push(`Tipo: ${customProduct.personalizationType}`);
            }
            // Agregar detalles de diseño si existen
            if (customProduct.designDetails) {
                personalizationDetails.push(`Diseño: ${customProduct.designDetails}`);
            }
            // Agregar preferencias de material si existen
            if (customProduct.materialPreferences) {
                personalizationDetails.push(`Material: ${customProduct.materialPreferences}`);
            }
            // Agregar preferencias de color si existen
            if (customProduct.colorPreferences) {
                personalizationDetails.push(`Color: ${customProduct.colorPreferences}`);
            }
            // Agregar preferencias de tamaño si existen
            if (customProduct.sizePreferences) {
                personalizationDetails.push(`Tamaño: ${customProduct.sizePreferences}`);
            }

            // Agregar detalles de personalización a la descripción si existen
            if (personalizationDetails.length > 0) {
                description = `${description}\n• ${personalizationDetails.join('\n• ')}`;
            }

            // Completar información del producto personalizado
            transformedItem = {
                ...transformedItem,
                name: productName,
                description: description,
                price: totalPrice,
                image: referenceImage || 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Personalizado',
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
            // Completar información para tipos de items no específicos
            transformedItem = {
                ...transformedItem,
                name: itemData.name || itemData.productToPersonalize || 'Producto',
                description: itemData.description || itemData.extraComments || '',
                price: itemData.price || itemData.totalPrice || 0,
                image: itemData.images?.[0]?.image || itemData.referenceImage || 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Producto'
            };
        }

        // Log del item transformado para debugging
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

    // Función para manejar errores de red sin dependencias
    const handleNetworkError = useCallback((error) => {
        // Log del error de red
        console.error('Cart Network Error:', error);

        // Determinar mensaje de error específico según el tipo
        if (error.message === 'TIMEOUT') {
            return 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.message?.includes('network')) {
            return 'Error de red. Verifica tu conexión a internet.';
        }

        // Mensaje de error genérico
        return 'Error de conexión con el servidor';
    }, []);

    // Función para parsear respuestas del servidor optimizada
    const parseResponse = useCallback(async (response, operationName) => {
        try {
            // Log del status y URL de la respuesta
            console.log(`${operationName} - Status:`, response.status);
            console.log(`${operationName} - URL:`, response.url);

            // Obtener texto de la respuesta
            const responseText = await response.text();
            // Log de los primeros caracteres de la respuesta
            console.log(`${operationName} - Response text (first 200 chars):`, responseText.substring(0, 200));

            // Verificar si la respuesta es HTML en lugar de JSON
            if (responseText.trim().startsWith('<')) {
                console.error(`${operationName} - Servidor devolvió HTML en lugar de JSON`);
                throw new Error(`Servidor devolvió página HTML. Verifica que el endpoint ${response.url} sea correcto`);
            }

            // Parsear JSON de la respuesta
            const data = JSON.parse(responseText);
            // Log de confirmación de parseo exitoso
            console.log(`${operationName} - JSON parseado exitosamente:`, data);

            // Guardar token si viene en la respuesta
            await handleTokenResponse(data);

            return data;

        } catch (parseError) {
            // Log de error al parsear respuesta
            console.error(`${operationName} - Error al parsear respuesta:`, parseError);
            throw new Error(`Respuesta inválida del servidor: ${parseError.message}`);
        }
    }, [handleTokenResponse]);

    // Función para peticiones con timeout sin dependencias
    const fetchWithTimeout = useCallback(async (url, options, timeoutMs = 30000) => {
        // Crear promesa para la operación fetch
        const operationPromise = fetch(url, options);
        // Crear promesa de timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
        });

        // Retornar la primera promesa que se resuelva (fetch o timeout)
        return Promise.race([operationPromise, timeoutPromise]);
    }, []);

    // Función para obtener carrito activo con dependencias mínimas y estables
    const getActiveCart = useCallback(async (forceReload = false) => {
        try {
            // Verificar prerrequisitos para cargar carrito
            if (!isAuthenticated || !user?.id || !authReady) {
                // Log de prerrequisitos no cumplidos
                console.log('Prerrequisitos no cumplidos para cargar carrito:', {
                    isAuthenticated,
                    hasUserId: !!user?.id,
                    authReady
                });

                // Limpiar estados del carrito
                setCart(null);
                setCartItems([]);
                setCartItemsCount(0);
                setCartTotal(0);
                setSubtotal(0);
                return null;
            }

            // Evitar llamadas duplicadas si no se fuerza reload
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

            // Marcar como inicializando
            isInitializing.current = true;
            setCartLoading(true);
            setCartError(null);

            // Crear promesa de carga del carrito
            cartLoadPromise.current = (async () => {
                try {
                    // Obtener headers de autenticación
                    const headers = await getAuthHeaders();
                    // Log del usuario para el cual se carga el carrito
                    console.log('Obteniendo carrito activo para usuario:', user.id);

                    // Construir URL del endpoint
                    const url = `${API_BASE_URL}/shoppingCart/active/${user.id}`;
                    // Log de la URL completa
                    console.log('URL completa:', url);

                    // Realizar petición con timeout
                    const response = await fetchWithTimeout(url, {
                        method: 'GET',
                        headers
                    });

                    // Parsear respuesta del servidor
                    const data = await parseResponse(response, 'getActiveCart');

                    // Verificar si la respuesta es exitosa
                    if (response.ok) {
                        // Verificar si existe un carrito en la respuesta
                        if (data.cart) {
                            // Obtener objeto carrito de la respuesta
                            const cart = data.cart;
                            // Establecer carrito en el estado
                            setCart(cart);

                            // PROCESAMIENTO DE ITEMS
                            // Verificar si el carrito tiene items
                            if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
                                // Log del procesamiento de items
                                console.log(`Procesando ${cart.items.length} items del carrito...`);

                                // Transformar cada item del carrito
                                const transformedItems = cart.items.map((item, index) => {
                                    // Log del item que se está procesando
                                    console.log(`Procesando item ${index + 1}:`, {
                                        itemType: item.itemType,
                                        hasItemId: !!item.itemId,
                                        itemIdKeys: item.itemId ? Object.keys(item.itemId) : 'N/A'
                                    });

                                    // Transformar item y retornarlo
                                    return transformCartItem(item);
                                }).filter(item => item.id); // Filtrar items sin ID válido

                                // Log de items transformados
                                console.log(`Items transformados: ${transformedItems.length}`);
                                // Log de items por tipo
                                console.log('Items por tipo:', transformedItems.reduce((acc, item) => {
                                    acc[item.itemType] = (acc[item.itemType] || 0) + 1;
                                    return acc;
                                }, {}));

                                // Establecer items transformados en el estado
                                setCartItems(transformedItems);
                                setCartItemsCount(transformedItems.length);
                                setCartTotal(cart.total || 0);

                                // Calcular subtotal considerando todos los tipos de productos
                                const calculatedSubtotal = transformedItems.reduce((sum, item) => {
                                    const itemPrice = item.price || 0;
                                    const itemQuantity = item.quantity || 1;
                                    return sum + (itemPrice * itemQuantity);
                                }, 0);

                                // Establecer subtotal calculado
                                setSubtotal(calculatedSubtotal);

                                // Log de carrito cargado exitosamente
                                console.log(`Carrito cargado: ${transformedItems.length} items, subtotal: ${calculatedSubtotal}`);
                            } else {
                                // Establecer carrito vacío
                                setCartItems([]);
                                setCartItemsCount(0);
                                setCartTotal(0);
                                setSubtotal(0);
                                console.log('Carrito vacío cargado');
                            }

                            // Marcar como inicializado para este usuario
                            hasInitializedForUser.current = userKey;
                            return cart;
                        } else {
                            // No hay carrito activo para el usuario
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
                        // Carrito no encontrado (404)
                        console.log('No hay carrito activo para el usuario');
                        setCart(null);
                        setCartItems([]);
                        setCartItemsCount(0);
                        setCartTotal(0);
                        setSubtotal(0);
                        hasInitializedForUser.current = userKey;
                        return null;
                    } else {
                        // Error del servidor
                        throw new Error(`Error del servidor: ${response.status} - ${data.message || 'Sin mensaje'}`);
                    }
                } catch (error) {
                    // Log de error al obtener carrito
                    console.error('Error al obtener carrito activo:', error);
                    // Obtener mensaje de error de red
                    const errorMessage = handleNetworkError(error);
                    // Establecer error en el estado
                    setCartError(errorMessage);
                    // Limpiar estados del carrito
                    setCart(null);
                    setCartItems([]);
                    setCartItemsCount(0);
                    setCartTotal(0);
                    setSubtotal(0);
                    throw error;
                }
            })();

            // Esperar a que termine la promesa de carga
            return await cartLoadPromise.current;

        } catch (error) {
            return null;
        } finally {
            // Limpiar flags de inicialización
            isInitializing.current = false;
            setCartLoading(false);
            cartLoadPromise.current = null;
        }
    }, [
        // Dependencias mínimas y estables
        isAuthenticated,
        user?.id,
        authReady,
        getAuthHeaders,
        parseResponse,
        fetchWithTimeout,
        transformCartItem,
        handleNetworkError
    ]);

    // Función para agregar al carrito con dependencias optimizadas
    const addToCart = useCallback(async (productOrId, quantity = 1, itemType = 'product', customData = null) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!isAuthenticated || !user?.id) {
                return {
                    success: false,
                    message: 'Debes iniciar sesión para agregar productos al carrito'
                };
            }

            // Manejar tanto objetos producto como IDs
            let productId;
            // Verificar si es un string (ID directo)
            if (typeof productOrId === 'string') {
                productId = productOrId;
            } else if (productOrId && (productOrId._id || productOrId.id)) {
                // Extraer ID del objeto producto
                productId = productOrId._id || productOrId.id;
            } else {
                // Producto inválido
                return {
                    success: false,
                    message: 'Producto inválido'
                };
            }

            // Activar estado de actualización
            setUpdating(true);
            setCartError(null);

            // Obtener headers de autenticación
            const headers = await getAuthHeaders();

            // Crear cuerpo de request adaptado para productos personalizados
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

            // Log del cuerpo de la petición
            console.log('Agregando al carrito:', requestBody);

            // Construir URL del endpoint
            const url = `${API_BASE_URL}/shoppingCart/addItem`;
            // Realizar petición con timeout
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            // Parsear respuesta del servidor
            const data = await parseResponse(response, 'addToCart');

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                // Recargar carrito después de agregar item
                await getActiveCart(true);

                // Determinar mensaje según tipo de producto
                const message = itemType === 'custom'
                    ? 'Producto personalizado agregado al carrito'
                    : data.message || 'Producto agregado al carrito';

                // Log de éxito
                console.log('Producto agregado exitosamente al carrito');
                return {
                    success: true,
                    message: message
                };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al agregar al carrito';
                // Log de error del servidor
                console.error('Error en respuesta del servidor:', errorMsg);
                // Establecer error en el estado
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al agregar al carrito
            console.error('Error al agregar al carrito:', error);
            // Obtener mensaje de error de red
            const errorMessage = handleNetworkError(error);
            // Establecer error en el estado
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            // Desactivar estado de actualización
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, parseResponse, fetchWithTimeout, handleNetworkError, getActiveCart]);

    // Función para actualizar cantidad con dependencias optimizadas
    const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!isAuthenticated || !user?.id) {
                return { success: false, message: 'Usuario no autenticado' };
            }

            // Validar parámetros de entrada
            if (!itemId || !newQuantity || newQuantity < 1 || newQuantity > 99) {
                return { success: false, message: 'La cantidad debe estar entre 1 y 99' };
            }

            // Activar estado de actualización
            setUpdating(true);
            setCartError(null);

            // Obtener headers de autenticación
            const headers = await getAuthHeaders();

            // Log de actualización de cantidad
            console.log('Actualizando cantidad:', { itemId, newQuantity });

            // Construir URL del endpoint
            const url = `${API_BASE_URL}/shoppingCart/updateQuantity`;
            // Realizar petición con timeout
            const response = await fetchWithTimeout(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    clientId: user.id,
                    itemId,
                    quantity: parseInt(newQuantity)
                })
            });

            // Parsear respuesta del servidor
            const data = await parseResponse(response, 'updateItemQuantity');

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                // Actualización optimista mejorada
                setCartItems(prevItems =>
                    prevItems.map(item => {
                        // Verificar si es el item que se está actualizando
                        if (item.id === itemId || item._originalItem?.itemId === itemId) {
                            // Calcular nuevo subtotal
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

                // Recalcular subtotal total
                setSubtotal(prevSubtotal => {
                    // Encontrar el item actual
                    const currentItem = cartItems.find(item =>
                        item.id === itemId || item._originalItem?.itemId === itemId
                    );
                    // Recalcular subtotal si se encuentra el item
                    if (currentItem) {
                        const oldItemTotal = currentItem.price * currentItem.quantity;
                        const newItemTotal = currentItem.price * newQuantity;
                        return prevSubtotal - oldItemTotal + newItemTotal;
                    }
                    return prevSubtotal;
                });

                // Recargar carrito para sincronización
                await getActiveCart(true);

                return {
                    success: true,
                    message: data.message || 'Cantidad actualizada'
                };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al actualizar cantidad';
                // Establecer error en el estado
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al actualizar cantidad
            console.error('Error al actualizar cantidad:', error);
            // Obtener mensaje de error de red
            const errorMessage = handleNetworkError(error);
            // Establecer error en el estado
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            // Desactivar estado de actualización
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, getAuthHeaders, parseResponse, fetchWithTimeout, handleNetworkError, getActiveCart]);

    // Función para remover item con dependencias optimizadas
    const removeFromCart = useCallback(async (itemId) => {
        try {
            // Verificar que se proporcione un ID de item
            if (!itemId) {
                console.error('No productId provided for removal');
                return { success: false, message: 'ID de producto requerido' };
            }

            // Verificar que el usuario esté autenticado
            if (!isAuthenticated) {
                setCartError('Debes iniciar sesión');
                return { success: false, message: 'Debes iniciar sesión' };
            }

            // Obtener token de autenticación
            const token = await getBestAvailableToken();
            if (!token) {
                setCartError('No hay sesión activa');
                return { success: false, message: 'No hay sesión activa' };
            }

            // Activar estado de actualización
            setUpdating(true);
            setCartError(null);

            // Obtener headers de autenticación
            const headers = await getAuthHeaders();

            // Log del item que se va a remover
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

            // Parsear respuesta del servidor
            const data = await parseResponse(response, 'removeFromCart');

            // Verificar si la respuesta es exitosa
            if (response.ok && data.success) {
                console.log('Producto eliminado exitosamente');

                // Encontrar el item removido para logging
                const removedItem = cartItems.find(item =>
                    item.id === itemId || item._originalItem?.itemId === itemId
                );

                // Log del tipo de producto eliminado
                if (removedItem) {
                    console.log(`Eliminando ${removedItem.itemType === 'custom' ? 'producto personalizado' : 'producto'}: ${removedItem.name}`);
                }

                // Actualización optimista: remover item de la lista
                setCartItems(prevItems =>
                    prevItems.filter(item =>
                        item.id !== itemId && item._originalItem?.itemId !== itemId
                    )
                );

                // Recargar carrito para sincronización
                await getActiveCart(true);

                return {
                    success: true,
                    message: data.message || 'Producto removido del carrito'
                };
            } else {
                // Obtener mensaje de error del servidor
                const errorMsg = data.message || 'Error al remover del carrito';
                // Log del error del servidor
                console.error('Error del servidor:', data);
                // Establecer error en el estado
                setCartError(errorMsg);
                return { success: false, message: errorMsg };
            }
        } catch (error) {
            // Log de error al remover del carrito
            console.error('Error removing from cart:', error);
            // Obtener mensaje de error de red
            const errorMessage = handleNetworkError(error);
            // Establecer error en el estado
            setCartError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            // Desactivar estado de actualización
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

    // Función para limpiar errores del carrito sin dependencias problemáticas
    const clearCartError = useCallback(() => {
        setCartError(null);
    }, []);

    // Función para verificar si un item es producto personalizado
    const isCustomProduct = useCallback((item) => {
        return item.itemType === 'custom' || item.isCustom === true;
    }, []);

    // Función para obtener detalles de personalización
    const getCustomizationDetails = useCallback((item) => {
        // Verificar si es producto personalizado
        if (!isCustomProduct(item)) return null;

        // Retornar detalles de personalización del item o del item original
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

    // Función para obtener estadísticas del carrito
    const getCartStats = useCallback(() => {
        // Reducir items para contar por tipo
        const stats = cartItems.reduce((acc, item) => {
            const type = item.itemType || 'product';
            acc[type] = (acc[type] || 0) + 1;
            acc.total += 1;
            return acc;
        }, { total: 0, product: 0, custom: 0 });

        return stats;
    }, [cartItems]);

    // Función para obtener imagen del producto
    const getProductImage = useCallback((item) => {
        // Verificar que el item exista
        if (!item) return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Sin+Imagen';

        // Si ya tiene imagen procesada
        if (item.image && item.image !== '🎨' && item.image !== '📦') {
            return item.image;
        }

        // Para productos personalizados
        if (item.itemType === 'custom') {
            // Obtener datos de personalización
            const customData = item._originalItem?.itemId || item.customizationDetails || {};
            // Verificar si tiene imagen de referencia
            if (customData.referenceImage) {
                return customData.referenceImage;
            }
            return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Personalizado';
        }

        // Para productos normales
        const product = item._originalItem?.itemId || item;
        // Verificar si tiene array de imágenes
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Obtener primera imagen del array
            const firstImage = product.images[0];
            // Verificar si es objeto con propiedad image
            if (typeof firstImage === 'object' && firstImage.image) {
                return firstImage.image;
            }
            // Verificar si es string directo
            if (typeof firstImage === 'string') {
                return firstImage;
            }
        }

        // Verificar si tiene imagen directa
        if (product.image) {
            return product.image;
        }

        // Imagen por defecto
        return 'https://via.placeholder.com/80x80/f0f0f0/666666?text=Producto';
    }, []);

    // Effect principal optimizado con dependencias mínimas
    useEffect(() => {
        // Función para manejar cambios en autenticación
        const handleAuthChange = async () => {
            // Log del cambio en AuthContext
            console.log('AuthContext cambió:', {
                isAuthenticated,
                userId: user?.id,
                hasUserInfo: !!userInfo,
                authReady,
                hasInitializedForUser: hasInitializedForUser.current,
                isInitializing: isInitializing.current
            });

            // Verificar si el usuario está completamente autenticado
            if (isAuthenticated && user?.id && userInfo && authReady) {
                // Crear clave única para el usuario
                const userKey = `${user.id}-${authReady}`;

                // Verificar si ya se inicializó para este usuario
                if (hasInitializedForUser.current !== userKey) {
                    console.log('Usuario completamente autenticado, cargando carrito...');

                    try {
                        // Cargar carrito forzando reload
                        await getActiveCart(true);
                        console.log('Carrito cargado exitosamente después del login');
                    } catch (error) {
                        // Log de error al cargar carrito
                        console.error('Error al cargar carrito después del login:', error);
                        setCartError('Error al cargar el carrito');
                    }
                } else {
                    console.log('Carrito ya inicializado para este usuario');
                }
            } else if (!isAuthenticated) {
                // Log de usuario no autenticado
                console.log('Usuario no autenticado, limpiando carrito');
                // Limpiar todos los estados del carrito
                setCart(null);
                setCartItems([]);
                setCartItemsCount(0);
                setCartTotal(0);
                setSubtotal(0);
                setCartError(null);
                // Resetear flag de inicialización
                hasInitializedForUser.current = false;
            } else {
                // Log de espera por autenticación completa
                console.log('Esperando que la autenticación esté completamente lista...');
            }
        };

        // Ejecutar función de manejo de cambios de autenticación
        handleAuthChange();
    }, [isAuthenticated, user?.id, userInfo, authReady]); // Solo las dependencias esenciales

    const clearCartAfterPurchase = useCallback(async (shoppingCartId) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!isAuthenticated || !user?.id) {
                console.error('Usuario no autenticado para limpiar carrito');
                setCartError('Usuario no autenticado');
                return {
                    success: false,
                    message: 'Usuario no autenticado para limpiar carrito'
                };
            }

            // Verificar que se proporcione el ID del carrito
            if (!shoppingCartId) {
                console.error('ID del carrito es requerido para limpiar');
                setCartError('ID del carrito no válido');
                return {
                    success: false,
                    message: 'ID del carrito es requerido'
                };
            }

            // Limpiar errores previos
            setCartError(null);
            setUpdating(true);

            console.log('Limpiando carrito después de compra:', {
                cartId: shoppingCartId,
                userId: user.id
            });

            // Obtener headers de autenticación usando la función existente
            const headers = await getAuthHeaders();

            // Construir URL del endpoint
            const url = `${API_BASE_URL}/shoppingCart/${shoppingCartId}/clearAfterPurchase`;

            // Realizar petición con timeout usando la función existente
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({
                    userId: user.id
                })
            });

            // Parsear respuesta usando la función existente
            const data = await parseResponse(response, 'clearCartAfterPurchase');

            // Verificar si la respuesta es exitosa
            if (response.ok && data) {
                console.log('Respuesta del servidor al limpiar carrito:', data);

                // Manejar token si viene en la respuesta
                await handleTokenResponse(data);

                // Limpiar el estado local del carrito inmediatamente
                setCart(null);
                setCartItems([]);
                setCartItemsCount(0);
                setCartTotal(0);
                setSubtotal(0);

                // Limpiar descuentos aplicados
                setAppliedDiscount(null);
                setDiscountAmount(0);

                // Resetear flag de inicialización para forzar recarga
                hasInitializedForUser.current = false;

                console.log('Carrito limpiado exitosamente después de la compra:', {
                    completedCart: data.completedCartId,
                    newCart: data.activeCart,
                    cleared: data.cleared
                });

                // Recargar carrito usando la función existente
                try {
                    await getActiveCart(true);
                } catch (reloadError) {
                    console.warn('Error al recargar carrito después de limpiar:', reloadError);
                    // No fallar la operación completa si solo falla la recarga
                }

                return {
                    success: true,
                    message: data.message || 'Carrito limpiado exitosamente',
                    completedCartId: data.completedCartId,
                    activeCart: data.activeCart,
                    cleared: data.cleared
                };
            } else {
                // Error del servidor
                throw new Error(data.message || 'Error al limpiar carrito');
            }
        } catch (error) {
            console.error('Error al limpiar carrito después de compra:', error);

            // Usar la función existente para manejar errores de red
            const errorMessage = handleNetworkError(error);
            setCartError(errorMessage);

            return {
                success: false,
                message: errorMessage
            };
        } finally {
            // Desactivar estado de actualización
            setUpdating(false);
        }
    }, [
        isAuthenticated,
        user?.id,
        getAuthHeaders,
        fetchWithTimeout,
        parseResponse,
        handleTokenResponse,
        handleNetworkError,
        getActiveCart
    ]);

    // Objeto de contexto con todas las funciones necesarias
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
        clearCartAfterPurchase,

        // Funciones helper para ProductCard
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

    // Retornar el proveedor del contexto con el valor
    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
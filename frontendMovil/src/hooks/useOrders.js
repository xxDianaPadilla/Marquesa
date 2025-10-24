import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

const useOrders = () => {
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Función para obtener pedidos del usuario - Memoizada con manejo robusto de errores
    const getUserOrders = useCallback(async (userId) => {
        try {
            console.log('Obteniendo pedidos para usuario: ', userId);
            setLoadingOrders(true);

            if (!userId) {
                console.warn('No se proporcionó userId para obtener pedidos');
                setUserOrders([]);
                return;
            }

            // Crear timeout para la petición
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

            const response = await fetch(`https://marquesa.onrender.com/api/sales/user/${userId}/orders`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Status de respuesta getUserOrders: ', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta completa getUserOrders: ', data);

                if (data && data.success && Array.isArray(data.data)) {
                    console.log('Pedidos obtenidos exitosamente: ', data.data.length);
                    setUserOrders(data.data);
                } else {
                    console.warn('Respuesta sin estructura esperada: ', data);
                    setUserOrders([]);
                }
            } else {
                const errorText = await response.text().catch(() => 'Error desconocido');
                console.error('Error en respuesta del servidor: ', response.status, errorText);
                setUserOrders([]);
                
                if (response.status === 404) {
                    // No mostrar alerta para 404, es normal no tener pedidos
                    console.log('Usuario sin pedidos (404)');
                } else {
                    Alert.alert('Error', 'No se pudieron cargar los pedidos');
                }
            }
        } catch (error) {
            console.error('Error al obtener pedidos del usuario: ', error);
            setUserOrders([]);
            
            if (error.name === 'AbortError') {
                Alert.alert('Error', 'La conexión tardó demasiado tiempo');
            } else {
                Alert.alert('Error', 'Error de conexión al obtener pedidos');
            }
        } finally {
            setLoadingOrders(false);
        }
    }, []); 

    // Función para obtener datos del cliente - MEJORADA con manejo robusto de errores
    const getCustomerData = async (clientId) => {
        try {
            console.log('Obteniendo datos del cliente:', clientId);
            
            if (!clientId) {
                console.warn('ClientId no proporcionado');
                return null;
            }

            // Crear timeout más estricto para datos del cliente
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const customerResponse = await fetch(`https://marquesa.onrender.com/api/users/${clientId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (customerResponse.ok) {
                const customerResult = await customerResponse.json();
                console.log('Datos del cliente obtenidos exitosamente');
                return customerResult.data || null;
            } else {
                console.warn('Error al obtener datos del cliente, status:', customerResponse.status);
                return null;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('Timeout obteniendo datos del cliente:', clientId);
            } else {
                console.error('Error al obtener datos del cliente: ', error.message);
            }
            return null; // NO lanzar error, devolver null
        }
    };

    // Función para obtener datos de un producto - MEJORADA con manejo más robusto
    const getProductData = async (item) => {
        try {
            console.log('Obteniendo datos del producto:', item?.itemId, 'tipo:', item?.itemType);
            
            if (!item || !item.itemId || !item.itemType) {
                console.warn('Item inválido para obtener producto:', item);
                return {
                    ...item,
                    name: 'Producto sin información',
                    description: 'Información no disponible',
                    image: null,
                    price: item?.price || 0
                };
            }

            let apiUrl = '';

            if (item.itemType === 'product') {
                apiUrl = `https://marquesa.onrender.com/api/products/${item.itemId}`;
            } else if (item.itemType === 'custom') {
                apiUrl = `https://marquesa.onrender.com/api/customproducts/${item.itemId}`;
            } else {
                console.warn('Tipo de item no reconocido:', item.itemType);
                return {
                    ...item,
                    name: 'Producto no reconocido',
                    description: 'Tipo de producto no válido',
                    image: null,
                    price: item?.price || 0
                };
            }

            // Timeout más corto para productos individuales
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const productResponse = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (productResponse && productResponse.ok) {
                const productResult = await productResponse.json();
                const productData = productResult.data;

                if (productData) {
                    console.log('Producto obtenido exitosamente:', productData?.name);

                    return {
                        ...item,
                        name: productData.name || productData.productToPersonalize || 'Producto sin nombre',
                        description: productData.description || productData.extraComments || 'Sin descripción',
                        image: productData.images?.[0] || productData.referenceImage || null,
                        price: productData.price || item?.price || 0,
                        // Mantener datos originales del carrito
                        quantity: item.quantity,
                        subtotal: item.subtotal
                    };
                }
            }

            console.warn('Error al obtener producto o respuesta vacía, status:', productResponse?.status);
            return {
                ...item,
                name: 'Producto no disponible',
                description: 'Información no disponible',
                image: null,
                price: item?.price || 0
            };

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('Timeout obteniendo producto:', item?.itemId);
            } else {
                console.error('Error al obtener producto: ', item?.itemId, error.message);
            }
            
            return {
                ...item,
                name: 'Error al cargar producto',
                description: 'No se pudo cargar la información',
                image: null,
                price: item?.price || 0
            };
        }
    };

    // Función para obtener todos los datos de productos de un pedido - MEJORADA con control de concurrencia
    const getOrderProductsData = async (pedido) => {
        try {
            console.log('Obteniendo datos de productos del pedido...');
            
            if (!pedido?.shoppingCart?.items || pedido.shoppingCart.items.length === 0) {
                console.warn('No hay items en el carrito del pedido');
                return [];
            }

            const items = pedido.shoppingCart.items;
            console.log(`Procesando ${items.length} productos...`);

            // Limitar concurrencia para evitar sobrecargar el servidor
            const BATCH_SIZE = 3; // Procesar de a 3 productos a la vez
            const productsData = [];

            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);
                
                // Usar Promise.allSettled para que no falle si un producto falla
                const batchPromises = batch.map(item => getProductData(item));
                const batchResults = await Promise.allSettled(batchPromises);
                
                // Procesar resultados del batch
                batchResults.forEach((result, batchIndex) => {
                    const originalIndex = i + batchIndex;
                    
                    if (result.status === 'fulfilled') {
                        productsData.push(result.value);
                    } else {
                        console.error(`Error en producto ${originalIndex}:`, result.reason);
                        // Devolver datos básicos del item original
                        const originalItem = items[originalIndex];
                        productsData.push({
                            ...originalItem,
                            name: 'Producto con error',
                            description: 'No se pudo cargar la información',
                            image: null,
                            price: originalItem?.price || 0
                        });
                    }
                });

                // Pequeña pausa entre batches para no sobrecargar
                if (i + BATCH_SIZE < items.length) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            console.log(`Productos procesados exitosamente: ${productsData.length}`);
            return productsData;
            
        } catch (error) {
            console.error('Error general al obtener productos del pedido:', error);
            return []; // Devolver array vacío en lugar de lanzar error
        }
    };

    // Función principal para preparar datos del pedido - MEJORADA con timeout global y manejo robusto
    const prepareOrderDetailsData = async (pedido) => {
        try {
            console.log('=== Preparando datos del pedido ===');
            console.log('Pedido ID:', pedido?._id);
            
            if (!pedido || !pedido._id) {
                throw new Error('Pedido inválido - falta información básica');
            }

            // Timeout global para toda la operación
            const globalController = new AbortController();
            const globalTimeoutId = setTimeout(() => {
                globalController.abort();
            }, 20000); // 20 segundos máximo para toda la operación

            try {
                // Usar Promise.allSettled para que no falle si una parte falla
                const [customerResult, productsResult] = await Promise.allSettled([
                    getCustomerData(pedido.shoppingCart?.clientId),
                    getOrderProductsData(pedido)
                ]);

                clearTimeout(globalTimeoutId);

                // Procesar resultados
                const customerData = customerResult.status === 'fulfilled' ? customerResult.value : null;
                const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];

                if (customerResult.status === 'rejected') {
                    console.warn('Error obteniendo datos del cliente:', customerResult.reason?.message || 'Error desconocido');
                }
                
                if (productsResult.status === 'rejected') {
                    console.warn('Error obteniendo datos de productos:', productsResult.reason?.message || 'Error desconocido');
                }

                console.log('✅ Datos preparados:', {
                    hasCustomerData: !!customerData,
                    productsCount: productsData.length
                });

                return {
                    orderData: pedido,
                    customerData,
                    productsData: Array.isArray(productsData) ? productsData : []
                };

            } catch (globalError) {
                clearTimeout(globalTimeoutId);
                
                if (globalError.name === 'AbortError') {
                    throw new Error('La operación tardó demasiado tiempo');
                }
                throw globalError;
            }

        } catch (error) {
            console.error('❌ Error crítico al preparar datos para OrderDetail:', error);
            
            // En lugar de lanzar error, devolver datos básicos
            return {
                orderData: pedido,
                customerData: null,
                productsData: []
            };
        }
    };

    // Funciones de utilidad para formateo - Memoizadas con useCallback y manejo de errores
    const formatOrderDate = useCallback((dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            
            // Verificar que la fecha sea válida
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }
            
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    }, []);

    const getCancellableDate = useCallback((createdAt) => {
        try {
            if (!createdAt) return 'N/A';
            const date = new Date(createdAt);
            
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            date.setDate(date.getDate() + 3);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error calculando fecha de cancelación:', error);
            return 'N/A';
        }
    }, []);

    const getTrackingStatusLabel = useCallback((trackingStatus) => {
        try {
            const statusMap = {
                'Agendado': 'Preparando',
                'En proceso': 'En proceso',
                'Entregado': 'Entregado',
                'Cancelado': 'Cancelado'
            };
            return statusMap[trackingStatus] || trackingStatus || 'Estado desconocido';
        } catch (error) {
            console.error('Error obteniendo etiqueta de estado:', error);
            return 'Estado desconocido';
        }
    }, []);

    const getOrderStatusColor = useCallback((trackingStatus) => {
        try {
            const colorMap = {
                'Agendado': 'text-yellow-500 border-yellow-300', 
                'En proceso': 'text-blue-500 border-blue-300',
                'Entregado': 'text-green-500 border-green-300',
                'Cancelado': 'text-red-500 border-red-300'
            };
            return colorMap[trackingStatus] || 'text-gray-500 border-gray-300';
        } catch (error) {
            console.error('Error obteniendo color de estado:', error);
            return 'text-gray-500 border-gray-300';
        }
    }, []);

    return {
        // Estados
        userOrders,
        loadingOrders,
        
        // Funciones principales
        getUserOrders,
        prepareOrderDetailsData,
        
        // Funciones de utilidad
        formatOrderDate,
        getCancellableDate,
        getTrackingStatusLabel,
        getOrderStatusColor,
        
        // Setter para casos especiales
        setUserOrders
    };
};

export default useOrders;
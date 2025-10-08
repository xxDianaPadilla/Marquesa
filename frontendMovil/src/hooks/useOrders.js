import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

const useOrders = () => {
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Función para obtener pedidos del usuario - Memoizada
    const getUserOrders = useCallback(async (userId) => {
        try {
            console.log('Obteniendo pedidos para usuario: ', userId);
            setLoadingOrders(true);

            if (!userId) {
                console.warn('No se proporcionó userId para obtener pedidos');
                return;
            }

            const response = await fetch(`https://marquesa.onrender.com/api/sales/user/${userId}/orders`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Status de respuesta getUserOrders: ', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta completa getUserOrders: ', data);

                if (data && data.success && data.data) {
                    console.log('Pedidos obtenidos exitosamente: ', data.data);
                    setUserOrders(data.data);
                } else {
                    console.warn('Respuesta sin estructura esperada: ', data);
                    setUserOrders([]);
                }
            } else {
                const errorText = await response.text();
                console.error('Error en respuesta del servidor: ', response.status, errorText);
                setUserOrders([]);
                Alert.alert('Error', 'No se pudieron cargar los pedidos');
            }
        } catch (error) {
            console.error('Error al obtener pedidos del usuario: ', error);
            setUserOrders([]);
            Alert.alert('Error', 'Error de conexión al obtener pedidos');
        } finally {
            setLoadingOrders(false);
        }
    }, []); 

    // Función para obtener datos del cliente - MEJORADA con manejo de errores
    const getCustomerData = async (clientId) => {
        try {
            console.log('Obteniendo datos del cliente:', clientId);
            
            if (!clientId) {
                console.warn('ClientId no proporcionado');
                return null;
            }

            const customerResponse = await fetch(`https://marquesa.onrender.com/api/users/${clientId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Agregar timeout
                signal: AbortSignal.timeout(8000)
            });

            if (customerResponse.ok) {
                const customerResult = await customerResponse.json();
                console.log('Datos del cliente obtenidos exitosamente');
                return customerResult.data;
            } else {
                console.warn('Error al obtener datos del cliente, status:', customerResponse.status);
                return null;
            }
        } catch (error) {
            console.error('Error al obtener datos del cliente: ', error.message);
            return null; // NO lanzar error, devolver null
        }
    };

    // Función para obtener datos de un producto - MEJORADA
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

            let productResponse;
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

            productResponse = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000) // Timeout más corto para productos
            });

            if (productResponse && productResponse.ok) {
                const productResult = await productResponse.json();
                const productData = productResult.data;

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
            } else {
                console.warn('Error al obtener producto, status:', productResponse?.status);
                return {
                    ...item,
                    name: 'Producto no disponible',
                    description: 'Información no disponible',
                    image: null,
                    price: item?.price || 0
                };
            }
        } catch (error) {
            console.error('Error al obtener producto: ', item?.itemId, error.message);
            return {
                ...item,
                name: 'Error al cargar producto',
                description: 'No se pudo cargar la información',
                image: null,
                price: item?.price || 0
            };
        }
    };

    // Función para obtener todos los datos de productos de un pedido - MEJORADA
    const getOrderProductsData = async (pedido) => {
        try {
            console.log('Obteniendo datos de productos del pedido...');
            
            if (!pedido?.shoppingCart?.items || pedido.shoppingCart.items.length === 0) {
                console.warn('No hay items en el carrito del pedido');
                return [];
            }

            console.log(`Procesando ${pedido.shoppingCart.items.length} productos...`);

            // Usar Promise.allSettled en lugar de Promise.all para que no falle si un producto falla
            const productPromises = pedido.shoppingCart.items.map(item => getProductData(item));
            const results = await Promise.allSettled(productPromises);
            
            const productsData = results.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`Error en producto ${index}:`, result.reason);
                    // Devolver datos básicos del item original
                    const originalItem = pedido.shoppingCart.items[index];
                    return {
                        ...originalItem,
                        name: 'Producto con error',
                        description: 'No se pudo cargar la información',
                        image: null,
                        price: originalItem?.price || 0
                    };
                }
            });

            console.log(`Productos procesados exitosamente: ${productsData.length}`);
            return productsData;
            
        } catch (error) {
            console.error('Error general al obtener productos del pedido:', error);
            return []; // Devolver array vacío en lugar de lanzar error
        }
    };

    // Función principal para preparar datos del pedido - MEJORADA con manejo robusto
    const prepareOrderDetailsData = async (pedido) => {
        try {
            console.log('=== Preparando datos del pedido ===');
            console.log('Pedido ID:', pedido?._id);
            
            if (!pedido || !pedido._id) {
                throw new Error('Pedido inválido - falta información básica');
            }

            // Usar Promise.allSettled para que no falle si una parte falla
            const [customerResult, productsResult] = await Promise.allSettled([
                getCustomerData(pedido.shoppingCart?.clientId),
                getOrderProductsData(pedido)
            ]);

            // Procesar resultados
            const customerData = customerResult.status === 'fulfilled' ? customerResult.value : null;
            const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];

            if (customerResult.status === 'rejected') {
                console.warn('Error obteniendo datos del cliente:', customerResult.reason);
            }
            
            if (productsResult.status === 'rejected') {
                console.warn('Error obteniendo datos de productos:', productsResult.reason);
            }

            console.log('✅ Datos preparados:', {
                hasCustomerData: !!customerData,
                productsCount: productsData.length
            });

            return {
                orderData: pedido,
                customerData,
                productsData
            };

        } catch (error) {
            console.error('❌ Error crítico al preparar datos para OrderDetail:', error);
            // En lugar de mostrar Alert aquí, lanzar el error para que se maneje en el componente
            throw new Error(`Error preparando datos: ${error.message}`);
        }
    };

    // Funciones de utilidad para formateo - Memoizadas con useCallback
    const formatOrderDate = useCallback((dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
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
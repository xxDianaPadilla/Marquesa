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

    // Función para obtener datos del cliente
    const getCustomerData = async (clientId) => {
        try {
            const customerResponse = await fetch(`https://marquesa.onrender.com/api/users/${clientId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (customerResponse.ok) {
                const customerResult = await customerResponse.json();
                return customerResult.data;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener datos del cliente: ', error);
            return null;
        }
    };

    // Función para obtener datos de un producto
    const getProductData = async (item) => {
        try {
            let productResponse;

            if (item.itemType === 'product') {
                productResponse = await fetch(`https://marquesa.onrender.com/api/products/${item.itemId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
            } else if (item.itemType === 'custom') {
                productResponse = await fetch(`https://marquesa.onrender.com/api/customproducts/${item.itemId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (productResponse && productResponse.ok) {
                const productResult = await productResponse.json();
                const productData = productResult.data;

                return {
                    ...item,
                    name: productData.name || productData.productToPersonalize || 'Producto sin nombre',
                    description: productData.description || productData.extraComments || 'Sin descripción',
                    image: productData.images?.[0] || productData.referenceImage || null,
                    price: productData.price || 0
                };
            } else {
                return {
                    ...item,
                    name: 'Producto no disponible',
                    description: 'Información no disponible',
                    image: null,
                    price: 0
                };
            }
        } catch (error) {
            console.error('Error al obtener producto: ', item.itemId, error);
            return {
                ...item,
                name: 'Error al cargar producto',
                description: 'No se pudo cargar la información',
                image: null,
                price: 0
            };
        }
    };

    // Función para obtener todos los datos de productos de un pedido
    const getOrderProductsData = async (pedido) => {
        let productsData = [];
        
        if (pedido.shoppingCart.items && pedido.shoppingCart.items.length > 0) {
            const productPromises = pedido.shoppingCart.items.map(item => getProductData(item));
            productsData = await Promise.all(productPromises);
        }
        
        return productsData;
    };

    // Función principal para preparar datos del pedido
    const prepareOrderDetailsData = async (pedido) => {
        try {
            const [customerData, productsData] = await Promise.all([
                getCustomerData(pedido.shoppingCart.clientId),
                getOrderProductsData(pedido)
            ]);

            return {
                orderData: pedido,
                customerData,
                productsData
            };
        } catch (error) {
            console.error('Error al preparar datos para OrderDetail: ', error);
            Alert.alert('Error', 'Error al cargar los detalles del pedido');
            throw error;
        }
    };

    // Funciones de utilidad para formateo - Memoizadas con useCallback
    const formatOrderDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    const getCancellableDate = useCallback((createdAt) => {
        const date = new Date(createdAt);
        date.setDate(date.getDate() + 3);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    const getTrackingStatusLabel = useCallback((trackingStatus) => {
        const statusMap = {
            'Agendado': 'Preparando',
            'En proceso': 'En proceso',
            'Entregado': 'Entregado'
        };
        return statusMap[trackingStatus] || trackingStatus;
    }, []);

    const getOrderStatusColor = useCallback((trackingStatus) => {
        const colorMap = {
            'Agendado': 'text-yellow-500 border-yellow-300', 
            'En proceso': 'text-blue-500 border-blue-300',
            'Entregado': 'text-green-500 border-green-300'
        };
        return colorMap[trackingStatus] || 'text-gray-500 border-gray-300';
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
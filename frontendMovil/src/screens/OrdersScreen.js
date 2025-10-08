import React, { useEffect, useCallback } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    Platform,
    Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import backIcon from '../images/backIcon.png';
import OrderCards from "../components/OrderCards";
import { useAuth } from "../context/AuthContext";
import useOrders from "../hooks/useOrders";

const OrdersScreen = () => {
    const navigation = useNavigation();
    const { userInfo, user, isAuthenticated } = useAuth();

    const {
        userOrders,
        loadingOrders,
        getUserOrders,
        prepareOrderDetailsData,
        formatOrderDate,
        getCancellableDate,
        getTrackingStatusLabel,
        getOrderStatusColor
    } = useOrders();

    const userData = userInfo || user || {};

    // Función mejorada para manejar los detalles del pedido
    const handleOrderDetails = useCallback(async (pedido) => {
        console.log('=== Iniciando navegación a detalles ===');
        console.log('Pedido ID:', pedido?._id);
        console.log('Pedido completo:', JSON.stringify(pedido, null, 2));
        
        try {
            // Validación básica del pedido
            if (!pedido || !pedido._id) {
                console.error('❌ Pedido inválido - falta ID');
                Alert.alert(
                    'Error', 
                    'Datos del pedido incompletos. Por favor, intenta nuevamente.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Crear datos mínimos para navegación
            const basicOrderData = {
                orderData: {
                    _id: pedido._id,
                    createdAt: pedido.createdAt,
                    updatedAt: pedido.updatedAt,
                    deliveryDate: pedido.deliveryDate,
                    deliveryAddress: pedido.deliveryAddress,
                    deliveryPoint: pedido.deliveryPoint,
                    receiverName: pedido.receiverName,
                    receiverPhone: pedido.receiverPhone,
                    paymentType: pedido.paymentType,
                    trackingStatus: pedido.trackingStatus,
                    status: pedido.status,
                    shoppingCart: pedido.shoppingCart || { total: 0, items: [] }
                },
                customerData: null,
                productsData: []
            };

            // Intentar obtener datos adicionales solo si la función existe y es válida
            let detailedOrderData = basicOrderData;
            
            if (prepareOrderDetailsData && typeof prepareOrderDetailsData === 'function') {
                try {
                    console.log('⏳ Preparando datos detallados...');
                    
                    // Agregar timeout para evitar que se cuelgue
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout al preparar datos')), 10000);
                    });

                    detailedOrderData = await Promise.race([
                        prepareOrderDetailsData(pedido),
                        timeoutPromise
                    ]);
                    
                    console.log('✅ Datos detallados obtenidos exitosamente');
                } catch (prepareError) {
                    console.warn('⚠️ Error preparando datos detallados, usando datos básicos:', prepareError.message);
                    // Continúa con datos básicos - NO lanza error
                    detailedOrderData = basicOrderData;
                }
            } else {
                console.warn('⚠️ Función prepareOrderDetailsData no disponible, usando datos básicos');
            }

            // Validar datos antes de navegar
            if (!detailedOrderData || !detailedOrderData.orderData) {
                console.error('❌ Datos de navegación inválidos');
                throw new Error('Datos de navegación inválidos');
            }

            console.log('🚀 Navegando con datos:', {
                hasOrderData: !!detailedOrderData.orderData,
                hasCustomerData: !!detailedOrderData.customerData,
                productsCount: detailedOrderData.productsData?.length || 0
            });

            // Navegar con datos seguros
            navigation.navigate('OrderDetailsScreen', {
                ...detailedOrderData,
                // Fallback para orderId si falla todo lo demás
                orderId: pedido._id
            });

        } catch (error) {
            console.error('❌ Error crítico en handleOrderDetails:', error);
            
            // Navegación de emergencia con solo el ID
            try {
                console.log('🆘 Intentando navegación de emergencia...');
                navigation.navigate('OrderDetailsScreen', {
                    orderId: pedido._id,
                    orderData: {
                        _id: pedido._id,
                        createdAt: pedido.createdAt,
                        trackingStatus: pedido.trackingStatus || 'Agendado',
                        shoppingCart: pedido.shoppingCart || { total: 0, items: [] }
                    }
                });
            } catch (emergencyError) {
                console.error('❌ Error en navegación de emergencia:', emergencyError);
                Alert.alert(
                    'Error de navegación', 
                    'No se pudo acceder a los detalles del pedido. Por favor, reinicia la aplicación.',
                    [{ text: 'OK' }]
                );
            }
        }
    }, [prepareOrderDetailsData, navigation]);

    useEffect(() => {
        if (userData && (userData._id || userData.id)) {
            const userId = userData._id || userData.id;
            getUserOrders(userId);
        }
    }, []);

    // Renderizar pantalla si no está autenticado
    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                {/* Header con estilo Blog de Marquesa */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Mis pedidos</Text>

                    <View style={styles.placeholder} />
                </View>

                <View style={styles.centeredContent}>
                    <Text style={styles.errorText}>
                        Debes iniciar sesión para ver tus pedidos
                    </Text>
                </View>
            </View>
        );
    }

    // Renderizar pantalla si está autenticado
    return (
        <View style={styles.container}>
            {/* Header con estilo Blog de Marquesa */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Mis pedidos</Text>

                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loadingOrders ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E8ACD2" />
                        <Text style={styles.loadingText}>Cargando pedidos...</Text>
                    </View>
                ) : userOrders.length > 0 ? (
                    userOrders.map((pedido, idx) => (
                        <OrderCards
                            key={pedido._id || idx} // Usar ID del pedido como key
                            pedido={pedido}
                            onDetailsPress={handleOrderDetails}
                            formatOrderDate={formatOrderDate}
                            getCancellableDate={getCancellableDate}
                            getTrackingStatusLabel={getTrackingStatusLabel}
                            getOrderStatusColor={getOrderStatusColor}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tienes pedidos recientes</Text>
                        <Text style={styles.emptySubtext}>
                            Cuando realices tu primera compra, aparecerá aquí
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// Estilos (sin cambios)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#1f2937',
        marginTop: 20,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
    },
});

export default OrdersScreen;
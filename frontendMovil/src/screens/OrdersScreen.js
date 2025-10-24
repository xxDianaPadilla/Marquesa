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

    // Función mejorada y simplificada para manejar los detalles del pedido
    const handleOrderDetails = useCallback(async (pedido) => {
        console.log('=== Iniciando navegación a detalles ===');
        console.log('Pedido ID:', pedido?._id);
        
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

            // Crear datos mínimos seguros para navegación
            const safeOrderData = {
                _id: pedido._id,
                createdAt: pedido.createdAt,
                updatedAt: pedido.updatedAt,
                deliveryDate: pedido.deliveryDate,
                deliveryAddress: pedido.deliveryAddress || 'Dirección no disponible',
                deliveryPoint: pedido.deliveryPoint,
                receiverName: pedido.receiverName,
                receiverPhone: pedido.receiverPhone,
                paymentType: pedido.paymentType || 'No especificado',
                trackingStatus: pedido.trackingStatus || 'Agendado',
                status: pedido.status || 'Activo',
                shoppingCart: pedido.shoppingCart || { total: 0, items: [], clientId: null }
            };

            // Datos básicos para navegación
            const basicNavigationData = {
                orderData: safeOrderData,
                customerData: null,
                productsData: []
            };

            console.log('🚀 Navegando con datos básicos seguros');

            // Navegar inmediatamente con datos básicos
            navigation.navigate('OrderDetailsScreen', {
                ...basicNavigationData,
                // Fallback para orderId si falla todo lo demás
                orderId: pedido._id
            });

            // OPCIONAL: Intentar cargar datos adicionales en background (sin bloquear navegación)
            if (prepareOrderDetailsData && typeof prepareOrderDetailsData === 'function') {
                console.log('🔄 Cargando datos adicionales en background...');
                
                try {
                    // Timeout muy corto para datos adicionales
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Timeout datos adicionales')), 3000);
                    });

                    // No esperar por esta promesa
                    Promise.race([
                        prepareOrderDetailsData(pedido),
                        timeoutPromise
                    ]).then(detailedData => {
                        console.log('✅ Datos adicionales obtenidos (background)');
                        // Los datos adicionales se cargarán en OrderDetailsScreen
                    }).catch(bgError => {
                        console.warn('⚠️ Error en carga background (no crítico):', bgError.message);
                        // No hacer nada, la pantalla ya navegó con datos básicos
                    });
                } catch (bgError) {
                    console.warn('⚠️ Error preparando datos background:', bgError);
                    // No hacer nada, continuar con navegación básica
                }
            }

        } catch (error) {
            console.error('❌ Error crítico en handleOrderDetails:', error);
            
            // Navegación de emergencia con datos ultra-básicos
            try {
                console.log('🆘 Intentando navegación de emergencia...');
                navigation.navigate('OrderDetailsScreen', {
                    orderId: pedido._id,
                    orderData: {
                        _id: pedido._id,
                        createdAt: pedido.createdAt,
                        trackingStatus: pedido.trackingStatus || 'Agendado',
                        deliveryAddress: 'Dirección no disponible',
                        paymentType: 'No especificado',
                        shoppingCart: { total: 0, items: [] }
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
    }, [navigation, prepareOrderDetailsData]);

    // Effect mejorado para cargar pedidos con manejo de errores
    useEffect(() => {
        const loadUserOrders = async () => {
            try {
                if (userData && (userData._id || userData.id)) {
                    const userId = userData._id || userData.id;
                    console.log('Cargando pedidos para usuario:', userId);
                    await getUserOrders(userId);
                } else {
                    console.warn('No se encontró ID de usuario válido');
                }
            } catch (error) {
                console.error('Error cargando pedidos en useEffect:', error);
            }
        };

        loadUserOrders();
    }, [userData._id, userData.id, getUserOrders]);

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
                            key={pedido._id || `order-${idx}`} // Usar ID del pedido como key con fallback
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
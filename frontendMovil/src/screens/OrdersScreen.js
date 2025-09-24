import React, { useEffect, useCallback } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import backIcon from '../images/backIcon.png';
import OrderCards from "../components/OrderCards";
import { useAuth } from "../context/AuthContext";
import useOrders from "../hooks/useOrders";

// Componente principal para mostrar la pantalla de pedidos del usuario
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

    const handleOrderDetails = useCallback(async (pedido) => {
        try {
            const orderDetailsData = await prepareOrderDetailsData(pedido);
            navigation.navigate('OrderDetailsScreen', orderDetailsData);
        } catch (error) {
            navigation.navigate('OrderDetailsScreen');
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
                            key={idx}
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

// Estilos
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

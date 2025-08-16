import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
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

    const handleOrderDetails = useCallback(async (pedido) => {
        try {
            const orderDetailsData = await prepareOrderDetailsData(pedido);
            navigation.navigate('OrderDetails', orderDetailsData);
        } catch (error) {
            navigation.navigate('OrderDetails');
        }
    }, [prepareOrderDetailsData, navigation]);

    useEffect(() => {
        if (userData && (userData._id || userData.id)) {
            const userId = userData._id || userData.id;
            getUserOrders(userId);
        }
    }, []); 

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Mis pedidos</Text>
                </View>

                <View style={styles.centeredContent}>
                    <Text style={styles.errorText}>Debes iniciar sesión para ver tus pedidos</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Mis pedidos</Text>
            </View>

            {/* Contenido */}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#374151',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
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
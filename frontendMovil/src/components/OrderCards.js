import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import giftIcon from '../images/giftIcon.png';
import calendarIcon from "../images/calendarIcon.png";

const OrderCards = ({
    pedido,
    onDetailsPress,
    formatOrderDate,
    getCancellableDate,
    getTrackingStatusLabel,
    getOrderStatusColor
}) => {
    const getStatusBackgroundColor = (trackingStatus) => {
        const colorMap = {
            'Agendado': '#FEF3C7',
            'Preparando': '#FEF3C7',
            'En proceso': '#DBEAFE',
            'Entregado': '#D1FAE5'
        };
        return colorMap[trackingStatus] || '#F2F4F6';
    };

    const getStatusTextColor = (trackingStatus) => {
        const colorMap = {
            'Agendado': '#D97706',
            'Preparando': '#D97706',
            'En proceso': '#2563EB',
            'Entregado': '#059669'
        };
        return colorMap[trackingStatus] || '#6B7280';
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Header con número de pedido y estado */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.orderNumber}>
                            Pedido #{pedido._id?.slice(-6) || 'N/A'}
                        </Text>
                        <Text style={styles.orderDate}>
                            Realizado el {formatOrderDate(pedido.createdAt)}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: getStatusBackgroundColor(pedido.trackingStatus)
                        }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: getStatusTextColor(pedido.trackingStatus) }
                        ]}>
                            {getTrackingStatusLabel(pedido.trackingStatus)}
                        </Text>
                    </View>
                </View>

                {/* Información del pedido */}
                <View style={styles.orderInfo}>
                    <View style={styles.productInfo}>
                        <Image source={giftIcon} style={styles.icon} />
                        <Text style={styles.productText}>
                            {pedido.shoppingCart?.items?.length || 0} productos
                        </Text>
                        <Text style={styles.totalText}>
                            Total: ${pedido.shoppingCart?.total?.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.cancellableInfo}>
                        <Image source={calendarIcon} style={styles.icon} />
                        <Text style={styles.cancellableText}>
                            Cancelable hasta: {getCancellableDate(pedido.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Botón de detalles */}
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => onDetailsPress(pedido)}
                >
                    <Text style={styles.detailsButtonText}>Detalles pedidos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 600,
        color: '#1F2937',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '500',
    },
    orderInfo: {
        marginBottom: 16,
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 6,
        tintColor: '#6B7280',
    },
    productText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    totalText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        fontWeight: '500',
        margin: 8,
    },
    cancellableInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancellableText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        marginTop: 5,
    },
    detailsButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 500,
    },
})

export default OrderCards;
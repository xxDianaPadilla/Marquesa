import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// Importación de iconos locales
import giftIcon from '../images/giftIcon.png';
import calendarIcon from "../images/calendarIcon.png";

// Componente para mostrar tarjetas de pedidos con información detallada
const OrderCards = ({
    pedido, // Objeto con los datos del pedido
    onDetailsPress, // Función callback para manejar el press en detalles
    formatOrderDate, // Función para formatear la fecha del pedido
    getCancellableDate, // Función para obtener la fecha límite de cancelación
    getTrackingStatusLabel, // Función para obtener la etiqueta del estado de seguimiento
    getOrderStatusColor // Función para obtener el color del estado del pedido
}) => {
    // Función que retorna el color de fondo basado en el estado de seguimiento
    const getStatusBackgroundColor = (trackingStatus) => {
        const colorMap = {
            'Agendado': '#FEF3C7',     // Amarillo claro
            'Preparando': '#FEF3C7',   // Amarillo claro
            'En proceso': '#DBEAFE',   // Azul claro
            'Entregado': '#D1FAE5'     // Verde claro
        };
        return colorMap[trackingStatus] || '#F2F4F6'; // Color por defecto si no existe el estado
    };

    // Función que retorna el color del texto basado en el estado de seguimiento
    const getStatusTextColor = (trackingStatus) => {
        const colorMap = {
            'Agendado': '#D97706',     // Amarillo oscuro
            'Preparando': '#D97706',   // Amarillo oscuro
            'En proceso': '#2563EB',   // Azul oscuro
            'Entregado': '#059669'     // Verde oscuro
        };
        return colorMap[trackingStatus] || '#6B7280'; // Color por defecto si no existe el estado
    };

    return (
        // Tarjeta principal del pedido con sombra
        <View style={styles.card}>
            {/* Contenido interno de la tarjeta */}
            <View style={styles.cardContent}>
                {/* Header con número de pedido y estado */}
                <View style={styles.header}>
                    {/* Información básica del pedido */}
                    <View>
                        {/* Número de pedido usando los últimos 6 caracteres del ID */}
                        <Text style={styles.orderNumber}>
                            Pedido #{pedido._id?.slice(-6) || 'N/A'}
                        </Text>
                        {/* Fecha en que se realizó el pedido */}
                        <Text style={styles.orderDate}>
                            Realizado el {formatOrderDate(pedido.createdAt)}
                        </Text>
                    </View>
                    {/* Badge del estado con colores dinámicos */}
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
                    {/* Información de productos y total */}
                    <View style={styles.productInfo}>
                        {/* Icono de regalo */}
                        <Image source={giftIcon} style={styles.icon} />
                        {/* Cantidad de productos en el pedido */}
                        <Text style={styles.productText}>
                            {pedido.shoppingCart?.items?.length || 0} productos
                        </Text>
                        {/* Total del pedido formateado a 2 decimales */}
                        <Text style={styles.totalText}>
                            Total: ${pedido.shoppingCart?.total?.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    {/* Información de cancelación */}
                    <View style={styles.cancellableInfo}>
                        {/* Icono de calendario */}
                        <Image source={calendarIcon} style={styles.icon} />
                        {/* Fecha límite para cancelar el pedido */}
                        <Text style={styles.cancellableText}>
                            Cancelable hasta: {getCancellableDate(pedido.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Botón de detalles */}
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => onDetailsPress(pedido)} // Llama a la función callback con el pedido
                >
                    <Text style={styles.detailsButtonText}>Detalles pedidos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Tarjeta principal con sombra y bordes redondeados
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        // Sombra para iOS
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        // Elevación para Android
        elevation: 5,
    },
    // Contenido interno con padding
    cardContent: {
        padding: 16,
    },
    // Header con layout horizontal entre número/fecha y estado
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    // Estilo del número de pedido
    orderNumber: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 600,
        color: '#1F2937',
        marginBottom: 2,
    },
    // Estilo de la fecha del pedido
    orderDate: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    // Badge del estado con bordes redondeados
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    // Texto del estado dentro del badge
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '500',
    },
    // Contenedor de la información del pedido
    orderInfo: {
        marginBottom: 16,
    },
    // Información de productos con layout horizontal
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    // Estilo de los iconos con tinte gris
    icon: {
        width: 16,
        height: 16,
        marginRight: 6,
        tintColor: '#6B7280',
    },
    // Texto de cantidad de productos
    productText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    // Texto del total del pedido
    totalText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        fontWeight: '500',
        margin: 8,
    },
    // Información de cancelación con layout horizontal
    cancellableInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Texto de fecha límite de cancelación
    cancellableText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        marginTop: 5,
    },
    // Botón de detalles con fondo rosa
    detailsButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    // Texto del botón de detalles
    detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 500,
    },
})

export default OrderCards;
import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import backIcon from '../images/backIcon.png';
import OrderCards from "../components/OrderCards";
import { useAuth } from "../context/AuthContext";
import useOrders from "../hooks/useOrders";

// Componente principal para mostrar la pantalla de pedidos del usuario
const OrdersScreen = () => {
    // Hook de navegación para manejar la navegación entre pantallas
    const navigation = useNavigation();
    
    // Obtener información del usuario y estado de autenticación desde el contexto
    const { userInfo, user, isAuthenticated } = useAuth();
    
    // Hook personalizado para manejar todas las operaciones relacionadas con pedidos
    const {
        userOrders,               // Lista de pedidos del usuario
        loadingOrders,           // Estado de carga de pedidos
        getUserOrders,           // Función para obtener pedidos del usuario
        prepareOrderDetailsData, // Función para preparar datos de detalles del pedido
        formatOrderDate,         // Función para formatear fechas de pedidos
        getCancellableDate,      // Función para obtener fecha límite de cancelación
        getTrackingStatusLabel,  // Función para obtener etiqueta de estado de seguimiento
        getOrderStatusColor      // Función para obtener color según estado del pedido
    } = useOrders();

    // Obtener datos del usuario, priorizando userInfo sobre user
    const userData = userInfo || user || {};

    // Función para manejar la navegación a los detalles de un pedido específico
    const handleOrderDetails = useCallback(async (pedido) => {
        try {
            // Preparar los datos necesarios para la pantalla de detalles
            const orderDetailsData = await prepareOrderDetailsData(pedido);
            // Navegar a la pantalla de detalles con los datos preparados
            navigation.navigate('OrderDetails', orderDetailsData);
        } catch (error) {
            // En caso de error, navegar sin datos (pantalla manejará el error)
            navigation.navigate('OrderDetails');
        }
    }, [prepareOrderDetailsData, navigation]);

    // Efecto para cargar los pedidos del usuario cuando el componente se monta
    useEffect(() => {
        // Verificar si hay datos de usuario con un ID válido
        if (userData && (userData._id || userData.id)) {
            // Obtener el ID del usuario (puede estar en _id o id)
            const userId = userData._id || userData.id;
            // Cargar los pedidos del usuario
            getUserOrders(userId);
        }
    }, []); // Array vacío significa que solo se ejecuta una vez al montar

    // Renderizar pantalla para usuarios no autenticados
    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                {/* Header con botón de regreso y título */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Image source={backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Mis pedidos</Text>
                </View>

                {/* Mensaje de error para usuarios no autenticados */}
                <View style={styles.centeredContent}>
                    <Text style={styles.errorText}>Debes iniciar sesión para ver tus pedidos</Text>
                </View>
            </View>
        );
    }

    // Renderizar pantalla principal para usuarios autenticados
    return (
        <View style={styles.container}>
            {/* Header con navegación y título */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Mis pedidos</Text>
            </View>

            {/* Contenido principal con scroll vertical */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Mostrar indicador de carga mientras se obtienen los pedidos */}
                {loadingOrders ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E8ACD2" />
                        <Text style={styles.loadingText}>Cargando pedidos...</Text>
                    </View>
                ) : userOrders.length > 0 ? (
                    // Mostrar lista de pedidos si existen
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
                    // Mostrar mensaje cuando no hay pedidos
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

// Estilos para todos los componentes de la pantalla
const styles = StyleSheet.create({
    // Contenedor principal que ocupa toda la pantalla
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // Estilo para el header con botón de regreso y título
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 50, // Espacio extra para la status bar
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    // Botón de regreso en el header
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    // Icono del botón de regreso
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#374151',
    },
    // Título de la pantalla
    title: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        color: '#1F2937',
        flex: 1, // Ocupa el espacio restante
    },
    // Contenedor del contenido principal con scroll
    content: {
        flex: 1,
        paddingTop: 8,
    },
    // Contenedor para mostrar el indicador de carga
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    // Texto que acompaña al indicador de carga
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    // Contenedor para mostrar cuando no hay pedidos
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    // Texto principal del estado vacío
    emptyText: {
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    // Texto secundario del estado vacío
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Contenedor centrado para mensajes generales
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    // Texto de error (usuario no autenticado)
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
    },
});

export default OrdersScreen;
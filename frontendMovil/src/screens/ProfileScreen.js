// frontendMovil/src/screens/ProfileScreen.js - VERSIÓN FINAL CON NAVEGACIÓN A RULETA
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { CustomAlert, LoadingDialog, ConfirmationDialog } from "../components/CustomAlerts";

// Importación de iconos utilizados en la pantalla
import backIcon from "../images/backIcon.png";
import userIcon from "../images/userIcon.png";
import orderIcon from "../images/orderIcon.png";
import notificationIcon from "../images/notificationIcon.png";
import mediaIcon from "../images/mediaIcon.png";
import discountIcon from "../images/discountIcon.png";
import termConditionIcon from "../images/termConditionIcon.png";
import promocionesIcon from "../images/promocionesIcon.png";
import logoutIcon from "../images/logoutIcon.png";
import goIcon from "../images/goIcon.png";

// Componente principal para mostrar el perfil del usuario y opciones de la cuenta
export default function ProfileScreen({ navigation }) {
    // Hook de autenticación para obtener datos del usuario y función de logout
    const { user, userInfo, logout, isLoggingOut } = useAuth();

    // Hook para manejar alertas, confirmaciones y diálogos de carga
    const {
        alertState,
        showConfirmation,
        hideConfirmation,
        showError,
        showLoading,
        hideLoading
    } = useAlert();

    // Función para manejar el cierre de sesión con confirmación
    const handleLogout = async () => {
        // Mostrar diálogo de confirmación antes de cerrar sesión
        showConfirmation({
            title: "Cerrar Sesión",
            message: "¿Estás seguro que deseas cerrar sesión?",
            confirmText: "Cerrar Sesión",
            cancelText: "Cancelar",
            isDangerous: true, // Marca la acción como potencialmente destructiva
            onConfirm: async () => {
                hideConfirmation();

                try {
                    console.log("Iniciando logout desde ProfileScreen...");

                    // Mostrar indicador de carga durante el proceso de logout
                    showLoading({
                        title: "Cerrando Sesión...",
                        message: "Por favor espera...",
                        color: "#FF6B6B"
                    });

                    // Ejecutar la función de logout
                    const result = await logout();

                    hideLoading();

                    // Si el logout es exitoso, resetear el stack de navegación
                    if (result.success) {
                        console.log('Logout exitoso, navegando a Login...');
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                } catch (error) {
                    hideLoading();
                    console.error('Error durante logout: ', error);
                    showError("Hubo un problema al cerrar sesión");
                }
            },
            onCancel: hideConfirmation
        });
    };

    // Función para manejar la navegación hacia atrás
    const handleBackPress = () => {
        navigation.goBack();
    };

    // ✅ CONFIGURACIÓN ACTUALIZADA DEL MENÚ CON NAVEGACIÓN A RULETA
    const menuItems = [
        {
            id: 1,
            title: "Información personal",
            icon: userIcon,
            onPress: () => navigation.navigate('EditProfile')
        },
        {
            id: 2,
            title: "Mis pedidos",
            icon: orderIcon,
            onPress: () => navigation.navigate('Orders')
        },
        {
            id: 3,
            title: "Media",
            icon: mediaIcon,
            onPress: () => navigation.navigate('Media')
        },
        {
            id: 4,
            title: "Mis códigos de descuento",
            icon: discountIcon,
            onPress: () => {
                console.log('🎯 Navegando a DiscountCodes...');
                navigation.navigate('DiscountCodes');
            }
        },
        {
            id: 5,
            title: "Términos y condiciones",
            icon: termConditionIcon,
            onPress: () => console.log("Términos y condiciones - Funcionalidad pendiente")
        },
        {
            id: 6,
            title: "Ruleta y promociones",
            icon: promocionesIcon,
            onPress: () => {
                console.log('🎰 Navegando a Ruleta...');
                navigation.navigate('Ruleta');
            }
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header con botón de navegación */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            {/* Contenido principal con scroll */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sección del perfil del usuario */}
                <View style={styles.profileSection}>
                    {/* Contenedor de la imagen de perfil */}
                    <View style={styles.profileImageContainer}>
                        {/* Mostrar imagen de perfil si existe, sino mostrar inicial del nombre */}
                        {userInfo?.profilePicture ? (
                            <Image
                                source={{ uri: userInfo.profilePicture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            // Vista por defecto con la inicial del nombre
                            <View style={styles.defaultProfileImage}>
                                <Text style={styles.defaultProfileText}>
                                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Nombre del usuario */}
                    <Text style={styles.userName}>
                        {userInfo?.fullName || userInfo?.name || 'Usuario'}
                    </Text>
                </View>

                {/* Contenedor del menú de opciones */}
                <View style={styles.menuContainer}>
                    {/* Renderizar cada elemento del menú */}
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            activeOpacity={0.7} // ✅ Añadido feedback visual
                        >
                            {/* Lado izquierdo del elemento (icono + texto) */}
                            <View style={styles.menuItemLeft}>
                                <Image source={item.icon} style={styles.menuIcon} />
                                <Text style={styles.menuText}>{item.title}</Text>
                            </View>
                            {/* Icono de flecha para indicar navegación */}
                            <Image source={goIcon} style={styles.goIcon} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Botón de cerrar sesión */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoggingOut} // Deshabilitar mientras se procesa el logout
                    activeOpacity={0.7}
                >
                    <Image source={logoutIcon} style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>
                        {isLoggingOut ? "Cerrando Sesión..." : "Cerrar Sesión"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Componentes de alertas personalizadas */}
            {/* Alerta básica para mostrar mensajes generales */}
            <CustomAlert
                visible={alertState.basicAlert.visible}
                title={alertState.basicAlert.title}
                message={alertState.basicAlert.message}
                type={alertState.basicAlert.type}
                onConfirm={alertState.basicAlert.onConfirm}
                onCancel={alertState.basicAlert.onCancel}
                confirmText={alertState.basicAlert.confirmText}
                cancelText={alertState.basicAlert.cancelText}
                showCancel={alertState.basicAlert.showCancel}
            />

            {/* Diálogo de carga para procesos que requieren espera */}
            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

            {/* Diálogo de confirmación para acciones importantes */}
            <ConfirmationDialog
                visible={alertState.confirmation.visible}
                title={alertState.confirmation.title}
                message={alertState.confirmation.message}
                onConfirm={alertState.confirmation.onConfirm}
                onCancel={alertState.confirmation.onCancel}
                confirmText={alertState.confirmation.confirmText}
                cancelText={alertState.confirmation.cancelText}
                isDangerous={alertState.confirmation.isDangerous}
            />
        </View>
    );
};

// Estilos del componente
const styles = StyleSheet.create({
    // Contenedor principal de la pantalla
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 50, // Espacio para la status bar
    },
    // Header con botón de navegación
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // Botón para regresar
    backButton: {
        width: 24,
        height: 24,
    },
    // Icono del botón de regreso
    backIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    // Contenedor del contenido con scroll
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    // Sección del perfil del usuario
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    // Contenedor de la imagen de perfil
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    // Imagen de perfil del usuario
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
    },
    // Vista por defecto cuando no hay imagen de perfil
    defaultProfileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Texto de la inicial del nombre en la vista por defecto
    defaultProfileText: {
        fontSize: 32,
        fontFamily: 'Poppins-SemiBold',
        color: '#6B73FF',
    },
    // Nombre del usuario mostrado en el perfil
    userName: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
    },
    // Contenedor de todos los elementos del menú
    menuContainer: {
        marginBottom: 30, // ✅ Reducido para hacer espacio al acceso rápido
    },
    // Estilo individual de cada elemento del menú
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 1,
        borderRadius: 12,
        // Sombra para efecto de elevación
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // Sombra en Android
    },
    // Lado izquierdo del elemento del menú (icono + texto)
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    // Icono de cada elemento del menú
    menuIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
        marginRight: 15,
        tintColor: '#666666', // Color del icono
    },
    // Texto de cada elemento del menú
    menuText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        flex: 1,
    },
    // Icono de flecha para indicar navegación
    goIcon: {
        width: 16,
        height: 16,
        resizeMode: "contain",
        tintColor: "#CCCCCC",
    },
    // Botón especial para cerrar sesión
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 70, // Espacio extra al final
        // Sombra similar a los elementos del menú
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    // Icono del botón de logout
    logoutIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
        marginRight: 10,
        tintColor: '#FF6B6B', // Color rojo para indicar acción de salir
    },
    // Texto del botón de logout
    logoutText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#FF6B6B', // Color rojo para indicar acción de salir
    },
});
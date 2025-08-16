import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { CustomAlert, LoadingDialog, ConfirmationDialog } from "../components/CustomAlerts";
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

export default function ProfileScreen({ navigation }) {
    const { user, userInfo, logout, isLoggingOut } = useAuth();
    const {
        alertState,
        showConfirmation,
        hideConfirmation,
        showError,
        showLoading,
        hideLoading
    } = useAlert();

    const handleLogout = async () => {
        showConfirmation({
            title: "Cerrar Sesión",
            message: "¿Estás seguro que deseas cerrar sesión?",
            confirmText: "Cerrar Sesión",
            cancelText: "Cancelar",
            isDangerous: true,
            onConfirm: async () => {
                hideConfirmation();

                try {
                    console.log("Iniciando logout desde ProfileScreen...");

                    showLoading({
                        title: "Cerrando Sesión...",
                        message: "Por favor espera...",
                        color: "#FF6B6B"
                    });

                    const result = await logout();

                    hideLoading();

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

    const handleBackPress = () => {
        navigation.goBack();
    };

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
            title: "Notificaciones",
            icon: notificationIcon,
            onPress: () => navigation.navigate('Notifications')
        },
        {
            id: 4,
            title: "Media",
            icon: mediaIcon,
            onPress: () => console.log("Media")
        },
        {
            id: 5,
            title: "Mis códigos de descuento",
            icon: discountIcon,
            onPress: () => console.log("Mis códigos de descuento")
        },
        {
            id: 6,
            title: "Términos y condiciones",
            icon: termConditionIcon,
            onPress: () => console.log("Términos y condiciones")
        },
        {
            id: 7,
            title: "Ruletas y promociones",
            icon: promocionesIcon,
            onPress: () => console.log("Ruletas y promociones")
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {userInfo?.profilePicture ? (
                            <Image
                                source={{ uri: userInfo.profilePicture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Text style={styles.defaultProfileText}>
                                    {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.userName}>
                        {userInfo?.fullName || userInfo?.name || 'Usuario'}
                    </Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Image source={item.icon} style={styles.menuIcon} />
                                <Text style={styles.menuText}>{item.title}</Text>
                            </View>
                            <Image source={goIcon} style={styles.goIcon} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                >
                    <Image source={logoutIcon} style={styles.logoutIcon} />
                    <Text style={styles.logoutText}>
                        {isLoggingOut ? "Cerrando Sesión..." : "Cerrar Sesión"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Alerts */}
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

            <LoadingDialog
                visible={alertState.loading.visible}
                title={alertState.loading.title}
                message={alertState.loading.message}
                color={alertState.loading.color}
            />

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 24,
        height: 24,
    },
    backIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
    },
    defaultProfileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultProfileText: {
        fontSize: 32,
        fontFamily: 'Poppins-SemiBold',
        color: '#6B73FF',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
    },
    menuContainer: {
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 1,
        borderRadius: 12,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
        marginRight: 15,
        tintColor: '#666666',
    },
    menuText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        flex: 1,
    },
    goIcon: {
        width: 16,
        height: 16,
        resizeMode: "contain",
        tintColor: "#CCCCCC",
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 30,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 70,
    },
    logoutIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
        marginRight: 10,
        tintColor: '#FF6B6B',
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#FF6B6B',
    },
});
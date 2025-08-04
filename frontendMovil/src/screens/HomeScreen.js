import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import perfilIcon from "../images/perfilIcon.png";

export default function HomeScreen({ navigation }) {
    const { user, userInfo, logout, isLoggingOut } = useAuth();

    const handleProfilePress = () => {
        if (userInfo) {
            Alert.alert(
                "Información del Usuario",
                `Nombre: ${userInfo.name || 'No disponible'}\nEmail: ${userInfo.email || 'No disponible'}\nTipo: ${user?.userType || 'user'}`,
                [
                    {
                        text: "Cerrar Sesión",
                        style: "destructive",
                        onPress: handleLogout
                    }, {
                        text: "Cancelar",
                        style: "cancel"
                    }
                ]
            );
        } else {
            Alert.alert(
                "Opciones",
                "¿Qué deseas hacer?",
                [
                    {
                        text: "Cerrar Sesión",
                        style: "destructive",
                        onPress: handleLogout
                    },
                    {
                        text: "Cancelar",
                        style: "cancel"
                    }
                ]
            );
        }
    };

    const handleLogout = async () => {
        try {
            console.log("Iniciando logout desde HomeScreen...");
            const result = await logout();

            if (result.success) {
                console.log('Logout exitoso, navegando a Welcome...');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        } catch (error) {
            console.error('Error durante logout: ', error);
            Alert.alert("Error", "Hubo un problema al cerrar sesión");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header con botón de perfil */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                    disabled={isLoggingOut}
                >
                    <Image source={perfilIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
                <Text style={styles.welcomeText}>
                    ¡Bienvenido!
                </Text>

                {userInfo && (
                    <View style={styles.userInfoCard}>
                        <Text style={styles.userInfoTitle}>Información del Usuario</Text>
                        <Text style={styles.userInfoText}>
                            Nombre: {userInfo.name || 'No disponible'}
                        </Text>
                        <Text style={styles.userInfoText}>
                            Email: {userInfo.email || 'No disponible'}
                        </Text>
                        <Text style={styles.userInfoText}>
                            Tipo: {user?.userType || 'user'}
                        </Text>
                    </View>
                )}

                {isLoggingOut && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cerrando sesión...</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileButton: {
        width: 30,
        height: 30,
    },
    icon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        marginBottom: 30,
        textAlign: 'center',
    },
    userInfoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfoTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        marginBottom: 15,
        textAlign: 'center',
    },
    userInfoText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        marginBottom: 8,
        textAlign: 'center',
    },
    loadingContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
    },
});
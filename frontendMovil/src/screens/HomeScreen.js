import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import perfilIcon from "../images/perfilIcon.png";

export default function HomeScreen({ navigation }) {
    const { user, userInfo } = useAuth();

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    return (
        <View style={styles.container}>
            {/* Header con botón de perfil */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                >
                    <Image source={perfilIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
                <Text style={styles.welcomeText}>
                    ¡Bienvenido{userInfo?.fullName ? `, ${userInfo.fullName}` : ''}!
                </Text>

                <Text style={styles.instructionText}>
                    Toca el ícono de perfil para acceder a tu información y configuraciones
                </Text>

                {/* Aquí se agregará el contenido de la página de Home */}
                <View style={styles.homeContentCard}>
                    <Text style={styles.cardTitle}>Panel Principal</Text>
                    <Text style={styles.cardDescription}>
                        Desde aquí puedes navegar a todas las funciones de la aplicación
                    </Text>
                </View>
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
    instructionText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    homeContentCard: {
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
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        marginBottom: 10,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
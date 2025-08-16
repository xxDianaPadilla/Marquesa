import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import marquesaMiniLogo from "../images/marquesaMiniLogo.png";
import moreIcon from "../images/moreIcon.png";

const NotificationsCards = () => {
    const notifications = [
        {
            id: 1,
            type: "Promoción",
            message: "Se acercan las mejores promociones para ti 🛒.",
        },
        {
            id: 2,
            type: "Pedido enviado",
            message: "Tu pedido ha sido enviado con éxito. Agradecemos que nos confirmes cuando recibas",
        },
        {
            id: 3,
            type: "Confirmación de pedido",
            message: "Tu pedido ha sido confirmado, cuando esté listo el siguiente paso te avisaremos.",
        },
    ];

    return (
        <View style={styles.container}>
            {notifications.map((notification) => (
                <View key={notification.id} style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.logoContainer}>
                            <Image source={marquesaMiniLogo} style={styles.logo} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                                {notification.type}
                            </Text>
                            <Text style={styles.message} numberOfLines={3} ellipsizeMode="tail">
                                {notification.message}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <Image source={moreIcon} style={styles.moreIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    logoContainer: {
        width: 38,
        height: 38,
        borderRadius: 24,
        backgroundColor: '#FFE8E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        marginLeft: -4, 
        flexShrink: 0,  
    },
    logo: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
        minWidth: 0, 
    },
    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
        flexWrap: 'wrap', 
    },
    message: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        lineHeight: 20,
        flexWrap: 'wrap', 
        paddingRight: 18
    },
    moreButton: {
        padding: 4,
        flexShrink: 0, 
    },
    moreIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
    },
});

export default NotificationsCards;
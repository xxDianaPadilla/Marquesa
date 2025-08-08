import React from "react";
import { View, TextInput, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function PinkInputs({
    placeholder = "",
    value = "",
    onChangeText,
    icon,
    secureTextEntry = false,
    showPasswordToggle = false,
    onTogglePassword,
    eyeIcon,
    eyeOffIcon,
    keyboardType = "default",
    autoCapitalize = "sentences",
    style = {},
    inputStyle = {},
    iconStyle = {},
}) {
    return (
        <View style={[styles.inputContainer, style]}>
            {/* Icono izquierdo */}
            {icon && (
                <Image source={icon} style={[styles.inputIcon, iconStyle]} />
            )}
            
            {/* Campo de texto */}
            <TextInput
                style={[styles.textInput, inputStyle]}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
            />
            
            {/* Botón toggle para contraseña */}
            {showPasswordToggle && (
                <TouchableOpacity
                    onPress={onTogglePassword}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                >
                    <Image 
                        source={secureTextEntry ? eyeIcon : eyeOffIcon}
                        style={styles.eyeIconImage}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FDB4B7',
        paddingHorizontal: 20,
        paddingVertical: 4,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: '#999999',
        resizeMode: 'contain',
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C3550',
        paddingVertical: 12,
        paddingHorizontal: 0,
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
    eyeIconImage: {
        width: 20,
        height: 20,
        tintColor: '#CCCCCC',
        resizeMode: 'contain',
    },
});
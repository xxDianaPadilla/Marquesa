import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function PinkButton({ 
    title = "", 
    onPress, 
    style = {},
    textStyle = {},
    disabled = false 
}) {
    return (
        <TouchableOpacity
            style={[
                styles.continueButton,
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.continueButtonText,
                disabled && styles.disabledText,
                textStyle
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    continueButton: {
        backgroundColor: '#FDB4B7',
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 30,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledText: {
        color: '#999999',
    },
});
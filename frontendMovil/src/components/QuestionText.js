import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginText({ 
    questionText = "",
    linkText = "",
    onPress,
    style = {},
    questionStyle = {},
    linkStyle = {}
}) {
    return (
        <View style={[styles.loginSection, style]}>
            <Text style={[styles.loginText, questionStyle]}>
                {questionText}{' '}
                <TouchableOpacity 
                    onPress={onPress}
                    style={styles.loginLinkButton}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.loginLink, linkStyle]}>
                        {linkText}
                    </Text>
                </TouchableOpacity>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    loginSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    loginText: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginLinkButton: {
        marginLeft: 4,
    },
    loginLink: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#3C3550',
        top: 7,
    },
});
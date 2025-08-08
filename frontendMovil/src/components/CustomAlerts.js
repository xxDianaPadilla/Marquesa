import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

export const CustomAlert = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancelar",
    showCancel = false,
    type = "info"
}) => {
    const getIconColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return '#2196F3';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel || onConfirm}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    {/* Icono */}
                    <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
                        <Text style={styles.iconText}>{getIcon()}</Text>
                    </View>

                    {/* Título */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: getIconColor() }]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const LoadingDialog = ({
    visible,
    title = "Cargando...",
    message = "Por favor espera...",
    color = "#FF69B4"
}) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={() => { }}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={color} style={styles.loadingSpinner} />
                    <Text style={styles.loadingTitle}>{title}</Text>
                    {message && <Text style={styles.loadingMessage}>{message}</Text>}
                </View>
            </View>
        </Modal>
    );
};

export const ConfirmationDialog = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDangerous = false
}) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    {/* Icono de pregunta */}
                    <View style={[styles.iconContainer, { backgroundColor: isDangerous ? '#F44336' : '#FF9800' }]}>
                        <Text style={styles.iconText}>?</Text>
                    </View>

                    {/* Título */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: isDangerous ? '#F44336' : '#4CAF50' }
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const InputDialog = ({
    visible,
    title,
    message,
    placeholder = "Ingrese el texto...",
    value = "",
    onChangeText,
    onConfirm,
    onCancel,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    keyboardType = "default"
}) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    {/* Icono */}
                    <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
                        <Text style={styles.iconText}>✎</Text>
                    </View>

                    {/* Título */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Input */}
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType}
                        autoFocus={true}
                    />

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { backgroundColor: '#2196F3' }]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const ToastDialog = ({
    visible,
    message,
    type = "info",
    duration = 3000,
    onHide
}) => {
    React.useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onHide && onHide();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide]);

    const getIconColor = () => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return '#2196F3';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onHide}
        >
            <View style={styles.toastOverlay}>
                <View style={[styles.toastContainer, { borderLeftColor: getIconColor() }]}>
                    <View style={[styles.toastIconContainer, { backgroundColor: getIconColor() }]}>
                        <Text style={styles.toastIcon}>{getIcon()}</Text>
                    </View>
                    <Text style={styles.toastMessage}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: 320,
        width: '100%',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    alertTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#666666',
    },
    confirmButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF',
    },
    loadingContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 200,
    },
    loadingSpinner: {
        marginBottom: 15,
    },
    loadingTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 8,
    },
    loadingMessage: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#F9F9F9',
    },
    toastOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    toastContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderLeftWidth: 4,
    },
    toastIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    toastIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toastMessage: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        flex: 1,
    },
})
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from "react-native";

// Componente de alerta personalizable con iconos y tipos diferentes
// Props:
// - visible: Boolean para mostrar/ocultar la alerta
// - title: Título de la alerta
// - message: Mensaje de la alerta
// - onConfirm: Función al confirmar
// - onCancel: Función al cancelar
// - confirmText: Texto del botón confirmar (default: "OK")
// - cancelText: Texto del botón cancelar (default: "Cancelar")
// - showCancel: Boolean para mostrar botón cancelar (default: false)
// - type: Tipo de alerta ('info', 'success', 'error', 'warning') (default: 'info')
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
    // Función para obtener el color según el tipo de alerta
    const getIconColor = () => {
        switch (type) {
            case 'success': return '#4CAF50'; // Verde para éxito
            case 'error': return '#F44336';   // Rojo para error
            case 'warning': return '#FF9800'; // Naranja para advertencia
            default: return '#2196F3';        // Azul para información
        }
    };

    // Función para obtener el icono según el tipo de alerta
    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';  // Check mark
            case 'error': return '✕';    // X mark
            case 'warning': return '⚠';  // Warning symbol
            default: return 'ℹ';         // Info symbol
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel || onConfirm}
        >
            {/* Overlay semitransparente de fondo */}
            <View style={styles.alertOverlay}>
                {/* Contenedor principal de la alerta */}
                <View style={styles.alertContainer}>
                    {/* Contenedor del icono con color dinámico */}
                    <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
                        <Text style={styles.iconText}>{getIcon()}</Text>
                    </View>

                    {/* Título de la alerta */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje de la alerta */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Contenedor de botones */}
                    <View style={styles.buttonContainer}>
                        {/* Botón cancelar - solo se muestra si showCancel es true */}
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Botón confirmar con color dinámico */}
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

// Diálogo de carga con spinner y mensajes personalizables
// Props:
// - visible: Boolean para mostrar/ocultar el diálogo
// - title: Título del diálogo (default: "Cargando...")
// - message: Mensaje del diálogo (default: "Por favor espera...")
// - color: Color del spinner (default: "#FF69B4")
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
            onRequestClose={() => { }} // Función vacía - no se puede cerrar manualmente
        >
            {/* Overlay semitransparente de fondo */}
            <View style={styles.alertOverlay}>
                {/* Contenedor del diálogo de carga */}
                <View style={styles.loadingContainer}>
                    {/* Spinner de carga */}
                    <ActivityIndicator size="large" color={color} style={styles.loadingSpinner} />
                    {/* Título del diálogo de carga */}
                    <Text style={styles.loadingTitle}>{title}</Text>
                    {/* Mensaje del diálogo de carga */}
                    {message && <Text style={styles.loadingMessage}>{message}</Text>}
                </View>
            </View>
        </Modal>
    );
};

// Diálogo de confirmación con opciones de peligroso/normal
// Props:
// - visible: Boolean para mostrar/ocultar el diálogo
// - title: Título del diálogo
// - message: Mensaje del diálogo
// - onConfirm: Función al confirmar
// - onCancel: Función al cancelar
// - confirmText: Texto del botón confirmar (default: "Confirmar")
// - cancelText: Texto del botón cancelar (default: "Cancelar")
// - isDangerous: Boolean que cambia el color a rojo si es peligroso (default: false)
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
            {/* Overlay semitransparente de fondo */}
            <View style={styles.alertOverlay}>
                {/* Contenedor principal del diálogo */}
                <View style={styles.alertContainer}>
                    {/* Icono de pregunta con color dinámico según si es peligroso */}
                    <View style={[styles.iconContainer, { backgroundColor: isDangerous ? '#F44336' : '#FF9800' }]}>
                        <Text style={styles.iconText}>?</Text>
                    </View>

                    {/* Título del diálogo */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje del diálogo */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Contenedor de botones */}
                    <View style={styles.buttonContainer}>
                        {/* Botón cancelar */}
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Botón confirmar con color dinámico (rojo si es peligroso, verde si no) */}
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

// Diálogo con campo de entrada de texto
// Props:
// - visible: Boolean para mostrar/ocultar el diálogo
// - title: Título del diálogo
// - message: Mensaje del diálogo
// - placeholder: Placeholder del input (default: "Ingrese el texto...")
// - value: Valor actual del input (default: "")
// - onChangeText: Función al cambiar el texto
// - onConfirm: Función al confirmar
// - onCancel: Función al cancelar
// - confirmText: Texto del botón confirmar (default: "Aceptar")
// - cancelText: Texto del botón cancelar (default: "Cancelar")
// - keyboardType: Tipo de teclado (default: "default")
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
            {/* Overlay semitransparente de fondo */}
            <View style={styles.alertOverlay}>
                {/* Contenedor principal del diálogo */}
                <View style={styles.alertContainer}>
                    {/* Icono de lápiz/edición */}
                    <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
                        <Text style={styles.iconText}>✎</Text>
                    </View>

                    {/* Título del diálogo */}
                    {title && <Text style={styles.alertTitle}>{title}</Text>}

                    {/* Mensaje del diálogo */}
                    {message && <Text style={styles.alertMessage}>{message}</Text>}

                    {/* Campo de entrada de texto */}
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType}
                        autoFocus={true} // Enfocar automáticamente al abrir
                    />

                    {/* Contenedor de botones */}
                    <View style={styles.buttonContainer}>
                        {/* Botón cancelar */}
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Botón confirmar */}
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

// Componente de Toast (notificación temporal) con auto-ocultamiento
// Props:
// - visible: Boolean para mostrar/ocultar el toast
// - message: Mensaje del toast
// - type: Tipo de toast ('info', 'success', 'error', 'warning') (default: 'info')
// - duration: Duración en millisegundos (default: 3000)
// - onHide: Función al ocultarse automáticamente
export const ToastDialog = ({
    visible,
    message,
    type = "info",
    duration = 3000,
    onHide
}) => {
    // Hook para manejar el auto-ocultamiento del toast
    React.useEffect(() => {
        if (visible) {
            // Crear timer para ocultar automáticamente después de la duración especificada
            const timer = setTimeout(() => {
                onHide && onHide();
            }, duration);

            // Limpiar timer si el componente se desmonta o cambian las dependencias
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onHide]);

    // Función para obtener el color según el tipo de toast
    const getIconColor = () => {
        switch (type) {
            case 'success': return '#4CAF50'; // Verde para éxito
            case 'error': return '#F44336';   // Rojo para error
            case 'warning': return '#FF9800'; // Naranja para advertencia
            default: return '#2196F3';        // Azul para información
        }
    };

    // Función para obtener el icono según el tipo de toast
    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';  // Check mark
            case 'error': return '✕';    // X mark
            case 'warning': return '⚠';  // Warning symbol
            default: return 'ℹ';         // Info symbol
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onHide}
        >
            {/* Overlay para posicionamiento en la parte inferior */}
            <View style={styles.toastOverlay}>
                {/* Contenedor del toast con borde izquierdo colorido */}
                <View style={[styles.toastContainer, { borderLeftColor: getIconColor() }]}>
                    {/* Contenedor del icono */}
                    <View style={[styles.toastIconContainer, { backgroundColor: getIconColor() }]}>
                        <Text style={styles.toastIcon}>{getIcon()}</Text>
                    </View>
                    {/* Mensaje del toast */}
                    <Text style={styles.toastMessage}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Overlay principal - fondo semitransparente para centrar elementos
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // Contenedor principal de alertas y diálogos
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
        elevation: 8, // Sombra en Android
        maxWidth: 320,
        width: '100%',
    },
    // Contenedor circular del icono
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Texto del icono
    iconText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    // Título de la alerta
    alertTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 10,
    },
    // Mensaje de la alerta
    alertMessage: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    // Contenedor de botones - disposición horizontal
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    // Estilo base para botones
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Botón cancelar - estilo gris claro
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    // Botón confirmar - color dinámico
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    // Texto del botón cancelar
    cancelButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#666666',
    },
    // Texto del botón confirmar
    confirmButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF',
    },
    // Contenedor específico para diálogos de carga
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
    // Spinner de carga
    loadingSpinner: {
        marginBottom: 15,
    },
    // Título del diálogo de carga
    loadingTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 8,
    },
    // Mensaje del diálogo de carga
    loadingMessage: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    // Campo de entrada de texto
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
    // Overlay para toast - posicionamiento en la parte inferior
    toastOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    // Contenedor del toast con disposición horizontal
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
        borderLeftWidth: 4, // Borde izquierdo colorido
    },
    // Contenedor del icono del toast
    toastIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    // Icono del toast
    toastIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Mensaje del toast
    toastMessage: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        flex: 1, // Tomar el espacio restante
    },
});
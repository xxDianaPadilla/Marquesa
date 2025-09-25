import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Dimensions } from "react-native";

// Obtener dimensiones de la pantalla para responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints para responsive design
const BREAKPOINTS = {
    small: 320,    // iPhone SE, Galaxy S5
    medium: 375,   // iPhone X, 11, 12, 13
    large: 414,    // iPhone Plus, Max
    tablet: 768    // Tablets
};

// Función para obtener el factor de escala según el ancho de pantalla
const getScaleFactor = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return 0.85;
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return 0.95;
    if (SCREEN_WIDTH <= BREAKPOINTS.large) return 1;
    if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return 1.1;
    return 1.2; // Para pantallas muy grandes
};

// Función para obtener dimensiones responsive
const responsive = (size) => {
    return Math.round(size * getScaleFactor());
};

// Función para obtener el ancho máximo de los diálogos
const getMaxDialogWidth = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return SCREEN_WIDTH - responsive(32); // Menos padding
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return SCREEN_WIDTH - responsive(40);
    if (SCREEN_WIDTH <= BREAKPOINTS.large) return Math.min(responsive(320), SCREEN_WIDTH - responsive(40));
    if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return Math.min(responsive(400), SCREEN_WIDTH - responsive(60));
    return Math.min(responsive(450), SCREEN_WIDTH - responsive(80)); // Para pantallas muy grandes
};

// Función para obtener el padding horizontal según el tamaño de pantalla
const getDialogPadding = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return responsive(20);
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return responsive(25);
    return responsive(25);
};

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

    const dialogPadding = getDialogPadding();
    const maxDialogWidth = getMaxDialogWidth();

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
                <View style={[styles.alertContainer, { 
                    maxWidth: maxDialogWidth,
                    padding: dialogPadding 
                }]}>
                    {/* Contenedor del icono con color dinámico */}
                    <View style={[styles.iconContainer, { 
                        backgroundColor: getIconColor(),
                        width: responsive(60),
                        height: responsive(60),
                        borderRadius: responsive(30),
                        marginBottom: responsive(20)
                    }]}>
                        <Text style={[styles.iconText, { fontSize: responsive(24) }]}>{getIcon()}</Text>
                    </View>

                    {/* Título de la alerta */}
                    {title && <Text style={[styles.alertTitle, { 
                        fontSize: responsive(18),
                        marginBottom: responsive(10)
                    }]}>{title}</Text>}

                    {/* Mensaje de la alerta */}
                    {message && <Text style={[styles.alertMessage, { 
                        fontSize: responsive(14),
                        marginBottom: responsive(25),
                        lineHeight: responsive(20)
                    }]}>{message}</Text>}

                    {/* Contenedor de botones */}
                    <View style={[styles.buttonContainer, { gap: responsive(10) }]}>
                        {/* Botón cancelar - solo se muestra si showCancel es true */}
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, {
                                    paddingVertical: responsive(12),
                                    borderRadius: responsive(10)
                                }]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.cancelButtonText, { 
                                    fontSize: responsive(14) 
                                }]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Botón confirmar con color dinámico */}
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { 
                                backgroundColor: getIconColor(),
                                paddingVertical: responsive(12),
                                borderRadius: responsive(10)
                            }]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.confirmButtonText, { 
                                fontSize: responsive(14) 
                            }]}>{confirmText}</Text>
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
    message = "Por favor espera..",
    color = "#FF69B4"
}) => {
    const dialogPadding = getDialogPadding();
    const maxDialogWidth = Math.min(responsive(280), SCREEN_WIDTH - responsive(40));

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
                <View style={[styles.loadingContainer, { 
                    maxWidth: maxDialogWidth,
                    padding: dialogPadding 
                }]}>
                    {/* Contenedor del spinner con posición relativa para centrado */}
                    <View style={[styles.spinnerWrapper, { marginBottom: responsive(15) }]}>
                        {/* Spinner de carga */}
                        <ActivityIndicator size="large" color={color} />
                    </View>
                    {/* Título del diálogo de carga */}
                    <Text style={[styles.loadingTitle, { 
                        fontSize: responsive(16),
                        marginBottom: responsive(8)
                    }]}>{title}</Text>
                    {/* Mensaje del diálogo de carga */}
                    {message && <Text style={[styles.loadingMessage, { 
                        fontSize: responsive(12) 
                    }]}>{message}</Text>}
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
    const dialogPadding = getDialogPadding();
    const maxDialogWidth = getMaxDialogWidth();

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
                <View style={[styles.alertContainer, { 
                    maxWidth: maxDialogWidth,
                    padding: dialogPadding 
                }]}>
                    {/* Icono de pregunta con color dinámico según si es peligroso */}
                    <View style={[styles.iconContainer, { 
                        backgroundColor: isDangerous ? '#F44336' : '#FF9800',
                        width: responsive(60),
                        height: responsive(60),
                        borderRadius: responsive(30),
                        marginBottom: responsive(20)
                    }]}>
                        <Text style={[styles.iconText, { fontSize: responsive(24) }]}>?</Text>
                    </View>

                    {/* Título del diálogo */}
                    {title && <Text style={[styles.alertTitle, { 
                        fontSize: responsive(18),
                        marginBottom: responsive(10)
                    }]}>{title}</Text>}

                    {/* Mensaje del diálogo */}
                    {message && <Text style={[styles.alertMessage, { 
                        fontSize: responsive(14),
                        marginBottom: responsive(25),
                        lineHeight: responsive(20)
                    }]}>{message}</Text>}

                    {/* Contenedor de botones */}
                    <View style={[styles.buttonContainer, { gap: responsive(10) }]}>
                        {/* Botón cancelar */}
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, {
                                paddingVertical: responsive(12),
                                borderRadius: responsive(10)
                            }]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.cancelButtonText, { 
                                fontSize: responsive(14) 
                            }]}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Botón confirmar con color dinámico (rojo si es peligroso, verde si no) */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { 
                                    backgroundColor: isDangerous ? '#F44336' : '#4CAF50',
                                    paddingVertical: responsive(12),
                                    borderRadius: responsive(10)
                                }
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.confirmButtonText, { 
                                fontSize: responsive(14) 
                            }]}>{confirmText}</Text>
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
    const dialogPadding = getDialogPadding();
    const maxDialogWidth = getMaxDialogWidth();

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
                <View style={[styles.alertContainer, { 
                    maxWidth: maxDialogWidth,
                    padding: dialogPadding 
                }]}>
                    {/* Icono de lápiz/edición */}
                    <View style={[styles.iconContainer, { 
                        backgroundColor: '#2196F3',
                        width: responsive(60),
                        height: responsive(60),
                        borderRadius: responsive(30),
                        marginBottom: responsive(20)
                    }]}>
                        <Text style={[styles.iconText, { fontSize: responsive(24) }]}>✎</Text>
                    </View>

                    {/* Título del diálogo */}
                    {title && <Text style={[styles.alertTitle, { 
                        fontSize: responsive(18),
                        marginBottom: responsive(10)
                    }]}>{title}</Text>}

                    {/* Mensaje del diálogo */}
                    {message && <Text style={[styles.alertMessage, { 
                        fontSize: responsive(14),
                        marginBottom: responsive(20),
                        lineHeight: responsive(20)
                    }]}>{message}</Text>}

                    {/* Campo de entrada de texto */}
                    <TextInput
                        style={[styles.input, {
                            borderRadius: responsive(10),
                            paddingHorizontal: responsive(15),
                            paddingVertical: responsive(12),
                            fontSize: responsive(14),
                            marginBottom: responsive(20)
                        }]}
                        placeholder={placeholder}
                        value={value}
                        onChangeText={onChangeText}
                        keyboardType={keyboardType}
                        autoFocus={true} // Enfocar automáticamente al abrir
                    />

                    {/* Contenedor de botones */}
                    <View style={[styles.buttonContainer, { gap: responsive(10) }]}>
                        {/* Botón cancelar */}
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, {
                                paddingVertical: responsive(12),
                                borderRadius: responsive(10)
                            }]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.cancelButtonText, { 
                                fontSize: responsive(14) 
                            }]}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Botón confirmar */}
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton, { 
                                backgroundColor: '#2196F3',
                                paddingVertical: responsive(12),
                                borderRadius: responsive(10)
                            }]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.confirmButtonText, { 
                                fontSize: responsive(14) 
                            }]}>{confirmText}</Text>
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
                <View style={[styles.toastContainer, { 
                    borderLeftColor: getIconColor(),
                    borderRadius: responsive(10),
                    padding: responsive(15),
                    marginHorizontal: responsive(20),
                    marginBottom: responsive(50)
                }]}>
                    {/* Contenedor del icono */}
                    <View style={[styles.toastIconContainer, { 
                        backgroundColor: getIconColor(),
                        width: responsive(30),
                        height: responsive(30),
                        borderRadius: responsive(15),
                        marginRight: responsive(12)
                    }]}>
                        <Text style={[styles.toastIcon, { fontSize: responsive(16) }]}>{getIcon()}</Text>
                    </View>
                    {/* Mensaje del toast */}
                    <Text style={[styles.toastMessage, { 
                        fontSize: responsive(14) 
                    }]}>{message}</Text>
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
        paddingHorizontal: responsive(20),
    },
    // Contenedor principal de alertas y diálogos
    alertContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: responsive(20),
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8, // Sombra en Android
        width: '100%',
    },
    // Contenedor circular del icono
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        // Dimensiones aplicadas dinámicamente
    },
    // Texto del icono
    iconText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        // Tamaño aplicado dinámicamente
    },
    // Título de la alerta
    alertTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        // Tamaño y margen aplicados dinámicamente
    },
    // Mensaje de la alerta
    alertMessage: {
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        // Tamaño, margen y line height aplicados dinámicamente
    },
    // Contenedor de botones - disposición horizontal
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        // Gap aplicado dinámicamente
    },
    // Estilo base para botones
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // Padding y border radius aplicados dinámicamente
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
        fontFamily: 'Poppins-Medium',
        color: '#666666',
        // Tamaño aplicado dinámicamente
    },
    // Texto del botón confirmar
    confirmButtonText: {
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF',
        // Tamaño aplicado dinámicamente
    },
    // Contenedor específico para diálogos de carga
    loadingContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: responsive(20),
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        width: '100%',
        // Padding aplicado dinámicamente
    },
    // Contenedor del spinner para centrado perfecto
    spinnerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        // Margen aplicado dinámicamente
    },
    // Título del diálogo de carga
    loadingTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        // Tamaño y margen aplicados dinámicamente
    },
    // Mensaje del diálogo de carga
    loadingMessage: {
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
        // Tamaño aplicado dinámicamente
    },
    // Campo de entrada de texto
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        width: '100%',
        backgroundColor: '#F9F9F9',
        // Padding, border radius, tamaño y margen aplicados dinámicamente
    },
    // Overlay para toast - posicionamiento en la parte inferior
    toastOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    // Contenedor del toast con disposición horizontal
    toastContainer: {
        backgroundColor: '#FFFFFF',
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
        // Padding, border radius y márgenes aplicados dinámicamente
    },
    // Contenedor del icono del toast
    toastIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        // Dimensiones aplicadas dinámicamente
    },
    // Icono del toast
    toastIcon: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        // Tamaño aplicado dinámicamente
    },
    // Mensaje del toast
    toastMessage: {
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        flex: 1, // Tomar el espacio restante
        // Tamaño aplicado dinámicamente
    },
});

export default { CustomAlert, LoadingDialog, ConfirmationDialog, InputDialog, ToastDialog };
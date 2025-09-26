import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

// Obtener dimensiones de la pantalla para responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return SCREEN_WIDTH - responsive(32);
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return SCREEN_WIDTH - responsive(40);
    if (SCREEN_WIDTH <= BREAKPOINTS.large) return Math.min(responsive(320), SCREEN_WIDTH - responsive(40));
    if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return Math.min(responsive(400), SCREEN_WIDTH - responsive(60));
    return Math.min(responsive(450), SCREEN_WIDTH - responsive(80));
};

// Función para obtener el padding horizontal según el tamaño de pantalla
const getDialogPadding = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return responsive(20);
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return responsive(25);
    return responsive(25);
};

/**
 * Componente de diálogo para selección de imagen
 * Permite elegir entre cámara y galería con el estilo de la aplicación
 * 
 * Props:
 * - visible: Boolean para mostrar/ocultar el diálogo
 * - onCamera: Función al seleccionar cámara
 * - onGallery: Función al seleccionar galería
 * - onCancel: Función al cancelar
 * - title: Título del diálogo (default: "Seleccionar imagen")
 * - message: Mensaje del diálogo (default: "¿Cómo deseas seleccionar la imagen?")
 */
export const ImagePickerDialog = ({
    visible,
    onCamera,
    onGallery,
    onCancel,
    title = "Seleccionar imagen",
    message = "¿Cómo deseas seleccionar la imagen?"
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
                    {/* Contenedor del icono de imagen */}
                    <View style={[styles.iconContainer, {
                        backgroundColor: '#FDB4B7', // Color rosa de la app
                        width: responsive(60),
                        height: responsive(60),
                        borderRadius: responsive(30),
                        marginBottom: responsive(20)
                    }]}>
                        <Text style={[styles.iconText, { fontSize: responsive(24) }]}>📷</Text>
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

                    {/* Contenedor de botones principales (Cámara y Galería) */}
                    <View style={[styles.optionButtonContainer, { 
                        marginBottom: responsive(15),
                        gap: responsive(10)
                    }]}>
                        {/* Botón Cámara */}
                        <TouchableOpacity
                            style={[styles.optionButton, {
                                backgroundColor: '#FDB4B7',
                                paddingVertical: responsive(14),
                                borderRadius: responsive(12),
                                flex: 1
                            }]}
                            onPress={onCamera}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.optionButtonIcon, { 
                                fontSize: responsive(20),
                                marginBottom: responsive(5)
                            }]}>📸</Text>
                            <Text style={[styles.optionButtonText, { 
                                fontSize: responsive(14) 
                            }]}>Cámara</Text>
                        </TouchableOpacity>

                        {/* Botón Galería */}
                        <TouchableOpacity
                            style={[styles.optionButton, {
                                backgroundColor: '#E8ACD2',
                                paddingVertical: responsive(14),
                                borderRadius: responsive(12),
                                flex: 1
                            }]}
                            onPress={onGallery}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.optionButtonIcon, { 
                                fontSize: responsive(20),
                                marginBottom: responsive(5)
                            }]}>🖼️</Text>
                            <Text style={[styles.optionButtonText, { 
                                fontSize: responsive(14) 
                            }]}>Galería</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón cancelar */}
                    <TouchableOpacity
                        style={[styles.cancelButton, {
                            paddingVertical: responsive(12),
                            borderRadius: responsive(10),
                            width: '100%'
                        }]}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.cancelButtonText, { 
                            fontSize: responsive(14) 
                        }]}>Cancelar</Text>
                    </TouchableOpacity>
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
    // Contenedor principal del diálogo
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
    },
    // Texto del icono
    iconText: {
        fontWeight: 'bold',
    },
    // Título del diálogo
    alertTitle: {
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
    },
    // Mensaje del diálogo
    alertMessage: {
        fontFamily: 'Poppins-Regular',
        color: '#666666',
        textAlign: 'center',
    },
    // Contenedor de botones de opciones principales
    optionButtonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    // Estilo para botones de opciones (Cámara y Galería)
    optionButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Icono de los botones de opciones
    optionButtonIcon: {
        color: '#FFFFFF',
    },
    // Texto de los botones de opciones
    optionButtonText: {
        fontFamily: 'Poppins-SemiBold',
        color: '#FFFFFF',
    },
    // Botón cancelar
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Texto del botón cancelar
    cancelButtonText: {
        fontFamily: 'Poppins-Medium',
        color: '#666666',
    },
});

export default ImagePickerDialog;
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image
} from 'react-native';
import { useImagePicker } from '../hooks/useImagePicker';

// ✅ IMPORTAR ALERTAS PERSONALIZADAS
import { ConfirmationDialog, CustomAlert } from '../components/CustomDialogs';
import { useAlert } from '../hooks/useAlert';

// Importación de iconos
import attachImage from "../images/attachImage.png";
import sendIcon from "../images/sendIcon.png";

/**
 * Componente de input para el chat con alertas personalizadas
 * ✅ REEMPLAZA Alert NATIVO POR ALERTAS PERSONALIZADAS
 */
const ChatInput = ({ 
    onSendMessage, 
    onTyping, 
    onStopTyping, 
    disabled = false,
    isLoading = false,
    placeholder = "Mensaje...",
    onImageSelected
}) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const textInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ✅ Hook de alertas personalizadas
    const {
        alertState,
        showConfirmation,
        hideConfirmation,
        showAlert,
        hideAlert,
        showErrorToast,
        showWarningToast
    } = useAlert();

    // Hook para manejo de imágenes
    const {
        selectedImage,
        isLoading: imageLoading,
        showImagePicker,
        clearSelectedImage
    } = useImagePicker();

    /**
     * Maneja el cambio de texto en el input
     */
    const handleTextChange = (text) => {
        setMessage(text);
        handleTypingIndicator(text.length > 0);
    };

    /**
     * Maneja el indicador de escritura
     */
    const handleTypingIndicator = (typing) => {
        // Limpiar timeout anterior
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (typing && !isTyping) {
            setIsTyping(true);
            if (onTyping) onTyping();
        }

        if (typing) {
            // Auto-stop después de 2 segundos sin actividad
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                if (onStopTyping) onStopTyping();
            }, 2000);
        } else if (isTyping) {
            setIsTyping(false);
            if (onStopTyping) onStopTyping();
        }
    };

    /**
     * ✅ MANEJA LA SELECCIÓN DE IMAGEN CON ALERTA PERSONALIZADA
     */
    const handleImagePicker = () => {
        if (disabled || isLoading || imageLoading) return;

        // ✅ USAR CONFIRMACIÓN PERSONALIZADA EN LUGAR DE Alert.alert
        showConfirmation({
            title: 'Agregar archivo',
            message: '¿Cómo quieres seleccionar la imagen?',
            confirmText: 'Cámara',
            cancelText: 'Galería',
            isDangerous: false,
            onConfirm: () => {
                hideConfirmation();
                console.log('📷 Usuario seleccionó cámara');
                showImagePicker({ fromCamera: true });
            },
            onCancel: () => {
                hideConfirmation();
                console.log('📷 Usuario seleccionó galería');
                showImagePicker({ fromGallery: true });
            }
        });
    };

    /**
     * ✅ ENVÍA EL MENSAJE CON VALIDACIÓN Y ALERTAS PERSONALIZADAS
     */
    const handleSend = async () => {
        if (disabled || isLoading || imageLoading) return;

        const messageText = message.trim();
        const hasText = messageText.length > 0;
        const hasImage = selectedImage !== null;

        // ✅ VALIDACIÓN CON ALERTA PERSONALIZADA
        if (!hasText && !hasImage) {
            showAlert({
                title: 'Mensaje vacío',
                message: 'Escribe un mensaje o selecciona una imagen',
                type: 'warning',
                onConfirm: hideAlert
            });
            return;
        }

        try {
            // Detener indicador de escritura
            handleTypingIndicator(false);

            console.log('📤 Enviando mensaje:', {
                hasText,
                hasImage,
                imageSize: hasImage ? selectedImage.size : 0
            });

            // Guardar datos actuales antes de limpiar
            const currentMessage = messageText;
            const currentImage = selectedImage;
            
            // Limpiar input antes de enviar (UX optimista)
            setMessage('');
            clearSelectedImage();

            // Enviar mensaje
            if (onSendMessage) {
                const result = await onSendMessage(
                    hasText ? currentMessage : '', 
                    hasImage ? currentImage.uri : null
                );
                
                if (!result.success) {
                    // Si falla, restaurar el mensaje
                    setMessage(currentMessage);
                    
                    // ✅ MOSTRAR ERROR CON ALERTA PERSONALIZADA
                    showAlert({
                        title: 'Error al enviar',
                        message: result.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
                        type: 'error',
                        onConfirm: hideAlert
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            
            // ✅ MOSTRAR ERROR DE CONEXIÓN CON ALERTA PERSONALIZADA
            showAlert({
                title: 'Error de conexión',
                message: 'No se pudo enviar el mensaje. Verifica tu conexión e inténtalo de nuevo.',
                type: 'error',
                onConfirm: hideAlert
            });
        }
    };

    /**
     * Elimina la imagen seleccionada
     */
    const removeSelectedImage = () => {
        clearSelectedImage();
    };

    /**
     * Determina si el botón de envío debe estar habilitado
     */
    const canSend = () => {
        return !disabled && !isLoading && !imageLoading && (message.trim().length > 0 || selectedImage);
    };

    // Effect para limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Effect para debug completo de cambios de imagen
    useEffect(() => {
        console.log('📷 === CHATINPUT: CAMBIO EN selectedImage ===');
        
        if (selectedImage) {
            console.log('📷 NUEVA IMAGEN SELECCIONADA:', {
                uri: selectedImage.uri,
                name: selectedImage.name,
                size: `${(selectedImage.size / 1024 / 1024).toFixed(2)}MB`,
                type: selectedImage.type
            });
            
            if (onImageSelected) {
                console.log('📷 Llamando onImageSelected callback...');
                onImageSelected(selectedImage.uri);
            } else {
                console.log('📷 No hay callback onImageSelected');
            }
        } else {
            console.log('📷 selectedImage es null/undefined');
        }
    }, [selectedImage, onImageSelected]);

    // Effect para debug de estados del hook
    useEffect(() => {
        console.log('📷 === CHATINPUT: ESTADOS ACTUALIZADOS ===');
        console.log('📷 Hook states:', {
            hasSelectedImage: !!selectedImage,
            imageLoading,
            disabled,
            isLoading,
            canSend: canSend()
        });
    }, [selectedImage, imageLoading, disabled, isLoading]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Vista previa de imagen seleccionada */}
            {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                    <View style={styles.imagePreview}>
                        <Image 
                            source={{ uri: selectedImage.uri }} 
                            style={styles.previewImage}
                            resizeMode="cover"
                        />
                        <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={removeSelectedImage}
                        >
                            <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.imageInfo}>
                        {selectedImage.name} • {(selectedImage.size / 1024 / 1024).toFixed(1)}MB
                    </Text>
                </View>
            )}

            {/* Input principal */}
            <View style={styles.inputContainer}>
                {/* Botón de adjuntar */}
                <TouchableOpacity 
                    style={[
                        styles.attachButton,
                        (disabled || isLoading || imageLoading) && styles.buttonDisabled
                    ]}
                    onPress={handleImagePicker}
                    disabled={disabled || isLoading || imageLoading}
                >
                    {imageLoading ? (
                        <ActivityIndicator size="small" color="#666" />
                    ) : (
                        <Image source={attachImage} style={styles.attachIcon} />
                    )}
                </TouchableOpacity>

                {/* Campo de texto */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={textInputRef}
                        style={[
                            styles.textInput,
                            disabled && styles.inputDisabled
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={1000}
                        editable={!disabled && !isLoading && !imageLoading}
                        onSubmitEditing={handleSend}
                        blurOnSubmit={false}
                        returnKeyType="send"
                    />
                </View>

                {/* Botón de envío */}
                <TouchableOpacity 
                    style={[
                        styles.sendButton,
                        canSend() ? styles.sendButtonActive : styles.sendButtonInactive
                    ]}
                    onPress={handleSend}
                    disabled={!canSend()}
                >
                    {(isLoading || imageLoading) ? (
                        <ActivityIndicator 
                            size="small" 
                            color="#FFFFFF" 
                        />
                    ) : (
                        <Image 
                            source={sendIcon} 
                            style={[
                                styles.sendIcon,
                                canSend() && styles.sendIconActive
                            ]} 
                        />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },

    // Vista previa de imagen
    imagePreviewContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#F8F8F8',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
    },
    imagePreview: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF3B30',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    imageInfo: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },

    // Input container
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        minHeight: 60,
    },

    // Botón adjuntar
    attachButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    attachIcon: {
        width: 24,
        height: 24,
        tintColor: '#666',
    },

    // Input wrapper
    inputWrapper: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        minHeight: 40,
        maxHeight: 100,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-Regular',
        textAlignVertical: 'center',
        includeFontPadding: false,
        paddingTop: 0,
        paddingBottom: 0,
    },
    inputDisabled: {
        backgroundColor: '#EEEEEE',
        color: '#999',
    },

    // Botón envío
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#CCCCCC',
    },
    sendButtonActive: {
        backgroundColor: '#F8BBD9',
    },
    sendButtonInactive: {
        backgroundColor: '#CCCCCC',
    },
    sendIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
    },
    sendIconActive: {
        tintColor: '#FFFFFF',
    },

    // Estados deshabilitados
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default ChatInput;
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { useImagePicker } from '../hooks/useImagePicker';

// IMPORTAR ALERTAS PERSONALIZADAS
import { ConfirmationDialog, CustomAlert } from '../components/CustomDialogs';
import { ImagePickerDialog } from '../components/ImagePickerDialog';
import { useAlert } from '../hooks/useAlert';

// Importación de iconos
import attachImage from "../images/attachImage.png";
import sendIcon from "../images/sendIcon.png";

// IMPORTAR SISTEMA RESPONSIVE
import {
    responsive,
    getHorizontalPadding,
    getChatInputConfig,
    getImagePreviewDimensions,
    getImagePreviewContainerHeight
} from '../utils/ResponsiveHelper';

/**
 * Componente de input para el chat
 * SIN KeyboardAvoidingView - Compatible con detección dinámica de teclado
 * Optimizado para Android con sistema responsive
 */
const ChatInput = ({
    onSendMessage,
    onTyping,
    onStopTyping,
    disabled = false,
    isLoading = false,
    placeholder = "Mensaje...",
    onImageSelected,
    onImageSelectionChange
}) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    const textInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Hook de alertas personalizadas
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
        showImagePicker: showImagePickerHook,
        clearSelectedImage
    } = useImagePicker();

    // Notificar cambios en la selección de imagen
    useEffect(() => {
        if (onImageSelectionChange) {
            onImageSelectionChange(!!selectedImage);
        }
    }, [selectedImage, onImageSelectionChange]);

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
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (typing && !isTyping) {
            setIsTyping(true);
            if (onTyping) onTyping();
        }

        if (typing) {
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
     * Maneja la selección de imagen
     */
    const handleImagePicker = () => {
        if (disabled || isLoading || imageLoading) {
            return;
        }

        setShowImagePicker(true);
    };

    const hideImagePickerOptions = () => {
        setShowImagePicker(false);
    };

    const openCamera = () => {
        hideImagePickerOptions();
        showImagePickerHook({ fromCamera: true });
    };

    const openGallery = () => {
        hideImagePickerOptions();
        showImagePickerHook({ fromGallery: true });
    };

    /**
     * Envía el mensaje
     */
    const handleSend = async () => {
        if (disabled || isLoading || imageLoading) return;

        const messageText = message.trim();
        const hasText = messageText.length > 0;
        const hasImage = selectedImage !== null;

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
            handleTypingIndicator(false);

            const currentMessage = messageText;
            const currentImage = selectedImage;

            // Limpiar input (UX optimista)
            setMessage('');
            clearSelectedImage();

            if (onSendMessage) {
                const result = await onSendMessage(
                    hasText ? currentMessage : '',
                    hasImage ? currentImage.uri : null
                );

                if (!result.success) {
                    // Restaurar mensaje si falla
                    setMessage(currentMessage);
                    showAlert({
                        title: 'Error al enviar',
                        message: result.message || 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
                        type: 'error',
                        onConfirm: hideAlert
                    });
                }
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
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

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Debug de imagen
    useEffect(() => {
        if (selectedImage) {
            console.log('Nueva imagen seleccionada:', {
                uri: selectedImage.uri,
                name: selectedImage.name,
                size: `${(selectedImage.size / 1024 / 1024).toFixed(2)}MB`
            });

            if (onImageSelected) {
                onImageSelected(selectedImage.uri);
            }
        }
    }, [selectedImage, onImageSelected]);

    // Obtener configuración responsive
    const inputConfig = getChatInputConfig();
    const previewDimensions = getImagePreviewDimensions();
    const horizontalPadding = getHorizontalPadding();

    return (
        <View style={styles.container}>
            {/* Vista previa de imagen */}
            {selectedImage && (
                <View style={[styles.imagePreviewContainer, { 
                    paddingHorizontal: horizontalPadding,
                    paddingTop: responsive(12),
                    paddingBottom: responsive(8)
                }]}>
                    <View style={styles.imagePreview}>
                        <Image
                            source={{ uri: selectedImage.uri }}
                            style={[styles.previewImage, {
                                width: previewDimensions.width,
                                height: previewDimensions.height,
                                borderRadius: responsive(8)
                            }]}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            style={[styles.removeImageButton, {
                                width: responsive(24),
                                height: responsive(24),
                                borderRadius: responsive(12),
                                top: responsive(-8),
                                right: responsive(-8)
                            }]}
                            onPress={removeSelectedImage}
                        >
                            <Text style={[styles.removeImageText, { 
                                fontSize: responsive(14) 
                            }]}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.imageInfo, { 
                        fontSize: responsive(12),
                        marginTop: responsive(4)
                    }]}>
                        {selectedImage.name} • {(selectedImage.size / 1024 / 1024).toFixed(1)}MB
                    </Text>
                </View>
            )}

            {/* Input principal */}
            <View style={[styles.inputContainer, { 
                paddingHorizontal: horizontalPadding,
                paddingVertical: responsive(12),
                minHeight: responsive(60)
            }]}>
                {/* Botón adjuntar */}
                <TouchableOpacity
                    style={[
                        styles.attachButton,
                        {
                            width: inputConfig.buttonSize,
                            height: inputConfig.buttonSize,
                            borderRadius: responsive(20),
                            padding: responsive(8),
                            marginRight: responsive(8)
                        },
                        (disabled || isLoading || imageLoading) && styles.buttonDisabled
                    ]}
                    onPress={handleImagePicker}
                    disabled={disabled || isLoading || imageLoading}
                >
                    {imageLoading ? (
                        <ActivityIndicator size="small" color="#666" />
                    ) : (
                        <Image source={attachImage} style={[styles.attachIcon, {
                            width: responsive(24),
                            height: responsive(24)
                        }]} />
                    )}
                </TouchableOpacity>

                {/* Campo de texto */}
                <View style={[styles.inputWrapper, {
                    borderRadius: responsive(20),
                    paddingHorizontal: responsive(16),
                    paddingVertical: responsive(10),
                    marginRight: responsive(8),
                    minHeight: responsive(40),
                    maxHeight: responsive(100)
                }]}>
                    <TextInput
                        ref={textInputRef}
                        style={[
                            styles.textInput,
                            { fontSize: responsive(16) },
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
                        textAlignVertical="center"
                        underlineColorAndroid="transparent"
                        autoCorrect={true}
                        autoCapitalize="sentences"
                    />
                </View>

                {/* Botón envío */}
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            width: inputConfig.buttonSize,
                            height: inputConfig.buttonSize,
                            borderRadius: responsive(20)
                        },
                        canSend() ? styles.sendButtonActive : styles.sendButtonInactive
                    ]}
                    onPress={handleSend}
                    disabled={!canSend()}
                    activeOpacity={0.7}
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
                                {
                                    width: responsive(20),
                                    height: responsive(20)
                                },
                                canSend() && styles.sendIconActive
                            ]}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Diálogo personalizado de selección de imagen */}
            <ImagePickerDialog
                visible={showImagePicker}
                onCamera={openCamera}
                onGallery={openGallery}
                onCancel={hideImagePickerOptions}
            />
        </View>
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
        backgroundColor: '#F8F8F8',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
    },
    imagePreview: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    previewImage: {
        // Dimensiones aplicadas dinámicamente
    },
    removeImageButton: {
        position: 'absolute',
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    removeImageText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    imageInfo: {
        color: '#666666',
        fontFamily: 'Poppins-Regular',
    },

    // Input container
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
    },

    // Botón adjuntar
    attachButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachIcon: {
        tintColor: '#666',
    },

    // Input wrapper
    inputWrapper: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
    },
    textInput: {
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
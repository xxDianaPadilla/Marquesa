import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    Platform,
    Dimensions,
    KeyboardAvoidingView,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Importar los componentes de alertas personalizadas y el hook
import { CustomAlert, ConfirmationDialog, ToastDialog } from '../components/CustomAlerts';
import { useAlert } from '../hooks/useAlert';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Componente Modal para formulario de tarjeta
const CardFormModal = ({
    visible,
    onClose,
    cardData,
    handleCardDataChange,
    handleCardPayment,
    isSubmitting,
    formatCardNumber,
    formatExpiryDate,
    errors
}) => (
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardView}
            >
                <View style={styles.cardModalContent}>
                    <View style={styles.cardModalHeader}>
                        <Text style={styles.cardModalTitle}>Datos de la tarjeta</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.cardModalBody}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Número de tarjeta */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Número de la tarjeta *</Text>
                            <TextInput
                                style={[styles.textInput, errors.cardNumber && styles.inputError]}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor="#999"
                                value={cardData.cardNumber}
                                onChangeText={(value) => handleCardDataChange('cardNumber', formatCardNumber(value))}
                                maxLength={19}
                                keyboardType="numeric"
                                returnKeyType="next"
                            />
                            {errors.cardNumber && (
                                <Text style={styles.errorText}>{errors.cardNumber}</Text>
                            )}
                        </View>

                        {/* Nombre del titular */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nombre del titular *</Text>
                            <TextInput
                                style={[styles.textInput, errors.cardName && styles.inputError]}
                                placeholder="Nombre completo"
                                placeholderTextColor="#999"
                                value={cardData.cardName}
                                onChangeText={(value) => {
                                    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                    handleCardDataChange('cardName', cleanValue.slice(0, 50));
                                }}
                                maxLength={50}
                                returnKeyType="next"
                            />
                            {errors.cardName && (
                                <Text style={styles.errorText}>{errors.cardName}</Text>
                            )}
                        </View>

                        {/* Fecha y CVV */}
                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>Expiración*</Text>
                                <TextInput
                                    style={[styles.textInput, errors.expiryDate && styles.inputError]}
                                    placeholder="MM/YY"
                                    placeholderTextColor="#999"
                                    value={cardData.expiryDate}
                                    onChangeText={(value) => handleCardDataChange('expiryDate', formatExpiryDate(value))}
                                    maxLength={5}
                                    keyboardType="numeric"
                                    returnKeyType="next"
                                />
                                {errors.expiryDate && (
                                    <Text style={styles.errorText}>{errors.expiryDate}</Text>
                                )}
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.inputLabel}>CVV *</Text>
                                <TextInput
                                    style={[styles.textInput, errors.cvv && styles.inputError]}
                                    placeholder="123"
                                    placeholderTextColor="#999"
                                    value={cardData.cvv}
                                    onChangeText={(value) => {
                                        const cleanValue = value.replace(/\D/g, '');
                                        handleCardDataChange('cvv', cleanValue.slice(0, 3));
                                    }}
                                    maxLength={3}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    secureTextEntry={true}
                                />
                                {errors.cvv && (
                                    <Text style={styles.errorText}>{errors.cvv}</Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.cardModalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.continueButton, isSubmitting && styles.buttonDisabled]}
                            onPress={handleCardPayment}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.loadingText}>Procesando...</Text>
                                </View>
                            ) : (
                                <Text style={styles.continueButtonText}>Continuar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    </Modal>
);

// Componente Modal para transferencia bancaria
const BankTransferModal = ({ visible, onClose, onConfirm }) => (
    <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.bankModalContent}>
                <Text style={styles.bankModalTitle}>Simulación de Pago por Transferencia</Text>

                <Text style={styles.bankModalText}>
                    Por el momento, esta sección es una <Text style={styles.boldText}>simulación</Text> de lo que será la redirección a la plataforma de pagos Wompi.
                </Text>

                <Text style={styles.bankModalText}>
                    En la versión final, aquí podremos completar el pago de forma segura a través de Wompi sin necesidad de ver o manejar la información bancaria directamente.
                </Text>

                <View style={styles.bankModalButtons}>
                    <TouchableOpacity style={styles.bankCloseButton} onPress={onClose}>
                        <Text style={styles.bankCloseButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bankConfirmButton} onPress={onConfirm}>
                        <Text style={styles.bankConfirmButtonText}>Entendido</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const PaymentMethodStep = ({
    onNext,
    onBack,
    onPaymentInfoUpdate,
    initialData = {}
}) => {
    const [formData, setFormData] = useState({
        paymentType: initialData.paymentType || '',
        paymentProofImage: initialData.paymentProofImage || null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Estados para modales y formularios
    const [showBankTransferModal, setShowBankTransferModal] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showProofUpload, setShowProofUpload] = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [cardErrors, setCardErrors] = useState({});

    // Referencias para manejar los timeouts de los toasts
    const toastTimeoutRef = useRef(null);

    // Hook para manejar las alertas personalizadas
    const {
        alertState,
        showError,
        showSuccess,
        showConfirmation,
        hideConfirmation,
        showSuccessToast,
        showErrorToast,
        hideToast
    } = useAlert();

    // Función helper para mostrar toast con auto-hide
    const showToastWithAutoHide = useCallback((toastFunction, message, duration = 3000) => {
        // Limpiar timeout anterior si existe
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        // Mostrar el toast
        toastFunction(message);

        // Configurar timeout para ocultar el toast
        toastTimeoutRef.current = setTimeout(() => {
            hideToast();
        }, duration);
    }, [hideToast]);

    // Funciones específicas para cada tipo de toast con auto-hide
    const showSuccessToastWithHide = useCallback((message, duration = 3000) => {
        showToastWithAutoHide(showSuccessToast, message, duration);
    }, [showToastWithAutoHide, showSuccessToast]);

    const showErrorToastWithHide = useCallback((message, duration = 3000) => {
        showToastWithAutoHide(showErrorToast, message, duration);
    }, [showToastWithAutoHide, showErrorToast]);

    // Limpiar timeout al desmontar el componente
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    // Opciones de pago disponibles
    const paymentOptions = [
        {
            value: 'Transferencia',
            label: 'Transferencia bancaria',
            description: 'Transfiere a nuestra cuenta bancaria',
            icon: 'account-balance'
        },
        {
            value: 'Débito',
            label: 'Tarjeta de débito',
            description: 'Pago con tarjeta de débito',
            icon: 'payment'
        },
        {
            value: 'Crédito',
            label: 'Tarjeta de crédito',
            description: 'Pago con tarjeta de crédito',
            icon: 'credit-card'
        }
    ];

    // Función para procesar el archivo seleccionado
    const processSelectedFile = (file) => {
        console.log('Archivo seleccionado:', file);

        // Validar tamaño si está disponible
        if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
            showError('El archivo no debe exceder 5MB');
            return;
        }

        // Crear objeto compatible con FormData de React Native
        const processedFile = {
            uri: file.uri,
            type: file.mimeType || file.type || 'image/jpeg',
            name: file.fileName || file.name || `payment_proof_${Date.now()}.jpg`
        };

        console.log('Archivo procesado para FormData:', processedFile);

        setFormData(prev => ({
            ...prev,
            paymentProofImage: processedFile
        }));

        // Crear preview si es imagen
        if (file.uri && (file.mimeType || file.type || '').startsWith('image/')) {
            setPreviewImage(file.uri);
        } else {
            setPreviewImage(null);
        }

        if (errors.paymentProofImage) {
            setErrors(prev => ({
                ...prev,
                paymentProofImage: undefined
            }));
        }

        // Usar la función con auto-hide
        showSuccessToastWithHide('Archivo cargado correctamente');
    };

    // Manejar cambio en tipo de pago
    const handlePaymentTypeChange = (paymentType) => {
        setFormData(prev => ({
            ...prev,
            paymentType: paymentType
        }));

        // Limpiar errores
        if (errors.paymentType) {
            setErrors(prev => ({
                ...prev,
                paymentType: undefined
            }));
        }

        // Resetear estado de comprobante cuando cambie el método de pago
        setShowProofUpload(false);
        setFormData(prev => ({
            ...prev,
            paymentProofImage: null
        }));
        setPreviewImage(null);

        // Limpiar datos y errores de tarjeta cuando cambie el método
        setCardData({
            cardNumber: '',
            cardName: '',
            expiryDate: '',
            cvv: ''
        });
        setCardErrors({});

        // Manejar lógica específica por tipo de pago
        if (paymentType === 'Transferencia') {
            setShowBankTransferModal(true);
        } else if (paymentType === 'Débito' || paymentType === 'Crédito') {
            setShowCardForm(true);
        }
    };

    // Usar useCallback para evitar recrear las funciones
    const handleCardDataChange = useCallback((field, value) => {
        setCardData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (cardErrors[field]) {
            setCardErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [cardErrors]);

    // Formatear número de tarjeta
    const formatCardNumber = useCallback((value) => {
        const numbers = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = numbers.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return numbers;
        }
    }, []);

    // Formatear fecha de expiración
    const formatExpiryDate = useCallback((value) => {
        const numbers = value.replace(/\D/g, '');
        const truncated = numbers.slice(0, 4);

        if (truncated.length >= 3) {
            return `${truncated.slice(0, 2)}/${truncated.slice(2)}`;
        }

        return truncated;
    }, []);

    // Validar datos de tarjeta
    const validateCardData = () => {
        const newErrors = {};

        // Validar número de tarjeta
        const cardNumberDigits = cardData.cardNumber.replace(/\s/g, '');
        if (!cardNumberDigits) {
            newErrors.cardNumber = 'El número de tarjeta es requerido';
        } else if (cardNumberDigits.length !== 16) {
            newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
        } else if (!/^\d+$/.test(cardNumberDigits)) {
            newErrors.cardNumber = 'El número de tarjeta solo puede contener números';
        }

        // Validar nombre del titular
        if (!cardData.cardName.trim()) {
            newErrors.cardName = 'El nombre del titular es requerido';
        } else if (cardData.cardName.trim().length < 5) {
            newErrors.cardName = 'El nombre debe tener al menos 5 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cardData.cardName.trim())) {
            newErrors.cardName = 'El nombre solo puede contener letras y espacios';
        }

        // Validar fecha de expiración
        if (!cardData.expiryDate) {
            newErrors.expiryDate = 'La fecha de expiración es requerida';
        } else if (cardData.expiryDate.length !== 5) {
            newErrors.expiryDate = 'Formato de fecha inválido (MM/YY)';
        } else {
            const [month, year] = cardData.expiryDate.split('/');
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(`20${year}`, 10);

            if (monthNum < 1 || monthNum > 12) {
                newErrors.expiryDate = 'Mes inválido (01-12)';
            } else {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;

                if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                    newErrors.expiryDate = 'La tarjeta ha expirado';
                }
            }
        }

        // Validar CVV
        if (!cardData.cvv) {
            newErrors.cvv = 'El CVV es requerido';
        } else if (cardData.cvv.length !== 3) {
            newErrors.cvv = 'El CVV debe tener 3 dígitos';
        } else if (!/^\d{3}$/.test(cardData.cvv)) {
            newErrors.cvv = 'El CVV solo puede contener números';
        }

        return newErrors;
    };

    // Procesar pago con tarjeta
    const handleCardPayment = useCallback(() => {
        const validationErrors = validateCardData();

        if (Object.keys(validationErrors).length > 0) {
            setCardErrors(validationErrors);
            showError('Por favor, completa correctamente todos los campos de la tarjeta', 'Error de validación');
            return;
        }

        setCardErrors({});
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setShowCardForm(false);

            setFormData(prev => ({
                ...prev,
                cardProcessed: true
            }));

            showSuccess('Pago con tarjeta procesado correctamente');
        }, 2000);
    }, [cardData, showError, showSuccess]);

    // Confirmar transferencia bancaria
    const handleBankTransferConfirm = useCallback(() => {
        setShowBankTransferModal(false);
        setShowProofUpload(true);
    }, []);

    // Seleccionar archivo (imagen o documento)
    const handleSelectFile = async () => {
        showConfirmation({
            title: 'Seleccionar comprobante',
            message: 'Elige el tipo de archivo que deseas subir',
            confirmText: 'Galería',
            cancelText: 'Cancelar',
            onConfirm: () => {
                hideConfirmation();
                // Mostrar opciones secundarias
                setTimeout(() => {
                    showConfirmation({
                        title: 'Tipo de archivo',
                        message: '¿Qué tipo de archivo quieres seleccionar?',
                        confirmText: 'Imagen',
                        cancelText: 'Documento',
                        onConfirm: () => {
                            hideConfirmation();
                            openImagePicker();
                        },
                        onCancel: () => {
                            hideConfirmation();
                            openDocumentPicker();
                        }
                    });
                }, 100);
            }
        });
    };

    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            showError('Se necesita permiso para acceder a la cámara', 'Permiso requerido');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            processSelectedFile(result.assets[0]);
        }
    };

    const openImagePicker = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showError('Se necesita permiso para acceder a la galería', 'Permiso requerido');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets[0]) {
            processSelectedFile(result.assets[0]);
        }
    };

    const openDocumentPicker = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
            copyToCacheDirectory: true,
        });

        if (result.type === 'success') {
            processSelectedFile(result);
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.paymentType) {
            newErrors.paymentType = 'Selecciona un método de pago';
        }

        if (formData.paymentType === 'Transferencia') {
            if (!formData.paymentProofImage) {
                newErrors.paymentProofImage = 'El comprobante de pago es requerido para transferencias bancarias';
            }
        }

        return newErrors;
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            showError('Por favor, completa todos los campos requeridos');
            return;
        }

        setIsSubmitting(true);

        try {
            // Preparar datos de pago con formato correcto para FormData
            const paymentData = {
                paymentType: formData.paymentType,
                paymentProofImage: formData.paymentType === 'Transferencia' && formData.paymentProofImage
                    ? formData.paymentProofImage
                    : null
            };

            console.log('Datos de pago a enviar:', {
                paymentType: paymentData.paymentType,
                hasImage: !!paymentData.paymentProofImage,
                imageInfo: paymentData.paymentProofImage ? {
                    uri: paymentData.paymentProofImage.uri,
                    type: paymentData.paymentProofImage.type,
                    name: paymentData.paymentProofImage.name
                } : null
            });

            await onPaymentInfoUpdate(paymentData);
            showSuccess('Información de pago guardada correctamente');
            onNext();
        } catch (error) {
            console.error('Error al procesar información de pago:', error);
            setErrors({ general: 'Error al procesar la información. Inténtalo nuevamente.' });
            showError('Error al procesar la información. Inténtalo nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Método de pago</Text>

                {/* Error general */}
                {errors.general && (
                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={20} color="#e74c3c" />
                        <Text style={styles.errorMessage}>{errors.general}</Text>
                    </View>
                )}

                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Selección de método de pago */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Selecciona tu método de pago *</Text>

                        <View style={styles.paymentOptions}>
                            {paymentOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.paymentOption,
                                        formData.paymentType === option.value && styles.paymentOptionSelected
                                    ]}
                                    onPress={() => handlePaymentTypeChange(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.paymentOptionContent}>
                                        <View style={styles.paymentOptionLeft}>
                                            <View style={[
                                                styles.radioButton,
                                                formData.paymentType === option.value && styles.radioButtonSelected
                                            ]}>
                                                {formData.paymentType === option.value && (
                                                    <View style={styles.radioButtonInner} />
                                                )}
                                            </View>
                                            <View style={styles.paymentOptionText}>
                                                <Text style={styles.paymentOptionLabel}>{option.label}</Text>
                                                <Text style={styles.paymentOptionDescription}>{option.description}</Text>
                                            </View>
                                        </View>
                                        <Icon name={option.icon} size={24} color="#666" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {errors.paymentType && (
                            <Text style={styles.fieldErrorText}>{errors.paymentType}</Text>
                        )}
                    </View>

                    {/* Subir comprobante de pago - Solo para transferencia bancaria */}
                    {formData.paymentType === 'Transferencia' && showProofUpload && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Comprobante de pago *</Text>

                            <TouchableOpacity
                                style={styles.fileUploadArea}
                                onPress={handleSelectFile}
                                activeOpacity={0.7}
                            >
                                <Icon name="cloud-upload" size={48} color="#666" />
                                <Text style={styles.fileUploadTitle}>
                                    {formData.paymentProofImage ? formData.paymentProofImage.name || 'Archivo seleccionado' : 'Subir comprobante'}
                                </Text>
                                <Text style={styles.fileUploadSubtitle}>
                                    PNG, JPG, WEBP o PDF hasta 5MB
                                </Text>
                            </TouchableOpacity>

                            {errors.paymentProofImage && (
                                <Text style={styles.fieldErrorText}>{errors.paymentProofImage}</Text>
                            )}
                        </View>
                    )}

                    {/* Preview de imagen */}
                    {previewImage && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Vista previa:</Text>
                            <View style={styles.previewContainer}>
                                <Image
                                    source={{ uri: previewImage }}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Botones de navegación */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.nextButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.loadingText}>Procesando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.nextButtonText}>Revisar pedido</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Modales */}
                <BankTransferModal
                    visible={showBankTransferModal}
                    onClose={() => setShowBankTransferModal(false)}
                    onConfirm={handleBankTransferConfirm}
                />

                <CardFormModal
                    visible={showCardForm}
                    onClose={() => setShowCardForm(false)}
                    cardData={cardData}
                    handleCardDataChange={handleCardDataChange}
                    handleCardPayment={handleCardPayment}
                    isSubmitting={isSubmitting}
                    formatCardNumber={formatCardNumber}
                    formatExpiryDate={formatExpiryDate}
                    errors={cardErrors}
                />

                {/* Componentes de alertas personalizadas */}
                <CustomAlert
                    visible={alertState.basicAlert.visible}
                    title={alertState.basicAlert.title}
                    message={alertState.basicAlert.message}
                    type={alertState.basicAlert.type}
                    onConfirm={alertState.basicAlert.onConfirm}
                    onCancel={alertState.basicAlert.onCancel}
                    confirmText={alertState.basicAlert.confirmText}
                    cancelText={alertState.basicAlert.cancelText}
                    showCancel={alertState.basicAlert.showCancel}
                />

                <ConfirmationDialog
                    visible={alertState.confirmation.visible}
                    title={alertState.confirmation.title}
                    message={alertState.confirmation.message}
                    onConfirm={alertState.confirmation.onConfirm}
                    onCancel={alertState.confirmation.onCancel}
                    confirmText={alertState.confirmation.confirmText}
                    cancelText={alertState.confirmation.cancelText}
                    isDangerous={alertState.confirmation.isDangerous}
                />

                <ToastDialog
                    visible={alertState.toast.visible}
                    message={alertState.toast.message}
                    type={alertState.toast.type}
                    duration={alertState.toast.duration}
                    onHide={hideToast}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c',
    },
    errorMessage: {
        flex: 1,
        fontSize: 14,
        color: '#e74c3c',
        marginLeft: 8,
        fontFamily: 'Poppins-Regular',
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 12,
        fontFamily: 'Poppins-Medium',
    },
    paymentOptions: {
        gap: 12,
    },
    paymentOption: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    paymentOptionSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    paymentOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: '#3b82f6',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3b82f6',
    },
    paymentOptionText: {
        flex: 1,
    },
    paymentOptionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
        fontFamily: 'Poppins-Medium',
    },
    paymentOptionDescription: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    fieldErrorText: {
        fontSize: 12,
        color: '#e74c3c',
        marginTop: 8,
        fontFamily: 'Poppins-Regular',
    },
    fileUploadArea: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    fileUploadTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginTop: 12,
        marginBottom: 4,
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
    },
    fileUploadSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    previewContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    backButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        minHeight: 48,
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'Poppins-SemiBold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalKeyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },

    // Card Modal Styles
    cardModalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    cardModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    closeButton: {
        padding: 4,
    },
    cardModalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        maxHeight: SCREEN_HEIGHT * 0.5,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        fontFamily: 'Poppins-Medium',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        backgroundColor: '#fff',
        color: '#000000'
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    rowInputs: {
        flexDirection: 'row',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },
    cardModalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    continueButton: {
        flex: 2,
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },

    // Bank Transfer Modal Styles
    bankModalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 350,
        alignItems: 'center',
    },
    bankModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
    },
    bankModalText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'justify',
        marginBottom: 12,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    boldText: {
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    bankModalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        width: '100%',
    },
    bankCloseButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    bankCloseButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    bankConfirmButton: {
        flex: 1,
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    bankConfirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default PaymentMethodStep;
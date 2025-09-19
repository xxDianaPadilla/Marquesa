import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    Keyboard,
    Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ShippingInfoMobile = ({
    onNext,
    onShippingInfoUpdate,
    initialData = {}
}) => {
    // Obtener información del usuario desde el contexto
    const { userInfo } = useAuth();

    // Estado del formulario
    const [formData, setFormData] = useState({
        receiverName: initialData.receiverName || '',
        receiverPhone: initialData.receiverPhone || '',
        deliveryAddress: initialData.deliveryAddress || '',
        deliveryPoint: initialData.deliveryPoint || '',
        deliveryDate: initialData.deliveryDate || null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // NUEVO: Estados para manejar el teclado
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const formatDateToLocalISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // NUEVO: Effect para manejar eventos del teclado
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    // Autocompletar información del usuario al cargar o cuando cambie userInfo
    useEffect(() => {
        if (userInfo && !initialData.receiverName) {
            // Usar el nombre completo (fullName) o el nombre (name) según esté disponible
            const userName = userInfo.fullName || userInfo.name || '';
            if (userName) {
                setFormData(prev => ({
                    ...prev,
                    receiverName: userName
                }));
            }
        }
    }, [userInfo, initialData.receiverName]);

    // Función para formatear el teléfono automáticamente
    const formatPhoneNumber = (value) => {
        // Remover todo excepto números
        const numbers = value.replace(/\D/g, '');

        // Limitar a 8 dígitos
        const truncated = numbers.slice(0, 8);

        // Formatear como ####-####
        if (truncated.length >= 5) {
            return `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
        }

        return truncated;
    };

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre del receptor (mínimo 12 caracteres, solo letras y espacios)
        if (!formData.receiverName || formData.receiverName.trim().length < 12) {
            newErrors.receiverName = 'El nombre debe tener al menos 12 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.receiverName.trim())) {
            newErrors.receiverName = 'El nombre solo puede contener letras y espacios';
        }

        // Validar teléfono (exactamente formato ####-####)
        const phoneRegex = /^\d{4}-\d{4}$/;
        if (!formData.receiverPhone || !phoneRegex.test(formData.receiverPhone)) {
            newErrors.receiverPhone = 'El teléfono debe tener el formato ####-####';
        }

        // Validar dirección (mínimo 20 caracteres, máximo 200)
        if (!formData.deliveryAddress || formData.deliveryAddress.trim().length < 20) {
            newErrors.deliveryAddress = 'La dirección debe tener al menos 20 caracteres';
        } else if (formData.deliveryAddress.trim().length > 200) {
            newErrors.deliveryAddress = 'La dirección no puede exceder 200 caracteres';
        }

        // Validar punto de referencia (mínimo 20 caracteres, máximo 200)
        if (!formData.deliveryPoint || formData.deliveryPoint.trim().length < 20) {
            newErrors.deliveryPoint = 'El punto de referencia debe tener al menos 20 caracteres';
        } else if (formData.deliveryPoint.trim().length > 200) {
            newErrors.deliveryPoint = 'El punto de referencia no puede exceder 200 caracteres';
        }

        // Validar fecha de entrega
        if (!formData.deliveryDate) {
            newErrors.deliveryDate = 'La fecha de entrega es requerida';
        } else {
            const selectedDate = new Date(formData.deliveryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.deliveryDate = 'La fecha de entrega no puede ser anterior a hoy';
            }
        }

        return newErrors;
    };

    // Manejar cambios en los inputs
    const handleInputChange = (name, value) => {
        let processedValue = value;

        // Procesar según el tipo de campo
        if (name === 'receiverName') {
            // Solo permitir letras, espacios y caracteres especiales del español
            processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            // Limitar a 100 caracteres
            processedValue = processedValue.slice(0, 100);
        } else if (name === 'receiverPhone') {
            // Formatear teléfono automáticamente
            processedValue = formatPhoneNumber(value);
        } else if (name === 'deliveryAddress') {
            // Limitar a 200 caracteres
            processedValue = value.slice(0, 200);
        } else if (name === 'deliveryPoint') {
            // Limitar a 200 caracteres
            processedValue = value.slice(0, 200);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Manejar cambio de fecha
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');

        if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                deliveryDate: selectedDate
            }));

            // Limpiar error de fecha
            if (errors.deliveryDate) {
                setErrors(prev => ({
                    ...prev,
                    deliveryDate: undefined
                }));
            }
        }
    };

    // Función para autocompletar nombre
    const handleAutoFillName = () => {
        if (userInfo) {
            const userName = userInfo.fullName || userInfo.name || '';
            if (userName) {
                setFormData(prev => ({
                    ...prev,
                    receiverName: userName
                }));

                // Limpiar error si existe
                if (errors.receiverName) {
                    setErrors(prev => ({
                        ...prev,
                        receiverName: undefined
                    }));
                }
            }
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            // Mostrar el primer error en un Alert
            const firstError = Object.values(formErrors)[0];
            Alert.alert('Error de validación', firstError);
            return;
        }

        setIsSubmitting(true);

        try {
            // Pasar datos al componente padre
            await onShippingInfoUpdate({
                receiverName: formData.receiverName.trim(),
                receiverPhone: formData.receiverPhone.trim(),
                deliveryAddress: formData.deliveryAddress.trim(),
                deliveryPoint: formData.deliveryPoint.trim(),
                deliveryDate: formatDateToLocalISO(formData.deliveryDate)
            });

            // Avanzar al siguiente paso
            onNext();
        } catch (error) {
            console.error('Error al procesar información de envío:', error);
            Alert.alert('Error', 'Error al procesar la información. Inténtalo nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obtener fecha mínima (hoy)
    const getMinDate = () => {
        return new Date();
    };

    // Formatear fecha para mostrar
    const formatDateDisplay = (date) => {
        if (!date) return 'Seleccionar fecha';

        // Si es un string (fecha ISO), convertirlo a Date
        let dateObj;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            return 'Seleccionar fecha';
        }

        // Verificar que la fecha sea válida
        if (isNaN(dateObj.getTime())) {
            return 'Seleccionar fecha';
        }

        return dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Obtener nombre y email del usuario
    const getUserName = () => {
        if (!userInfo) return 'Usuario';
        return userInfo.fullName || userInfo.name || 'Usuario';
    };

    const getUserEmail = () => {
        if (!userInfo) return 'usuario@correo.com';
        return userInfo.email || 'usuario@correo.com';
    };

    const getCurrentReceiverName = () => {
        return formData.receiverName || getUserName();
    };

    const shouldShowAutoFillButton = () => {
        if (!userInfo) return false;
        const userName = getUserName();
        const currentName = formData.receiverName;
        return userName !== 'Usuario' && currentName !== userName;
    };

    // NUEVO: Calcular el contenido principal ajustado para el teclado
    const getContentContainerStyle = () => {
        const baseStyle = styles.scrollContent;

        if (isKeyboardVisible && Platform.OS === 'android') {
            return {
                ...baseStyle,
                paddingBottom: Math.max(baseStyle.paddingBottom || 16, keyboardHeight + 60)
            };
        }

        return baseStyle;
    };

    // NUEVO: Calcular la altura del ScrollView
    const getScrollViewStyle = () => {
        if (isKeyboardVisible && Platform.OS === 'ios') {
            return {
                ...styles.scrollContainer,
                maxHeight: SCREEN_HEIGHT - keyboardHeight - 200 // Ajustar según necesidad
            };
        }

        return styles.scrollContainer;
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Información de envío</Text>

                {/* MODIFICADO: ScrollView con mejor manejo del teclado */}
                <ScrollView
                    style={getScrollViewStyle()}
                    contentContainerStyle={getContentContainerStyle()}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    scrollEventThrottle={16}
                    // NUEVO: Props adicionales para mejor comportamiento
                    nestedScrollEnabled={true}
                    automaticallyAdjustContentInsets={false}
                    contentInsetAdjustmentBehavior="automatic"
                >
                    {/* Información del cliente (solo lectura) */}
                    <View style={styles.readOnlySection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cliente</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={getUserName()}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={getUserEmail()}
                            editable={false}
                        />
                    </View>

                    {/* Nombre del receptor */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Nombre completo del receptor *</Text>
                            {shouldShowAutoFillButton() && (
                                <TouchableOpacity onPress={handleAutoFillName}>
                                    <Text style={styles.autoFillButton}>Usar mi nombre</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={[styles.input, errors.receiverName && styles.inputError]}
                            value={getCurrentReceiverName()}
                            onChangeText={(value) => handleInputChange('receiverName', value)}
                            placeholder="Ej: María José García López"
                            placeholderTextColor="#999"
                            maxLength={100}
                            editable={!isSubmitting}
                            returnKeyType="next"
                        />
                        {errors.receiverName && (
                            <Text style={styles.errorText}>{errors.receiverName}</Text>
                        )}
                        <Text style={styles.helpText}>
                            Escribe el nombre de la persona que recogerá el pedido (solo letras)
                        </Text>
                    </View>

                    {/* Teléfono del receptor */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teléfono del receptor *</Text>
                        <TextInput
                            style={[styles.input, errors.receiverPhone && styles.inputError]}
                            value={formData.receiverPhone}
                            onChangeText={(value) => handleInputChange('receiverPhone', value)}
                            placeholder="1234-5678"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            maxLength={9}
                            editable={!isSubmitting}
                            returnKeyType="next"
                        />
                        {errors.receiverPhone && (
                            <Text style={styles.errorText}>{errors.receiverPhone}</Text>
                        )}
                        <Text style={styles.helpText}>
                            El teléfono se formateará automáticamente como ####-####
                        </Text>
                    </View>

                    {/* Dirección de entrega */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Dirección de entrega *</Text>
                        <TextInput
                            style={[styles.textArea, errors.deliveryAddress && styles.inputError]}
                            value={formData.deliveryAddress}
                            onChangeText={(value) => handleInputChange('deliveryAddress', value)}
                            placeholder="Ej: Colonia Escalón, Calle Principal #123, San Salvador"
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={3}
                            maxLength={200}
                            editable={!isSubmitting}
                            textAlignVertical="top"
                            returnKeyType="next"
                            blurOnSubmit={false}
                        />
                        {errors.deliveryAddress && (
                            <Text style={styles.errorText}>{errors.deliveryAddress}</Text>
                        )}
                        <Text style={styles.helpText}>
                            Entre 20 y 200 caracteres ({formData.deliveryAddress.length}/200)
                        </Text>
                    </View>

                    {/* Punto de referencia */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Punto de referencia *</Text>
                        <TextInput
                            style={[styles.textArea, errors.deliveryPoint && styles.inputError]}
                            value={formData.deliveryPoint}
                            onChangeText={(value) => handleInputChange('deliveryPoint', value)}
                            placeholder="Ej: Casa blanca con portón negro, frente al supermercado, al lado de la farmacia"
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={3}
                            maxLength={200}
                            editable={!isSubmitting}
                            textAlignVertical="top"
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />
                        {errors.deliveryPoint && (
                            <Text style={styles.errorText}>{errors.deliveryPoint}</Text>
                        )}
                        <Text style={styles.helpText}>
                            Entre 20 y 200 caracteres ({formData.deliveryPoint.length}/200)
                        </Text>
                    </View>

                    {/* Fecha de entrega */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Fecha de entrega preferida *</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, errors.deliveryDate && styles.inputError]}
                            onPress={() => {
                                Keyboard.dismiss(); // NUEVO: Cerrar teclado antes de mostrar picker
                                setShowDatePicker(true);
                            }}
                            disabled={isSubmitting}
                        >
                            <Text style={[
                                styles.dateButtonText,
                                !formData.deliveryDate && styles.dateButtonPlaceholder
                            ]}>
                                {formatDateDisplay(formData.deliveryDate)}
                            </Text>
                            <Icon name="calendar-today" size={20} color="#666" />
                        </TouchableOpacity>
                        {errors.deliveryDate && (
                            <Text style={styles.errorText}>{errors.deliveryDate}</Text>
                        )}
                        <Text style={styles.helpText}>
                            Selecciona una fecha a partir de hoy usando el calendario
                        </Text>
                    </View>

                    {/* Información adicional */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoHeader}>
                            <Icon name="info" size={20} color="#3b82f6" />
                            <Text style={styles.infoTitle}>Información importante</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoItem}>• El tiempo de entrega puede variar según la ubicación</Text>
                            <Text style={styles.infoItem}>• Asegúrate de que alguien esté disponible en la dirección indicada</Text>
                            <Text style={styles.infoItem}>• El punto de referencia nos ayuda a encontrar la dirección más fácilmente</Text>
                        </View>
                    </View>

                    {/* NUEVO: Espaciado adicional cuando el teclado está visible */}
                    {isKeyboardVisible && <View style={{ height: 80 }} />}
                </ScrollView>

                {/* MODIFICADO: Botón de continuar con mejor posicionamiento */}
                <View style={[
                    styles.buttonContainer,
                    isKeyboardVisible && Platform.OS === 'android' && {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#fff',
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: -2 },
                    }
                ]}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.loadingText}>Procesando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>Continuar al pago</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DateTimePicker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={formData.deliveryDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={getMinDate()}
                        onChange={handleDateChange}
                    />
                )}
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
        // NUEVO: Asegurar que el container no se deforme
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    scrollContainer: {
        flex: 1,
        // NUEVO: Mejorar el comportamiento del scroll
        minHeight: 0,
    },
    scrollContent: {
        paddingBottom: 16,
        // NUEVO: Asegurar espacio mínimo
        minHeight: '100%',
        flexGrow: 1,
    },
    readOnlySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        fontFamily: 'Poppins-Medium',
    },
    autoFillButton: {
        fontSize: 12,
        color: '#FDB4B7',
        textDecorationLine: 'underline',
        fontFamily: 'Poppins-Regular',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f9fafb',
        color: '#6b7280',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        backgroundColor: '#fff',
        minHeight: 80,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    dateButtonText: {
        fontSize: 14,
        color: '#374151',
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    dateButtonPlaceholder: {
        color: '#9ca3af',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },
    helpText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },
    infoCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e40af',
        marginLeft: 8,
        fontFamily: 'Poppins-Medium',
    },
    infoContent: {
        gap: 4,
    },
    infoItem: {
        fontSize: 12,
        color: '#2563eb',
        fontFamily: 'Poppins-Regular',
    },
    buttonContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        // NUEVO: Mejorar posicionamiento
        zIndex: 1,
    },
    submitButton: {
        backgroundColor: '#FDB4B7',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    buttonDisabled: {
        backgroundColor: '#FDB4B7',
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
});

export default ShippingInfoMobile;
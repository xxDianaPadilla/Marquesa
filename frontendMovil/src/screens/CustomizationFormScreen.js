import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import useCustomization from '../hooks/useCustomization';

const { width: screenWidth } = Dimensions.get('window');

export default function CustomizationFormScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    const {
        selectedProducts = [],
        productType = '',
        totalPrice = 0,
        onComplete
    } = route.params || {};

    const [referenceImage, setReferenceImage] = useState(null);
    const [comments, setComments] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const insets = useSafeAreaInsets();

    // Obtener datos de autenticación
    const { user, userInfo } = useAuth();

    // Usar el hook personalizado para manejar las operaciones de customización
    const { isLoading, processCustomization } = useCustomization();

    useEffect(() => {
        if (!selectedProducts || selectedProducts.length === 0) {
            console.warn('No se recibieron productos seleccionados');
            Alert.alert(
                'Error',
                'No se encontraron productos seleccionados',
                [
                    {
                        text: 'Volver',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
    }, [selectedProducts, navigation]);

    useEffect(() => {
        console.log('CustomizationFormScreen recibió:', {
            selectedProducts,
            productType,
            totalPrice,
            hasOnComplete: !!onComplete,
            userInfo: user // Debug del usuario
        });
    }, [selectedProducts, productType, totalPrice, onComplete, user]);

    // Solicitar permisos de cámara y galería al cargar el componente
    useEffect(() => {
        const requestPermissions = async () => {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
                Alert.alert(
                    'Permisos requeridos',
                    'Necesitamos permisos de cámara y galería para subir imágenes de referencia.',
                    [{ text: 'OK' }]
                );
            }
        };

        requestPermissions();
    }, []);

    // Función para mostrar opciones de selección de imagen
    const showImagePicker = () => {
        Alert.alert(
            'Seleccionar imagen',
            '¿Cómo quieres agregar la imagen de referencia?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cámara', onPress: pickImageFromCamera },
                { text: 'Galería', onPress: pickImageFromLibrary }
            ]
        );
    };

    // Función para tomar foto con la cámara - CORREGIDA PARA BACKEND
    const pickImageFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7, // Reducir calidad para evitar archivos muy grandes
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                console.log('Imagen capturada desde cámara:', {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    size: asset.fileSize,
                    hasBase64: !!asset.base64,
                    base64Length: asset.base64?.length || 0
                });

                if (!asset.base64) {
                    Alert.alert('Error', 'No se pudo procesar la imagen. Inténtalo nuevamente.');
                    return;
                }

                const imageForBackend = {
                    uri: asset.uri,
                    base64: asset.base64,
                    type: asset.type || 'image/jpeg',
                    width: asset.width,
                    height: asset.height
                };

                setReferenceImage(imageForBackend);
                setImagePreview(asset.uri);

                console.log('Imagen preparada correctamente para backend');
            }
        } catch (error) {
            console.error('Error picking image from camera:', error);
            Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo nuevamente.');
        }
    };

    // Función para seleccionar imagen de la galería - CORREGIDA PARA BACKEND
    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7, // Reducir calidad para evitar archivos muy grandes
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                console.log('Imagen seleccionada desde galería:', {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    size: asset.fileSize,
                    hasBase64: !!asset.base64,
                    base64Length: asset.base64?.length || 0
                });

                if (!asset.base64) {
                    Alert.alert('Error', 'No se pudo procesar la imagen. Inténtalo nuevamente.');
                    return;
                }

                const imageForBackend = {
                    uri: asset.uri,
                    base64: asset.base64,
                    type: asset.type || 'image/jpeg',
                    width: asset.width,
                    height: asset.height
                };

                setReferenceImage(imageForBackend);
                setImagePreview(asset.uri);

                console.log('Imagen preparada correctamente para backend');
            }
        } catch (error) {
            console.error('Error picking image from library:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo nuevamente.');
        }
    };

    // Función para remover imagen seleccionada
    const handleRemoveImage = () => {
        Alert.alert(
            'Remover imagen',
            '¿Estás seguro de que quieres remover la imagen de referencia?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => {
                        setReferenceImage(null);
                        setImagePreview(null);
                        console.log('Imagen removida');
                    }
                }
            ]
        );
    };

    // Función para manejar la confirmación - MEJORADA CON VALIDACIONES
    // Función para manejar la confirmación - MEJORADA CON NAVEGACIÓN A SHOPPING CART
    const handleConfirm = async () => {
        // Prevenir múltiples ejecuciones
        if (isLoading) {
            console.log('Función ya en ejecución, ignorando...');
            return;
        }

        try {
            console.log('=== INICIANDO PROCESO DE CONFIRMACIÓN ===');

            if (!user || !user.id) {
                console.error('Usuario no autenticado:', user);
                Alert.alert('Error', 'Debes iniciar sesión para continuar');
                return;
            }

            if (!selectedProducts || selectedProducts.length === 0) {
                console.error('No hay productos seleccionados:', selectedProducts);
                Alert.alert('Error', 'Debes seleccionar al menos un producto para personalizar');
                return;
            }

            if (!totalPrice || totalPrice <= 0) {
                console.error('Precio inválido:', totalPrice);
                Alert.alert('Error', 'El precio total debe ser mayor a 0');
                return;
            }

            if (!productType || productType.trim() === '') {
                console.error('Tipo de producto inválido:', productType);
                Alert.alert('Error', 'Tipo de producto requerido');
                return;
            }

            console.log('Todas las validaciones pasaron');

            // Validar que los productos tengan IDs válidos
            const invalidProducts = selectedProducts.filter(product => !product._id || product._id.trim() === '');
            if (invalidProducts.length > 0) {
                console.error('Productos con IDs inválidos:', invalidProducts);
                Alert.alert('Error', 'Algunos productos no tienen identificadores válidos. Intenta seleccionar los productos nuevamente.');
                return;
            }

            // Mostrar confirmación antes de procesar
            Alert.alert(
                'Confirmar personalización',
                `¿Confirmas tu personalización de ${productType}?\n\nTotal: ${totalPrice.toFixed(2)} USD\nProductos: ${selectedProducts.length}${referenceImage ? '\nCon imagen de referencia' : ''}`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Confirmar',
                        onPress: async () => {
                            try {
                                console.log('=== PROCESANDO PERSONALIZACIÓN ===');

                                const customizationParams = {
                                    user,
                                    selectedProducts: selectedProducts.map(product => ({
                                        ...product,
                                        _id: product._id.trim(), // Limpiar espacios en blanco
                                    })),
                                    productType,
                                    referenceImage,
                                    comments: comments.trim(),
                                    totalPrice
                                };

                                console.log('Parámetros de personalización preparados:', {
                                    userId: user.id,
                                    productType,
                                    selectedProductsCount: selectedProducts.length,
                                    totalPrice,
                                    hasReferenceImage: !!referenceImage,
                                    commentsLength: comments.trim().length
                                });

                                console.log('Selected products detail:', selectedProducts.map(p => ({
                                    id: p._id,
                                    name: p.name,
                                    price: p.price,
                                    quantity: p.quantity
                                })));

                                const customizationData = await processCustomization(customizationParams);

                                console.log('PERSONALIZACIÓN PROCESADA EXITOSAMENTE:', customizationData);

                                // Limpiar formulario inmediatamente después del éxito
                                setReferenceImage(null);
                                setImagePreview(null);
                                setComments('');

                                // Llamar callback si existe
                                if (onComplete) {
                                    console.log('Ejecutando callback onComplete');
                                    onComplete(customizationData);
                                }

                            } catch (error) {
                                console.error('❌ ERROR EN EL PROCESO DE CONFIRMACIÓN:', error);

                                // Mejorar mensajes de error específicos
                                let errorMessage = 'Ocurrió un error al procesar tu personalización';

                                if (error.message.includes('conexión')) {
                                    errorMessage = 'Error de conexión. Verifica tu internet.';
                                } else if (error.message.includes('validación')) {
                                    errorMessage = error.message;
                                } else if (error.message.includes('usuario')) {
                                    errorMessage = 'Error de autenticación. Inicia sesión nuevamente.';
                                } else if (error.message.includes('IDs inválidos')) {
                                    errorMessage = 'Error con los productos seleccionados. Intenta seleccionar los productos nuevamente.';
                                }

                                Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('❌ ERROR EN HANDLECONFIRM:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado', [{ text: 'OK' }]);
        }
    };

    // Función para cancelar y regresar
    const handleCancel = () => {
        Alert.alert(
            'Cancelar personalización',
            '¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: () => {
                        // Limpiar formulario
                        setReferenceImage(null);
                        setImagePreview(null);
                        setComments('');
                        console.log('Formulario cancelado y limpiado');
                        // Regresar a la pantalla anterior
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.backButton}
                        disabled={isLoading}
                    >
                        <Icon name="arrow-back" size={24} color="#4A4170" />
                    </TouchableOpacity>

                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>Finalizar Personalización</Text>
                        <Text style={styles.subtitle}>¿Te gusta cómo luce tu {productType}?</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Resumen de productos seleccionados */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.sectionTitle}>Resumen de tu personalización</Text>

                        <View style={styles.productsList}>
                            {selectedProducts.map((product, index) => (
                                <View key={product._id || index} style={styles.productItem}>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productCategory}>{product.category}</Text>
                                    </View>
                                    <Text style={styles.productPrice}>${(product.price || 0).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalPrice}>${totalPrice.toFixed(2)} USD</Text>
                        </View>
                    </View>

                    {/* Imagen de referencia */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>¿Ya tenías un diseño en mente?</Text>
                        <Text style={styles.sectionSubtitle}>Sube una imagen de referencia (opcional)</Text>

                        <TouchableOpacity
                            style={styles.imageUploadContainer}
                            onPress={showImagePicker}
                            disabled={isLoading}
                        >
                            {imagePreview ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: imagePreview }}
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={handleRemoveImage}
                                        disabled={isLoading}
                                    >
                                        <Icon name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.imageUploadContent}>
                                    <Icon name="add-a-photo" size={32} color="#ccc" />
                                    <Text style={styles.imageUploadText}>Subir imagen de referencia</Text>
                                    <Text style={styles.imageUploadSubtext}>PNG, JPG hasta 5MB</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Comentarios */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Comentarios adicionales</Text>
                        <Text style={styles.sectionSubtitle}>
                            Describe cualquier detalle específico que quieras para tu personalización
                        </Text>

                        <TextInput
                            style={styles.commentInput}
                            value={comments}
                            onChangeText={setComments}
                            placeholder="Escribe aquí tus comentarios o especificaciones..."
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={6}
                            textAlignVertical="top"
                            maxLength={500}
                            editable={!isLoading}
                        />

                        <Text style={styles.characterCount}>
                            {comments.length}/500 caracteres
                        </Text>
                    </View>

                    {/* Nota sobre el precio */}
                    <View style={styles.noteContainer}>
                        <Icon name="info-outline" size={16} color="#666" />
                        <Text style={styles.noteText}>
                            El precio final puede variar según las especificaciones
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer con botones */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity
                        style={[styles.cancelButton, isLoading && styles.disabledButton]}
                        onPress={handleCancel}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.confirmButton, isLoading && styles.disabledButton]}
                        onPress={handleConfirm}
                        disabled={isLoading || !user}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.confirmButtonText}>Procesando...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Icon name="shopping-cart" size={20} color="#fff" />
                                <Text style={styles.confirmButtonText}>Agregar al carrito</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoid: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginBottom: 16,
        lineHeight: 16,
    },
    productsList: {
        marginBottom: 12,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#333',
        marginBottom: 2,
    },
    productCategory: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },
    productPrice: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#27ae60',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#ddd',
    },
    totalLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
    },
    totalPrice: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#e91e63',
    },

    // Form sections
    formSection: {
        marginBottom: 24,
    },

    // Image upload
    imageUploadContainer: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
    },
    imagePreviewContainer: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
    },
    imagePreview: {
        width: screenWidth - 72,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageUploadContent: {
        alignItems: 'center',
    },
    imageUploadText: {
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    imageUploadSubtext: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },

    // Comments
    commentInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#333',
        minHeight: 100,
    },
    characterCount: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },

    // Note
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    noteText: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    cancelButton: {
        flex: 0.4,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#666',
    },
    confirmButton: {
        flex: 0.6,
        backgroundColor: '#4A4170',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
        marginLeft: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
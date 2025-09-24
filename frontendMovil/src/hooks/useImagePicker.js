import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Hook optimizado para Expo Go (sin Development Build)
 * Maneja permisos automáticamente y funciona en Expo Go
 */
export const useImagePicker = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Configuración simplificada para Expo Go
     */
    const imagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
    };

    /**
     * Procesa el resultado de la selección
     */
    const processImageResult = useCallback((result) => {
        console.log('📷 === PROCESSING IMAGE RESULT ===');
        console.log('📷 Result:', result);

        if (!result || result.canceled) {
            console.log('📷 Usuario canceló o resultado vacío');
            return null;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            
            console.log('📷 Asset encontrado:', {
                uri: asset.uri,
                type: asset.type,
                width: asset.width,
                height: asset.height
            });

            const imageData = {
                uri: asset.uri,
                type: asset.type || 'image',
                name: asset.fileName || `image_${Date.now()}.jpg`,
                size: asset.fileSize || 0,
                width: asset.width,
                height: asset.height,
            };

            console.log('📷 ✅ IMAGEN PROCESADA EXITOSAMENTE');
            setSelectedImage(imageData);
            setError(null);
            return imageData;
        }

        console.log('📷 ❌ No se encontraron assets en el resultado');
        setError('No se pudo procesar la imagen');
        return null;
    }, []);

    /**
     * Abre la cámara con manejo automático de permisos
     */
    const openCamera = useCallback(async () => {
        try {
            console.log('📷 === OPENING CAMERA ===');
            setIsLoading(true);
            setError(null);

            // En Expo Go, los permisos se manejan automáticamente
            console.log('📷 Lanzando cámara...');
            const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
            
            console.log('📷 Resultado de cámara recibido');
            processImageResult(result);
        } catch (error) {
            console.error('❌ Error abriendo cámara:', error);
            setError('Error abriendo la cámara: ' + error.message);
            
            // Si hay error de permisos, mostrar alerta informativa
            if (error.message.includes('permission')) {
                Alert.alert(
                    'Permisos requeridos',
                    'Para usar la cámara, ve a Configuración > Aplicaciones > Expo Go > Permisos y habilita la cámara.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [processImageResult]);

    /**
     * Abre la galería con manejo automático de permisos
     */
    const openGallery = useCallback(async () => {
        try {
            console.log('📷 === OPENING GALLERY ===');
            setIsLoading(true);
            setError(null);

            // En Expo Go, los permisos se manejan automáticamente
            console.log('📷 Lanzando galería...');
            const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
            
            console.log('📷 Resultado de galería recibido');
            processImageResult(result);
        } catch (error) {
            console.error('❌ Error abriendo galería:', error);
            setError('Error abriendo la galería: ' + error.message);
            
            // Si hay error de permisos, mostrar alerta informativa
            if (error.message.includes('permission')) {
                Alert.alert(
                    'Permisos requeridos',
                    'Para usar la galería, ve a Configuración > Aplicaciones > Expo Go > Permisos y habilita el almacenamiento.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [processImageResult]);

    /**
     * Función principal - simplificada para debugging
     */
    const showImagePicker = useCallback(({ fromCamera = false, fromGallery = false } = {}) => {
        console.log('📷 === SHOW IMAGE PICKER CALLED ===');
        console.log('📷 Params:', { fromCamera, fromGallery });
        
        if (fromCamera) {
            console.log('📷 Redirigiendo a cámara...');
            openCamera();
        } else if (fromGallery) {
            console.log('📷 Redirigiendo a galería...');
            openGallery();
        } else {
            console.log('📷 Sin parámetros específicos - mostrando alert...');
            Alert.alert(
                'Seleccionar imagen',
                '¿Cómo quieres seleccionar la imagen?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Cámara', onPress: openCamera },
                    { text: 'Galería', onPress: openGallery },
                ]
            );
        }
    }, [openCamera, openGallery]);

    /**
     * Limpia la imagen seleccionada
     */
    const clearSelectedImage = useCallback(() => {
        console.log('📷 Limpiando imagen seleccionada');
        setSelectedImage(null);
        setError(null);
    }, []);

    /**
     * Limpia errores
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Estado
        selectedImage,
        isLoading,
        error,
        hasImage: !!selectedImage,

        // Funciones principales
        showImagePicker,
        openCamera,
        openGallery,
        clearSelectedImage,
        clearError,

        // Información de la imagen
        imageUri: selectedImage?.uri,
        imageSize: selectedImage?.size,
        imageName: selectedImage?.name,
        imageType: selectedImage?.type,
    };
};
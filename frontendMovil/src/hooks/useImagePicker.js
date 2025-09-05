import { useState, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

/**
 * Hook personalizado para manejar la selección y captura de imágenes
 * Simplificado y funcional sin dependencias externas complejas
 */
export const useImagePicker = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Configuración por defecto para imágenes
    const defaultOptions = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        selectionLimit: 1,
    };

    /**
     * Solicita permisos de cámara para Android
     */
    const requestCameraPermission = useCallback(async () => {
        if (Platform.OS === 'ios') {
            return true; // iOS maneja permisos automáticamente
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Permiso de Cámara',
                    message: 'La app necesita acceso a la cámara para tomar fotos',
                    buttonNeutral: 'Preguntar después',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'OK',
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('✅ Permiso de cámara concedido');
                return true;
            } else {
                console.log('❌ Permiso de cámara denegado');
                Alert.alert(
                    'Permiso requerido',
                    'Se necesita permiso de cámara para tomar fotos'
                );
                return false;
            }
        } catch (error) {
            console.error('❌ Error solicitando permiso de cámara:', error);
            return false;
        }
    }, []);

    /**
     * Valida el archivo de imagen seleccionado
     */
    const validateImage = useCallback((asset) => {
        console.log('🔍 Validando imagen:', {
            size: asset.fileSize,
            type: asset.type,
            width: asset.width,
            height: asset.height
        });

        // Validar tamaño de archivo (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (asset.fileSize && asset.fileSize > maxSize) {
            Alert.alert(
                'Archivo muy grande',
                `La imagen no puede ser mayor a 10MB. Tamaño actual: ${(asset.fileSize / 1024 / 1024).toFixed(1)}MB`
            );
            return false;
        }

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (asset.type && !allowedTypes.includes(asset.type.toLowerCase())) {
            Alert.alert(
                'Tipo de archivo no válido',
                'Solo se permiten imágenes JPG, PNG, GIF y WebP.'
            );
            return false;
        }

        return true;
    }, []);

    /**
     * Procesa la respuesta del picker de imágenes
     */
    const processImageResponse = useCallback((response) => {
        console.log('📷 Respuesta del picker:', response);

        if (response.didCancel) {
            console.log('📷 Usuario canceló selección de imagen');
            return null;
        }

        if (response.errorCode) {
            console.error('❌ Error en picker de imagen:', response.errorMessage);
            Alert.alert(
                'Error',
                response.errorMessage || 'No se pudo acceder a las imágenes'
            );
            return null;
        }

        if (!response.assets || response.assets.length === 0) {
            console.warn('⚠️ No se seleccionó ninguna imagen');
            return null;
        }

        const asset = response.assets[0];
        
        // Validar la imagen
        if (!validateImage(asset)) {
            return null;
        }

        // Crear objeto de imagen normalizado
        const imageData = {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `image_${Date.now()}.jpg`,
            size: asset.fileSize || 0,
            width: asset.width || 0,
            height: asset.height || 0,
        };

        console.log('✅ Imagen procesada exitosamente:', {
            name: imageData.name,
            size: `${(imageData.size / 1024 / 1024).toFixed(2)}MB`,
            dimensions: `${imageData.width}x${imageData.height}`
        });

        return imageData;
    }, [validateImage]);

    /**
     * Abre la galería de imágenes
     */
    const pickFromGallery = useCallback((options = {}) => {
        const pickerOptions = { 
            ...defaultOptions, 
            ...options,
            mediaType: 'photo'
        };
        
        console.log('📷 Abriendo galería con opciones:', pickerOptions);
        setIsLoading(true);
        
        launchImageLibrary(pickerOptions, (response) => {
            setIsLoading(false);
            const imageData = processImageResponse(response);
            
            if (imageData) {
                setSelectedImage(imageData);
                console.log('✅ Imagen seleccionada de galería');
            }
        });
    }, [processImageResponse]);

    /**
     * Abre la cámara para tomar foto
     */
    const takePhoto = useCallback(async (options = {}) => {
        try {
            // Solicitar permiso de cámara en Android
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
                return;
            }

            const pickerOptions = { 
                ...defaultOptions, 
                ...options,
                mediaType: 'photo'
            };
            
            console.log('📷 Abriendo cámara con opciones:', pickerOptions);
            setIsLoading(true);
            
            launchCamera(pickerOptions, (response) => {
                setIsLoading(false);
                const imageData = processImageResponse(response);
                
                if (imageData) {
                    setSelectedImage(imageData);
                    console.log('✅ Foto tomada exitosamente');
                }
            });
        } catch (error) {
            setIsLoading(false);
            console.error('❌ Error abriendo cámara:', error);
            Alert.alert(
                'Error',
                'No se pudo abrir la cámara'
            );
        }
    }, [requestCameraPermission, processImageResponse]);

    /**
     * Muestra opciones para seleccionar imagen - ARREGLADO CON MEJOR LOGGING
     */
    const showImagePicker = useCallback((options = {}) => {
        console.log('📷 showImagePicker llamado con opciones:', options);
        
        if (options.fromCamera) {
            console.log('📷 Abriendo cámara directamente');
            takePhoto(options);
        } else if (options.fromGallery) {
            console.log('📷 Abriendo galería directamente');
            pickFromGallery(options);
        } else {
            // Mostrar opciones si no se especifica la fuente
            console.log('📷 Mostrando opciones de selección');
            Alert.alert(
                'Seleccionar imagen',
                '¿De dónde quieres obtener la imagen?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                        onPress: () => console.log('📷 Usuario canceló selección')
                    },
                    {
                        text: 'Galería',
                        onPress: () => {
                            console.log('📷 Usuario seleccionó galería');
                            pickFromGallery(options);
                        }
                    },
                    {
                        text: 'Cámara',
                        onPress: () => {
                            console.log('📷 Usuario seleccionó cámara');
                            takePhoto(options);
                        }
                    }
                ]
            );
        }
    }, [pickFromGallery, takePhoto]);

    /**
     * Elimina la imagen seleccionada
     */
    const clearSelectedImage = useCallback(() => {
        setSelectedImage(null);
        console.log('🗑️ Imagen seleccionada eliminada');
    }, []);

    /**
     * Obtiene información detallada de la imagen
     */
    const getImageInfo = useCallback((imageData) => {
        if (!imageData) return null;

        return {
            sizeInMB: (imageData.size / 1024 / 1024).toFixed(2),
            dimensions: `${imageData.width}x${imageData.height}`,
            aspectRatio: imageData.width && imageData.height 
                ? (imageData.width / imageData.height).toFixed(2) 
                : 'N/A',
            type: imageData.type,
            name: imageData.name
        };
    }, []);

    /**
     * Redimensiona una imagen si es necesario (placeholder)
     */
    const resizeImage = useCallback((imageData, maxWidth = 800, maxHeight = 600) => {
        // Esta función podría implementarse con react-native-image-resizer
        console.log('🔄 Redimensionar imagen (no implementado):', {
            original: `${imageData.width}x${imageData.height}`,
            target: `${maxWidth}x${maxHeight}`
        });
        
        // Por ahora retornamos la imagen original
        return imageData;
    }, []);

    return {
        // Estado
        selectedImage,
        isLoading,
        
        // Funciones principales
        pickFromGallery,
        takePhoto,
        showImagePicker,
        clearSelectedImage,
        
        // Funciones de utilidad
        validateImage,
        getImageInfo,
        resizeImage,
        
        // Configuración
        setSelectedImage
    };
};
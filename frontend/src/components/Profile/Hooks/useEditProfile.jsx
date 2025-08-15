import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar la edición del perfil de usuario
 * ACTUALIZADO: Sistema de autenticación cross-domain híbrido
 * Maneja la lógica de validación, envío de datos y manejo de archivos
 * ✅ CORREGIDO: credentials 'include' agregado para cookies cross-domain
 */
const useEditProfile = () => {
    const { userInfo, getUserInfo, getBestAvailableToken, setAuthToken } = useAuth();

    // Estados del formulario
    const [formData, setFormData] = useState({
        phone: userInfo?.displayPhone || '',
        address: userInfo?.displayAddress || '',
        fullName: userInfo?.displayName || '',
        profilePicture: null
    });

    // Estados de UI
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    /**
     * ✅ NUEVA FUNCIÓN: Crear headers de autenticación híbridos
     */
    const getAuthHeaders = useCallback(() => {
        const token = getBestAvailableToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }, [getBestAvailableToken]);

    /**
     * Función de validación para el nombre
     */
    const validateFullName = useCallback((name) => {
        if (!name || !name.trim()) {
            return { isValid: false, error: "El nombre es requerido" };
        }

        const trimmed = name.trim();

        if (trimmed.length < 3) {
            return { isValid: false, error: "El nombre debe tener al menos 3 caracteres" };
        }

        if (trimmed.length > 100) {
            return { isValid: false, error: "El nombre no puede exceder 100 caracteres" };
        }

        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nameRegex.test(trimmed)) {
            return { isValid: false, error: "El nombre solo puede contener letras" };
        }

        return { isValid: true, error: null };
    }, []);

    /**
     * Función de validación para el teléfono salvadoreño
     */
    const validatePhone = useCallback((phone) => {
        if (!phone || !phone.trim()) {
            return { isValid: false, error: "El teléfono es requerido" };
        }

        // Eliminar espacios y caracteres no numéricos
        const cleaned = phone.trim().replace(/\D/g, '');

        if (cleaned.length !== 8) {
            return { isValid: false, error: "El teléfono debe tener 8 dígitos" };
        }

        // Formatear el número con guion después de los primeros 4 dígitos
        const formatted = cleaned.slice(0, 4) + "-" + cleaned.slice(4);

        return { isValid: true, formatted };
    }, []);

    /**
     * Función de validación para la dirección
     */
    const validateAddress = useCallback((address) => {
        if (!address || !address.trim()) {
            return { isValid: false, error: "La dirección es requerida" };
        }

        const trimmed = address.trim();
        if (trimmed.length < 10) {
            return { isValid: false, error: "La dirección debe tener al menos 10 caracteres" };
        }

        return { isValid: true, error: null };
    }, []);

    /**
     * Función de validación para imagen
     */
    const validateImage = useCallback((file) => {
        if (!file) return { isValid: true, error: null };

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: "Formato de imagen no válido. Solo se permiten JPG, PNG y WEBP"
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: "La imagen es demasiado grande. Máximo 5MB"
            };
        }

        return { isValid: true, error: null };
    }, []);

    /**
     * Maneja los cambios en los campos de texto
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'phone') {
            // Solo permitir números y guion
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 8) {
                // Aplicar formato automáticamente
                processedValue = cleaned.length > 4
                    ? cleaned.slice(0, 4) + "-" + cleaned.slice(4)
                    : cleaned;
            } else {
                return; // No actualizar si excede 8 dígitos
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    /**
     * Maneja el cambio de imagen
     */
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];

        if (!file) {
            setFormData(prev => ({ ...prev, profilePicture: null }));
            setPreviewImage(null);
            return;
        }

        const validation = validateImage(file);
        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, profilePicture: validation.error }));
            return;
        }

        setFormData(prev => ({ ...prev, profilePicture: file }));

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);

        // Limpiar error de imagen
        if (errors.profilePicture) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.profilePicture;
                return newErrors;
            });
        }
    }, [validateImage, errors.profilePicture]);

    /**
     * Elimina la imagen seleccionada
     */
    const removeImage = useCallback(() => {
        setFormData(prev => ({ ...prev, profilePicture: null }));
        setPreviewImage(null);

        // Limpiar input file
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }, []);

    /**
     * Valida todo el formulario
     */
    const validateForm = useCallback(() => {
        const newErrors = {};

        const nameValidation = validateFullName(formData.fullName);
        if (!nameValidation.isValid) {
            newErrors.fullName = nameValidation.error;
        }

        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.isValid) {
            newErrors.phone = phoneValidation.error;
        }

        const addressValidation = validateAddress(formData.address);
        if (!addressValidation.isValid) {
            newErrors.address = addressValidation.error;
        }

        if (formData.profilePicture) {
            const imageValidation = validateImage(formData.profilePicture);
            if (!imageValidation.isValid) {
                newErrors.profilePicture = imageValidation.error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, validateFullName, validatePhone, validateAddress, validateImage]);

    /**
     * ✅ CORRECCIÓN CRÍTICA: Envía el formulario al backend con sistema híbrido
     * CORREGIDO: credentials 'include' agregado para cookies cross-domain
     */
    const submitForm = useCallback(async () => {
        if (!validateForm()) {
            return { success: false, message: 'Por favor corrige los errores en el formulario' };
        }

        setIsLoading(true);

        try {
            console.log('📝 === ENVIANDO FORMULARIO PERFIL ===');
            console.log('🌍 Modo:', process.env.NODE_ENV);

            // Crear FormData para enviar archivo
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName.trim());
            formDataToSend.append('phone', formData.phone.trim());
            formDataToSend.append('address', formData.address.trim());

            if (formData.profilePicture) {
                formDataToSend.append('profilePicture', formData.profilePicture);
            }

            console.log('📦 Datos del formulario preparados');

            // ✅ CORRECCIÓN CRÍTICA: Petición con sistema híbrido + credentials
            const token = getBestAvailableToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🔑 Token disponible:', !!token);

            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/profile', {
                method: 'PUT',
                credentials: 'include', // ✅ CRÍTICO: Incluir credentials para cookies cross-domain
                headers: headers, // Headers híbridos (sin Content-Type para FormData)
                body: formDataToSend
            });

            // Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            
            console.log('📡 Status de respuesta:', response.status);
            console.log('🍪 Response headers Set-Cookie:', response.headers.get('Set-Cookie'));
            
            const data = await response.json();
            console.log('📦 Respuesta del servidor:', {
                success: data.success,
                hasToken: !!data.token,
                message: data.message
            });

            if (data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                let token = null;

                // Primera prioridad: response body
                if (data.token) {
                    token = data.token;
                    setAuthToken(token); // Guardar en estado local
                    console.log('💾 Token guardado desde respuesta');
                }

                // Segunda prioridad: cookie (con retraso)
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getBestAvailableToken();
                    if (token) {
                        setAuthToken(token);
                        console.log('💾 Token obtenido de cookies');
                    }
                }

                await getUserInfo();
                console.log('✅ Perfil actualizado exitosamente');
                
                return {
                    success: true,
                    message: 'Perfil actualizado exitosamente'
                };
            } else {
                console.log('❌ Error del servidor:', data.message);
                return {
                    success: false,
                    message: data.message || 'Error al actualizar el perfil'
                };
            }
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            
            // Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión. Verifica tu internet e inténtalo nuevamente.';
            
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
            
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, [formData, validateForm, getUserInfo, getBestAvailableToken, setAuthToken]);

    /**
     * Inicializa el formulario con datos del usuario
     */
    const initializeForm = useCallback(() => {
        if (userInfo) {
            console.log('userInfo completo:', userInfo); 
            setFormData({
                fullName: userInfo.fullName || userInfo.name || '', 
                phone: userInfo.phone || '',                       
                address: userInfo.address || '',                    
                profilePicture: null
            });
            setPreviewImage(null);
            setErrors({});
        }
    }, [userInfo]);

    return {
        // Estados
        formData,
        errors,
        isLoading,
        previewImage,

        // Funciones
        handleInputChange,
        handleImageChange,
        removeImage,
        submitForm,
        initializeForm,
        setErrors
    };
};

export default useEditProfile;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useEditProfile = ({ 
    showConfirmation, 
    hideConfirmation, 
    showError, 
    showSuccess, 
    showLoading, 
    hideLoading 
}) => {
    const { userInfo, getUserInfo } = useAuth();
    
    // Estados del formulario
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: ''
    });
    
    // Estados de UI
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [originalData, setOriginalData] = useState({});
    
    // Nuevo estado para la imagen de perfil
    const [profileImageUri, setProfileImageUri] = useState(null);
    const [hasImageChanged, setHasImageChanged] = useState(false);

    // Función para manejar la selección de imagen
    const handleImagePicker = (imageUri) => {
        console.log('Imagen seleccionada:', imageUri);
        setProfileImageUri(imageUri);
        setHasImageChanged(true);
    };

    // Función para validar el formulario
    const validateForm = () => {
        const errors = [];

        // Validar nombre
        if (!formData.fullName || formData.fullName.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }

        // Validar teléfono
        const phoneClean = formData.phone.replace(/\D/g, '');
        if (!formData.phone || phoneClean.length !== 8) {
            errors.push('El teléfono debe tener 8 dígitos');
        }

        // Validar dirección
        if (!formData.address || formData.address.trim().length < 10) {
            errors.push('La dirección debe tener al menos 10 caracteres');
        }

        if (errors.length > 0) {
            showError(errors.join('\n'));
            return false;
        }

        return true;
    };

    // Función para crear FormData para el envío
    const createFormData = () => {
        const data = new FormData();
        
        // Agregar datos del formulario
        data.append('fullName', formData.fullName.trim());
        data.append('phone', formData.phone.trim());
        data.append('address', formData.address.trim());

        // Agregar imagen si se seleccionó una nueva
        if (hasImageChanged && profileImageUri) {
            const uriParts = profileImageUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            data.append('profilePicture', {
                uri: profileImageUri,
                name: `profile.${fileType}`,
                type: `image/${fileType}`
            });
        }

        return data;
    };

    // Función para actualizar el perfil
    const updateProfile = async () => {
        if (!validateForm()) {
            return;
        }

        showLoading('Actualizando perfil...');
        setLoading(true);

        try {
            const formDataToSend = createFormData();

            console.log('Enviando datos del perfil...');

            const response = await fetch('https://marquesa.onrender.com/api/clients/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formDataToSend,
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (data.success) {
                showSuccess('Perfil actualizado exitosamente');
                
                // Actualizar información del usuario
                await getUserInfo();
                
                // Resetear estados de edición
                setIsEditing(false);
                setHasImageChanged(false);
                
                // Actualizar datos originales
                setOriginalData({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address
                });
            } else {
                showError(data.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showError('Error de conexión. Verifica tu internet e inténtalo nuevamente.');
        } finally {
            hideLoading();
            setLoading(false);
        }
    };

    // Función para manejar cambios en los inputs
    const handleInputChange = (field, value) => {
        let processedValue = value;

        // Procesar formato de teléfono
        if (field === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 8) {
                processedValue = cleaned.length > 4
                    ? cleaned.slice(0, 4) + "-" + cleaned.slice(4)
                    : cleaned;
            } else {
                return; // No actualizar si excede 8 dígitos
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }));
    };

    // Función para alternar modo de edición
    const handleEditToggle = () => {
        if (isEditing) {
            // Intentar guardar
            updateProfile();
        } else {
            // Entrar en modo edición
            setIsEditing(true);
        }
    };

    // Función para cancelar edición
    const cancelEdit = () => {
        showConfirmation(
            'Cancelar edición',
            '¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.',
            () => {
                // Restaurar datos originales
                setFormData(originalData);
                setProfileImageUri(null);
                setHasImageChanged(false);
                setIsEditing(false);
                hideConfirmation();
            },
            hideConfirmation
        );
    };

    // Función para manejar el botón de atrás
    const handleBackPress = (navigation) => {
        if (isEditing) {
            showConfirmation(
                'Salir sin guardar',
                'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?',
                () => {
                    hideConfirmation();
                    navigation.goBack();
                },
                hideConfirmation
            );
        } else {
            navigation.goBack();
        }
    };

    // Inicializar datos cuando se carga el componente
    useEffect(() => {
        if (userInfo) {
            const initialData = {
                fullName: userInfo.fullName || userInfo.name || '',
                phone: userInfo.phone || '',
                address: userInfo.address || ''
            };

            setFormData(initialData);
            setOriginalData(initialData);
            setInitialLoad(false);
        }
    }, [userInfo]);

    return {
        // Estados
        formData,
        isEditing,
        loading,
        initialLoad,
        profileImageUri,
        hasImageChanged,

        // Funciones
        handleInputChange,
        handleEditToggle,
        cancelEdit,
        handleBackPress,
        handleImagePicker
    };
};

export default useEditProfile;
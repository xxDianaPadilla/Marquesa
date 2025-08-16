import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const useEditProfile = (alertFunctions = {}) => {
    const { userInfo, getBestAvailableToken, getUserInfo } = useAuth();
    const { 
        showConfirmation = () => {}, 
        hideConfirmation = () => {},
        showError = () => {},
        showSuccess = () => {},
        showLoading = () => {},
        hideLoading = () => {}
    } = alertFunctions;
    
    // Estados para los campos del formulario
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        birthDate: '',
        address: ''
    });
    
    // Estados de control
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Función para formatear fecha de ISO a DD/MM/YYYY
    const formatDateFromISO = (isoDate) => {
        if (!isoDate) return '';
        
        try {
            const date = new Date(isoDate);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Función para convertir fecha DD/MM/YYYY a ISO para enviar al servidor
    const formatDateToISO = (dateString) => {
        if (!dateString) return '';
        
        try {
            const [day, month, year] = dateString.split('/');
            if (!day || !month || !year) return '';
            
            const date = new Date(year, month - 1, day);
            return date.toISOString();
        } catch (error) {
            console.error('Error converting date to ISO:', error);
            return '';
        }
    };

    // Función para cargar datos del usuario
    const loadUserData = async () => {
        try {
            setInitialLoad(true);
            
            let userData = userInfo;
            
            // Si no tenemos userInfo, intentamos obtenerlo del servidor
            if (!userData) {
                const token = await getBestAvailableToken();
                if (token) {
                    userData = await getUserInfo(token);
                }
            }

            if (userData) {
                setFormData({
                    fullName: userData.fullName || userData.name || '',
                    phone: userData.phone || '',
                    email: userData.email || '',
                    birthDate: formatDateFromISO(userData.birthDate || userData.dateOfBirth || ''),
                    address: userData.address || ''
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            showError('No se pudo cargar la información del usuario');
        } finally {
            setInitialLoad(false);
        }
    };

    // Validación de email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    // Función para validar el formulario
    const validateForm = () => {
        if (!formData.fullName.trim()) {
            showError('El nombre completo es requerido');
            return false;
        }

        if (!formData.email.trim()) {
            showError('El correo electrónico es requerido');
            return false;
        }

        if (!validateEmail(formData.email)) {
            showError('El formato del correo electrónico no es válido');
            return false;
        }

        return true;
    };

    // Función para actualizar los datos del usuario
    const updateUserData = async () => {
        try {
            setLoading(true);
            showLoading({ title: 'Guardando...', message: 'Actualizando tu perfil...' });
            
            const token = await getBestAvailableToken();
            if (!token) {
                hideLoading();
                showError('No hay sesión activa');
                return false;
            }

            // Validar formulario
            if (!validateForm()) {
                hideLoading();
                return false;
            }

            console.log('Actualizando datos del usuario...', formData);

            const response = await fetch('https://marquesa.onrender.com/api/clients/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.trim(),
                    email: formData.email.trim().toLowerCase(),
                    birthDate: formatDateToISO(formData.birthDate),
                    address: formData.address.trim()
                })
            });

            const data = await response.json();
            console.log('Respuesta actualización:', data);

            hideLoading();

            if (response.ok && data.success) {
                // Actualizar la información del usuario en el contexto
                await getUserInfo(token);
                
                showSuccess('Perfil actualizado correctamente');
                setIsEditing(false);
                return true;
            } else {
                const errorMsg = data.message || 'Error al actualizar el perfil';
                showError(errorMsg);
                return false;
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            hideLoading();
            showError('Error de conexión. Inténtalo nuevamente.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar cambios en los campos
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para activar modo edición
    const startEditing = () => {
        setIsEditing(true);
    };

    // Función para cancelar edición
    const cancelEdit = () => {
        setIsEditing(false);
        // Restaurar datos originales
        loadUserData();
    };

    // Función para manejar el botón de editar/guardar
    const handleEditToggle = () => {
        if (isEditing) {
            updateUserData();
        } else {
            startEditing();
        }
    };

    // Función para manejar navegación hacia atrás con confirmación
    const handleBackPress = (navigation) => {
        console.log('handleBackPress called, isEditing:', isEditing);
        console.log('showConfirmation function type:', typeof showConfirmation);
        
        if (isEditing) {
            console.log('Calling showConfirmation...');
            showConfirmation({
                title: 'Descartar cambios',
                message: '¿Estás seguro de que quieres descartar los cambios?',
                confirmText: 'Descartar',
                cancelText: 'Cancelar',
                isDangerous: true,
                onConfirm: () => {
                    console.log('Confirmed discard changes');
                    cancelEdit();
                    hideConfirmation();
                    navigation.goBack();
                },
                onCancel: () => {
                    console.log('Cancelled discard changes');
                    hideConfirmation();
                }
            });
        } else {
            console.log('Going back without confirmation');
            navigation.goBack();
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadUserData();
    }, []);

    return {
        // Estados
        formData,
        isEditing,
        loading,
        initialLoad,
        
        // Funciones de manejo de datos
        handleInputChange,
        handleEditToggle,
        cancelEdit,
        startEditing,
        loadUserData,
        updateUserData,
        
        // Funciones de navegación
        handleBackPress,
        
        // Funciones de utilidad
        formatDateFromISO,
        formatDateToISO,
        validateForm,
        validateEmail
    };
};

export default useEditProfile;
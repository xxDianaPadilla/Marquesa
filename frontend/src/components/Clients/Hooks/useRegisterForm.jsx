import { useState } from "react";
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar el formulario de registro
 * Ahora maneja la lógica de validación previa y activación del modal de verificación
 */
const useRegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        birthDate: '',
        address: '',
        password: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
    const navigate = useNavigate();

    /**
     * Maneja los cambios en los inputs del formulario
     * @param {Event} e - Evento del input
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    /**
     * Valida todos los campos del formulario
     * @returns {boolean} true si es válido, false si hay errores
     */
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre completo
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar teléfono
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'Ingresa un número de teléfono válido';
        }

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        // Validar fecha de nacimiento
        if (!formData.birthDate) {
            newErrors.birthDate = 'La fecha de nacimiento es requerida';
        }

        // Validar dirección
        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        // Validar contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Validar términos y condiciones
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Maneja el envío del formulario de registro
     * Ahora solo valida y abre el modal de verificación
     * @param {Event} e - Evento del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Verificar que el email no exista previamente
            const checkEmailResponse = await fetch('http://localhost:4000/api/email-verification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: formData.email.trim().toLowerCase(),
                    fullName: formData.fullName.trim()
                }),
            });

            const checkEmailData = await checkEmailResponse.json();

            if (checkEmailData.success) {
                // Email disponible, abrir modal de verificación
                setShowEmailVerificationModal(true);
            } else {
                // Email ya existe o error
                if (checkEmailData.message.includes('ya está registrado')) {
                    setErrors({ email: 'Este correo electrónico ya está registrado' });
                } else {
                    setErrors({ general: checkEmailData.message });
                }
            }
        } catch (error) {
            console.error('Error en verificación previa:', error);
            setErrors({ general: 'Error de conexión. Verifica tu internet e intenta nuevamente' });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Maneja el éxito de la verificación de email
     */
    const handleEmailVerificationSuccess = () => {
        setShowEmailVerificationModal(false);
        
        // Navegar al login después de un breve delay
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    /**
     * Cierra el modal de verificación de email
     */
    const closeEmailVerificationModal = () => {
        setShowEmailVerificationModal(false);
    };

    /**
     * Limpia todos los errores del formulario
     */
    const clearErrors = () => {
        setErrors({});
    };

    /**
     * Resetea el formulario a su estado inicial
     */
    const resetForm = () => {
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            birthDate: '',
            address: '',
            password: '',
            acceptTerms: false
        });
        setErrors({});
        setShowEmailVerificationModal(false);
    };

    return {
        formData,
        errors,
        isLoading,
        showEmailVerificationModal,
        handleInputChange,
        handleSubmit,
        handleEmailVerificationSuccess,
        closeEmailVerificationModal,
        clearErrors,
        resetForm,
        setFormData
    };
};

export default useRegisterForm;
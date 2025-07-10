import { useState, useRef } from "react";
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

    // Ref para prevenir múltiples envíos
    const isSubmittingRef = useRef(false);
    const lastSubmitTimeRef = useRef(0);

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
        } else {
            // Validar que la fecha no sea futura
            const today = new Date();
            const birthDate = new Date(formData.birthDate);
            if (birthDate > today) {
                newErrors.birthDate = 'La fecha de nacimiento no puede ser futura';
            }
        }

        // Validar dirección
        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'La dirección debe tener al menos 5 caracteres';
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

        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTimeRef.current;

        console.log('=== INICIO handleSubmit ===');
        console.log('isSubmitting:', isSubmittingRef.current);
        console.log('Tiempo desde último envío:', timeSinceLastSubmit);

        // Prevenir múltiples envíos rápidos
        if (isSubmittingRef.current) {
            console.log('Envío bloqueado: ya está procesando');
            return;
        }

        // Prevenir envíos muy seguidos (menos de 2 segundos)
        if (timeSinceLastSubmit < 2000) {
            console.log('Envío bloqueado: muy pronto desde el último');
            return;
        }

        console.log('Datos del formulario antes de validar:', formData);

        if (!validateForm()) {
            console.log('Errores de validación:', errors);
            return;
        }

        // Marcar como enviando
        isSubmittingRef.current = true;
        lastSubmitTimeRef.current = now;
        setIsLoading(true);
        setErrors({});

        try {
            // Preparar datos para el request
            const requestData = {
                email: formData.email.trim().toLowerCase(),
                fullName: formData.fullName.trim()
            };

            console.log('Enviando solicitud de verificación:', requestData);

            // Verificar que el email no exista previamente
            const checkEmailResponse = await fetch('http://localhost:4000/api/email-verification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const checkEmailData = await checkEmailResponse.json();
            console.log('Respuesta del servidor:', checkEmailData);

            if (checkEmailData.success) {
                // Email disponible, abrir modal de verificación
                console.log('Abriendo modal de verificación');
                setShowEmailVerificationModal(true);
            } else {
                // Email ya existe o error
                if (checkEmailData.message.includes('ya está registrado')) {
                    setErrors({ email: 'Este correo electrónico ya está registrado' });
                } else if (checkEmailData.message.includes('recientemente')) {
                    setErrors({ general: 'Ya se envió un código recientemente. Espera un momento e intenta nuevamente.' });
                } else {
                    setErrors({ general: checkEmailData.message });
                }
            }
        } catch (error) {
            console.error('Error en verificación previa:', error);
            setErrors({ general: 'Error de conexión. Verifica tu internet e intenta nuevamente' });
        } finally {
            setIsLoading(false);
            // Liberar después de un pequeño delay para evitar clics rápidos
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 1000);
        }

        console.log('=== FIN handleSubmit ===');
    };

    /**
     * Maneja el éxito de la verificación de email
     */
    const handleEmailVerificationSuccess = () => {
        console.log('Verificación exitosa, cerrando modal y navegando al login');
        setShowEmailVerificationModal(false);
        
        // Limpiar formulario
        resetForm();
        
        // Navegar al login después de un breve delay
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    /**
     * Cierra el modal de verificación de email
     */
    const closeEmailVerificationModal = () => {
        console.log('Cerrando modal de verificación');
        setShowEmailVerificationModal(false);
        // Resetear estado de envío al cerrar modal
        isSubmittingRef.current = false;
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
        isSubmittingRef.current = false;
        lastSubmitTimeRef.current = 0;
    };

    /**
     * Prepara los datos del usuario para el registro
     * @returns {Object} - Datos del usuario limpios y validados
     */
    const getUserDataForRegistration = () => {
        return {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            birthDate: formData.birthDate,
            address: formData.address.trim(),
            password: formData.password,
            favorites: [],
            discount: null
        };
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
        setFormData,
        getUserDataForRegistration
    };
};

export default useRegisterForm;
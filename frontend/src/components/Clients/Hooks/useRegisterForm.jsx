import { useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar el formulario de registro
 * CORREGIDO: Uso de useCallback para evitar re-renderizados innecesarios
 * Maneja la lógica de validación previa y activación del modal de verificación
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
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        setErrors(prev => {
            if (prev[name] || prev.general) {
                const newErrors = { ...prev };
                delete newErrors[name];
                delete newErrors.general;
                return newErrors;
            }
            return prev;
        });
    }, []);

    /**
     * Valida todos los campos del formulario
     * Memoizada para optimización
     */
    const validateForm = useCallback(() => {
        const newErrors = {};

        // Validar nombre completo
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.fullName.trim())) {
            newErrors.fullName = 'El nombre solo puede contener letras y espacios';
        }

        // Validar teléfono
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^[0-9+\-\s()]+$/.test(formData.phone.trim())) {
            newErrors.phone = 'Ingresa un número de teléfono válido';
        } else if (formData.phone.replace(/[^0-9]/g, '').length < 8) {
            newErrors.phone = 'El teléfono debe tener al menos 8 dígitos';
        }

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        // Validar fecha de nacimiento
        if (!formData.birthDate) {
            newErrors.birthDate = 'La fecha de nacimiento es requerida';
        } else {
            const today = new Date();
            const birthDate = new Date(formData.birthDate);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (birthDate > today) {
                newErrors.birthDate = 'La fecha de nacimiento no puede ser futura';
            } else if (age < 13 || (age === 13 && monthDiff < 0)) {
                newErrors.birthDate = 'Debes tener al menos 13 años para registrarte';
            } else if (age > 120) {
                newErrors.birthDate = 'Por favor ingresa una fecha de nacimiento válida';
            }
        }

        // Validar dirección
        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'La dirección debe tener al menos 5 caracteres';
        }

        // Validar contraseña con requisitos más estrictos
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else {
            const passwordErrors = [];
            
            if (formData.password.length < 8) {
                passwordErrors.push('mínimo 8 caracteres');
            }
            if (!/[A-Z]/.test(formData.password)) {
                passwordErrors.push('una letra mayúscula');
            }
            if (!/[a-z]/.test(formData.password)) {
                passwordErrors.push('una letra minúscula');
            }
            if (!/\d/.test(formData.password)) {
                passwordErrors.push('un número');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
                passwordErrors.push('un carácter especial');
            }
            
            if (passwordErrors.length > 0) {
                newErrors.password = `La contraseña debe tener: ${passwordErrors.join(', ')}`;
            }
        }

        // Validar términos y condiciones
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Debes aceptar los términos y condiciones para continuar';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    /**
     * Valida si el formulario está completamente vacío
     */
    const isFormEmpty = useCallback(() => {
        return !formData.fullName.trim() && 
               !formData.phone.trim() && 
               !formData.email.trim() && 
               !formData.birthDate && 
               !formData.address.trim() && 
               !formData.password && 
               !formData.acceptTerms;
    }, [formData]);

    /**
     * Maneja el envío del formulario de registro
     * Memoizada para evitar re-creaciones
     */
    const handleSubmit = useCallback(async (e) => {
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

        // Verificar si el formulario está completamente vacío
        if (isFormEmpty()) {
            console.log('Formulario enviado vacío - mostrando todos los errores');
            
            // Mostrar errores para todos los campos requeridos
            setErrors({
                fullName: 'El nombre completo es requerido',
                phone: 'El teléfono es requerido',
                email: 'El correo electrónico es requerido',
                birthDate: 'La fecha de nacimiento es requerida',
                address: 'La dirección es requerida',
                password: 'La contraseña es requerida',
                acceptTerms: 'Debes aceptar los términos y condiciones para continuar',
                general: 'Por favor completa todos los campos requeridos'
            });
            
            // Scroll al primer error (parte superior del formulario)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Validación normal del formulario
        if (!validateForm()) {
            console.log('Errores de validación:', errors);
            
            // Scroll al primer error
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
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
            const checkEmailResponse = await fetch('http://localhost:4000/api/emailVerification/request', {
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
    }, [formData, isFormEmpty, validateForm, errors]);

    /**
     * Maneja el éxito de la verificación de email
     */
    const handleEmailVerificationSuccess = useCallback(() => {
        console.log('Verificación exitosa, cerrando modal y navegando al login');
        setShowEmailVerificationModal(false);
        
        // Limpiar formulario
        resetForm();
        
        // Navegar al login después de un breve delay
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    }, [navigate]);

    /**
     * Cierra el modal de verificación de email
     */
    const closeEmailVerificationModal = useCallback(() => {
        console.log('Cerrando modal de verificación');
        setShowEmailVerificationModal(false);
        // Resetear estado de envío al cerrar modal
        isSubmittingRef.current = false;
    }, []);

    /**
     * Limpia todos los errores del formulario
     */
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    /**
     * Resetea el formulario a su estado inicial
     */
    const resetForm = useCallback(() => {
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
    }, []);

    /**
     * Prepara los datos del usuario para el registro
     * @returns {Object} - Datos del usuario limpios y validados
     */
    const getUserDataForRegistration = useCallback(() => {
        return {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            birthDate: formData.birthDate,
            address: formData.address.trim(),
            password: formData.password,
            favorites: [],
            discount: null
        };
    }, [formData]);

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
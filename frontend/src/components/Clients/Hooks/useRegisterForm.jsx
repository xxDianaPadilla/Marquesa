import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el formulario de registro
 * ACTUALIZADO: Sistema de autenticación cross-domain híbrido
 * COMPLETAMENTE OPTIMIZADO: Uso de useCallback y useMemo para evitar re-renderizados innecesarios
 * Maneja la lógica de validación en tiempo real y activación del modal de verificación
 * Incluye validaciones robustas para datos salvadoreños y mejores prácticas de UX
 */
const useRegisterForm = () => {
    // ============ ESTADOS DEL FORMULARIO ============
    
    /**
     * Estado principal que contiene todos los datos del formulario
     * Incluye todos los campos necesarios para el registro de usuario
     */
    const [formData, setFormData] = useState({
        fullName: '',      // Nombre completo del usuario
        phone: '',         // Teléfono en formato salvadoreño
        email: '',         // Correo electrónico
        birthDate: '',     // Fecha de nacimiento
        address: '',       // Dirección completa
        password: '',      // Contraseña
        acceptTerms: false // Aceptación de términos y condiciones
    });

    /**
     * Estado para manejar errores de validación por campo
     * Permite mostrar errores específicos bajo cada input
     */
    const [errors, setErrors] = useState({});

    /**
     * Estado de carga durante operaciones asíncronas
     * Previene múltiples envíos y mejora UX
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Estado para controlar la visibilidad del modal de verificación de email
     * Se activa después de validar el formulario exitosamente
     */
    const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

    /**
     * Estado para mostrar/ocultar la contraseña
     * Mejora la usabilidad del campo de contraseña
     */
    const [showPassword, setShowPassword] = useState(false);

    // ============ REFERENCIAS Y NAVEGACIÓN ============
    
    const navigate = useNavigate();
    
    // ✅ NUEVO: Hook de autenticación para sistema híbrido
    const { getBestAvailableToken, setAuthToken } = useAuth();
    
    /**
     * Ref para prevenir múltiples envíos rápidos
     * Controla que no se pueda enviar el formulario múltiples veces seguidas
     */
    const isSubmittingRef = useRef(false);
    
    /**
     * Ref para controlar tiempo entre envíos
     * Evita spam de solicitudes al servidor
     */
    const lastSubmitTimeRef = useRef(0);

    // ============ REGLAS DE VALIDACIÓN MEMOIZADAS ============
    
    /**
     * Reglas de validación memoizadas para optimizar rendimiento
     * Se recalculan solo cuando es necesario
     */
    const validationRules = useMemo(() => ({
        /**
         * Validación para nombre completo
         * Requiere al menos nombre y apellido
         */
        fullName: (value) => {
            if (!value || !value.trim()) {
                return { isValid: false, error: 'El nombre completo es requerido' };
            }
            
            const trimmed = value.trim();
            
            if (trimmed.length < 3) {
                return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
            }
            
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
                return { isValid: false, error: 'El nombre solo puede contener letras y espacios' };
            }
            
            // Verificar que contenga al menos dos palabras (nombre y apellido)
            const words = trimmed.split(' ').filter(word => word.length > 0);
            if (words.length < 2) {
                return { isValid: false, error: 'Ingresa tu nombre completo (nombre y apellido)' };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación para teléfono salvadoreño
         * Formato esperado: 7XXX-XXXX (números móviles de El Salvador)
         */
        phone: (value) => {
            if (!value || !value.trim()) {
                return { isValid: false, error: 'El teléfono es requerido' };
            }
            
            const cleaned = value.trim();
            
            // Formato salvadoreño: 7XXX-XXXX
            const phoneRegex = /^7\d{3}-\d{4}$/;
            if (!phoneRegex.test(cleaned)) {
                return { isValid: false, error: 'Formato: 7XXX-XXXX (ej: 7123-4567)' };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación para correo electrónico
         * Formato estándar de email con verificaciones adicionales
         */
        email: (value) => {
            if (!value || !value.trim()) {
                return { isValid: false, error: 'El correo electrónico es requerido' };
            }
            
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(value.trim())) {
                return { isValid: false, error: 'El formato del correo electrónico no es válido' };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación para fecha de nacimiento
         * Verifica edad mínima y máxima razonable
         */
        birthDate: (value) => {
            if (!value) {
                return { isValid: false, error: 'La fecha de nacimiento es requerida' };
            }
            
            const today = new Date();
            const birthDate = new Date(value);
            
            // Verificar que la fecha no sea futura
            if (birthDate > today) {
                return { isValid: false, error: 'La fecha de nacimiento no puede ser futura' };
            }
            
            // Calcular edad
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            
            let actualAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                actualAge--;
            }
            
            // Verificar edad mínima (13 años para redes sociales)
            if (actualAge < 13) {
                return { isValid: false, error: 'Debes tener al menos 13 años para registrarte' };
            }
            
            // Verificar edad máxima razonable
            if (actualAge > 120) {
                return { isValid: false, error: 'Por favor ingresa una fecha de nacimiento válida' };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación para dirección
         * Requiere una dirección mínimamente descriptiva
         */
        address: (value) => {
            if (!value || !value.trim()) {
                return { isValid: false, error: 'La dirección es requerida' };
            }
            
            const trimmed = value.trim();
            if (trimmed.length < 10) {
                return { isValid: false, error: 'La dirección debe tener al menos 10 caracteres' };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación robusta para contraseña
         * Requiere múltiples criterios de seguridad
         */
        password: (value) => {
            if (!value) {
                return { isValid: false, error: 'La contraseña es requerida' };
            }
            
            const errors = [];
            
            // Verificar longitud mínima
            if (value.length < 8) {
                errors.push('mínimo 8 caracteres');
            }
            
            // Verificar letra mayúscula
            if (!/[A-Z]/.test(value)) {
                errors.push('una letra mayúscula');
            }
            
            // Verificar letra minúscula
            if (!/[a-z]/.test(value)) {
                errors.push('una letra minúscula');
            }
            
            // Verificar número
            if (!/\d/.test(value)) {
                errors.push('un número');
            }
            
            // Verificar carácter especial
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                errors.push('un carácter especial');
            }
            
            if (errors.length > 0) {
                return { 
                    isValid: false, 
                    error: `La contraseña debe tener: ${errors.join(', ')}` 
                };
            }
            
            return { isValid: true, error: null };
        },

        /**
         * Validación para términos y condiciones
         * Debe estar marcado para continuar
         */
        acceptTerms: (value) => {
            if (!value) {
                return { 
                    isValid: false, 
                    error: 'Debes aceptar los términos y condiciones para continuar' 
                };
            }
            
            return { isValid: true, error: null };
        }
    }), []);

    // ============ NUEVAS FUNCIONES DE AUTENTICACIÓN HÍBRIDA ============
    
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

    // ============ FUNCIONES DE VALIDACIÓN ============
    
    /**
     * Valida un campo específico usando las reglas definidas
     * Memoizada para evitar recálculos innecesarios
     */
    const validateField = useCallback((fieldName, value) => {
        const validator = validationRules[fieldName];
        if (!validator) {
            return { isValid: true, error: null };
        }
        
        return validator(value);
    }, [validationRules]);

    /**
     * Valida todos los campos del formulario
     * Retorna un objeto con el estado de validez y todos los errores
     */
    const validateAllFields = useCallback(() => {
        const newErrors = {};
        let isFormValid = true;

        // Validar cada campo usando las reglas definidas
        Object.keys(validationRules).forEach(fieldName => {
            const fieldValue = formData[fieldName];
            const validation = validateField(fieldName, fieldValue);
            
            if (!validation.isValid) {
                newErrors[fieldName] = validation.error;
                isFormValid = false;
            }
        });

        return { isValid: isFormValid, errors: newErrors };
    }, [formData, validateField, validationRules]);

    /**
     * Verifica si el formulario está completamente vacío
     * Útil para determinar si mostrar errores o no
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

    // ============ ESTADOS COMPUTADOS ============
    
    /**
     * Verifica si el formulario está listo para envío
     * Memoizado para evitar recálculos innecesarios
     */
    const isFormValid = useMemo(() => {
        const validation = validateAllFields();
        return validation.isValid;
    }, [validateAllFields]);

    /**
     * Verifica si la contraseña cumple todos los requisitos de seguridad
     * Útil para mostrar indicadores visuales en tiempo real
     */
    const isPasswordStrong = useMemo(() => {
        if (!formData.password) return false;
        
        const validation = validateField('password', formData.password);
        return validation.isValid;
    }, [formData.password, validateField]);

    /**
     * Cuenta cuántos requisitos de contraseña se cumplen
     * Útil para barras de progreso o indicadores visuales
     */
    const passwordStrength = useMemo(() => {
        const password = formData.password;
        if (!password) return 0;
        
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        return strength;
    }, [formData.password]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja los cambios en los inputs del formulario
     * Incluye validación en tiempo real y formateo automático
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let processedValue = type === 'checkbox' ? checked : value;
        
        // Formateo específico según el campo
        if (name === 'phone') {
            // Formateo automático para teléfono salvadoreño
            let cleanValue = processedValue.replace(/\D/g, ''); // Solo números
            
            if (cleanValue.length > 0 && !cleanValue.startsWith('7')) {
                // Si no empieza con 7, agregar 7 automáticamente si es razonable
                if (cleanValue.length <= 7) {
                    cleanValue = '7' + cleanValue;
                }
            }
            
            // Formatear con guión: 7XXX-XXXX
            if (cleanValue.length > 4) {
                cleanValue = cleanValue.slice(0, 4) + '-' + cleanValue.slice(4, 8);
            }
            
            processedValue = cleanValue;
        } else if (name === 'email') {
            // Convertir email a minúsculas automáticamente
            processedValue = processedValue.toLowerCase();
        }
        
        // Actualizar estado del formulario
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Validación en tiempo real solo si el campo tiene contenido o ya tuvo un error
        if ((type !== 'checkbox' && processedValue.trim()) || errors[name] || type === 'checkbox') {
            const validation = validateField(name, processedValue);
            
            setErrors(prev => {
                const newErrors = { ...prev };
                
                if (validation.error) {
                    newErrors[name] = validation.error;
                } else {
                    delete newErrors[name];
                }
                
                // Limpiar error general cuando el usuario empiece a corregir
                delete newErrors.general;
                
                return newErrors;
            });
        }
    }, [errors, validateField]);

    /**
     * Alterna la visibilidad de la contraseña
     * Memoizada para evitar re-creaciones
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // ============ FUNCIÓN PRINCIPAL DE ENVÍO ACTUALIZADA ============
    
    /**
     * ✅ ACTUALIZADA: Maneja el envío del formulario de registro con sistema híbrido
     * Incluye validación completa, prevención de spam y manejo de errores
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
            const emptyFormErrors = {
                fullName: 'El nombre completo es requerido',
                phone: 'El teléfono es requerido',
                email: 'El correo electrónico es requerido',
                birthDate: 'La fecha de nacimiento es requerida',
                address: 'La dirección es requerida',
                password: 'La contraseña es requerida',
                acceptTerms: 'Debes aceptar los términos y condiciones para continuar',
                general: 'Por favor completa todos los campos requeridos'
            };
            
            setErrors(emptyFormErrors);
            
            // Scroll al primer campo
            const firstField = document.querySelector('[name="fullName"]');
            if (firstField) {
                firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstField.focus();
            }
            
            return;
        }

        // Validación completa del formulario
        const validation = validateAllFields();
        
        if (!validation.isValid) {
            console.log('Errores de validación:', validation.errors);
            
            setErrors(validation.errors);
            
            // Scroll al primer error
            const firstErrorField = Object.keys(validation.errors)[0];
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

            // ✅ NUEVA LÓGICA: Verificar que el email no exista previamente y enviar código con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/emailVerification/request', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify(requestData),
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const checkEmailResponse = await Promise.race([operationPromise, timeoutPromise]);
            const checkEmailData = await checkEmailResponse.json();
            console.log('Respuesta del servidor:', checkEmailData);

            if (checkEmailData.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                let token = null;

                // Primera prioridad: response body
                if (checkEmailData.token) {
                    token = checkEmailData.token;
                    setAuthToken(token); // Guardar en estado local
                }

                // Segunda prioridad: cookie (con retraso)
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getBestAvailableToken();
                    if (token) {
                        setAuthToken(token);
                    }
                }

                // Email disponible, abrir modal de verificación
                console.log('Abriendo modal de verificación');
                setShowEmailVerificationModal(true);
            } else {
                // Email ya existe o error
                if (checkEmailData.message.includes('ya está registrado')) {
                    setErrors({ email: 'Este correo electrónico ya está registrado' });
                } else if (checkEmailData.message.includes('recientemente')) {
                    setErrors({ 
                        general: 'Ya se envió un código recientemente. Espera un momento e intenta nuevamente.' 
                    });
                } else {
                    setErrors({ general: checkEmailData.message });
                }
            }
        } catch (error) {
            console.error('Error en verificación previa:', error);
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
            
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
            // Liberar después de un pequeño delay para evitar clics rápidos
            setTimeout(() => {
                isSubmittingRef.current = false;
            }, 1000);
        }

        console.log('=== FIN handleSubmit ===');
    }, [formData, isFormEmpty, validateAllFields, getAuthHeaders, getBestAvailableToken, setAuthToken]);

    // ============ MANEJADORES DEL MODAL DE VERIFICACIÓN ============
    
    /**
     * Maneja el éxito de la verificación de email
     * Limpia el formulario y navega al login
     */
    const handleEmailVerificationSuccess = useCallback(() => {
        console.log('Verificación exitosa, cerrando modal y navegando al login');
        setShowEmailVerificationModal(false);
        
        // Limpiar formulario
        resetForm();
        
        // Navegar al login después de un breve delay para mostrar el mensaje de éxito
        setTimeout(() => {
            navigate('/login');
        }, 1500);
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

    // ============ FUNCIONES DE UTILIDAD ============
    
    /**
     * Limpia todos los errores del formulario
     * Memoizada para optimizar rendimiento
     */
    const clearErrors = useCallback(() => {
        console.log('🧹 Limpiando errores del formulario');
        setErrors({});
    }, []);

    /**
     * Resetea el formulario a su estado inicial
     * Útil después de registro exitoso o cancelación
     */
    const resetForm = useCallback(() => {
        console.log('🔄 Reseteando formulario completo');
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
        setShowPassword(false);
        setShowEmailVerificationModal(false);
        isSubmittingRef.current = false;
        lastSubmitTimeRef.current = 0;
    }, []);

    /**
     * Prepara los datos del usuario para el registro final
     * Limpia y valida los datos antes de enviarlos al servidor
     * @returns {Object} - Datos del usuario limpios y validados
     */
    const getUserDataForRegistration = useCallback(() => {
        return {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim().toLowerCase(),
            birthDate: formData.birthDate,
            address: formData.address.trim(),
            password: formData.password,
            favorites: [],      // Array vacío por defecto
            discount: null      // Sin descuento inicial
        };
    }, [formData]);

    /**
     * Valida un campo específico y retorna solo si es válido
     * Útil para validaciones externas o condicionales
     */
    const isFieldValid = useCallback((fieldName) => {
        const validation = validateField(fieldName, formData[fieldName]);
        return validation.isValid;
    }, [formData, validateField]);

    /**
     * Obtiene el porcentaje de completitud del formulario
     * Útil para barras de progreso o indicadores visuales
     */
    const getFormProgress = useCallback(() => {
        const totalFields = Object.keys(validationRules).length;
        const validFields = Object.keys(validationRules).filter(fieldName => 
            isFieldValid(fieldName)
        ).length;
        
        return Math.round((validFields / totalFields) * 100);
    }, [validationRules, isFieldValid]);

    // ============ RETORNO DEL HOOK ============
    
    /**
     * Retorna todos los estados y funciones necesarias para el formulario de registro
     * Organizado por categorías para facilitar el uso
     */
    return {
        // ---- Estados principales del formulario ----
        formData,                          // Datos actuales del formulario
        errors,                            // Errores de validación por campo
        isLoading,                         // Estado de carga durante operaciones
        showPassword,                      // Visibilidad de la contraseña
        showEmailVerificationModal,        // Visibilidad del modal de verificación
        
        // ---- Estados computados y validaciones ----
        isFormValid,                       // Si el formulario está listo para envío
        isPasswordStrong,                  // Si la contraseña cumple todos los requisitos
        passwordStrength,                  // Número de requisitos de contraseña cumplidos (0-5)
        
        // ---- Manejadores de eventos principales ----
        handleInputChange,                 // Maneja cambios en todos los inputs
        handleSubmit,                      // Maneja el envío del formulario
        togglePasswordVisibility,          // Alterna visibilidad de contraseña
        
        // ---- Manejadores del modal de verificación ----
        handleEmailVerificationSuccess,    // Maneja éxito en verificación de email
        closeEmailVerificationModal,       // Cierra el modal de verificación
        
        // ---- Funciones de utilidad ----
        clearErrors,                       // Limpia errores del formulario
        resetForm,                         // Resetea formulario completo
        getUserDataForRegistration,        // Prepara datos para registro final
        validateField,                     // Valida un campo específico
        isFieldValid,                      // Verifica si un campo es válido
        getFormProgress,                   // Obtiene porcentaje de completitud
        
        // ---- Funciones avanzadas (para uso especial) ----
        setFormData,                       // Actualizar datos directamente
        setErrors,                         // Actualizar errores directamente
        validateAllFields                  // Validar todos los campos
    };
};

export default useRegisterForm;
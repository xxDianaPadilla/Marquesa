import { useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el formulario de inicio de sesión
 * Proporciona funcionalidades completas de autenticación con sistema de límite de intentos
 */
const useLoginForm = () => {
    // Estados del formulario de login
    const [formData, setFormData] = useState({
        email: '', // Email del usuario
        password: '' // Contraseña del usuario
    });

    // Estados para manejo de errores y validaciones
    const [errors, setErrors] = useState({}); // Errores por campo
    const [isLoading, setIsLoading] = useState(false); // Estado de carga durante envío
    const [showPassword, setShowPassword] = useState(false); // Visibilidad de contraseña
    const [attemptWarning, setAttemptWarning] = useState(null); // Advertencias sobre intentos

    // Hooks de navegación y autenticación
    const navigate = useNavigate();
    const { 
        login, // Función de login del contexto
        lockoutInfo, // Información de bloqueo actual
        checkAccountLockStatus, // Verificar si cuenta está bloqueada
        getAttemptsWarning, // Obtener advertencias de intentos
        rateLimitConfig // Configuración del sistema de límites
    } = useAuth();

    // Reglas de validación para los campos del formulario
    const validationRules = useMemo(() => ({
        // Validación para el campo de email
        email: (email) => {
            if (!email || !email.trim()) {
                return { isValid: false, error: 'El correo electrónico es requerido' };
            }
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(email.trim())) {
                return { isValid: false, error: 'El formato del correo electrónico no es válido' };
            }
            return { isValid: true, error: null };
        },
        // Validación para el campo de contraseña
        password: (password) => {
            if (!password || !password.trim()) {
                return { isValid: false, error: 'La contraseña es requerida' };
            }
            if (password.length < 8) {
                return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
            }
            return { isValid: true, error: null };
        }
    }), []);

    // Función para validar un campo específico
    const validateField = useCallback((fieldName, value) => {
        const validator = validationRules[fieldName];
        if (!validator) return { isValid: true, error: null };
        return validator(value);
    }, [validationRules]);

    // Función para validar todos los campos del formulario
    const validateAllFields = useCallback(() => {
        const newErrors = {};
        let isFormValid = true;

        // Validar email
        const emailValidation = validateField('email', formData.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
            isFormValid = false;
        }

        // Validar contraseña
        const passwordValidation = validateField('password', formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.error;
            isFormValid = false;
        }

        // Verificar si la cuenta está bloqueada
        if (formData.email && isFormValid) {
            const lockStatus = checkAccountLockStatus(formData.email.trim().toLowerCase());
            if (lockStatus.isLocked) {
                newErrors.general = lockStatus.message;
                isFormValid = false;
            }
        }

        return { isValid: isFormValid, errors: newErrors };
    }, [formData.email, formData.password, validateField, checkAccountLockStatus]);

    // Maneja los cambios en los campos de entrada del formulario
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        // Actualizar el valor del campo
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validación en tiempo real si el campo tiene contenido o ya tuvo un error
        if (value.trim() || errors[name]) {
            const validation = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: validation.error,
                general: null // Limpiar error general cuando el usuario corrija
            }));
        }

        // Verificar advertencias sobre intentos cuando se cambie el email
        if (name === 'email' && value.trim()) {
            const cleanEmail = value.trim().toLowerCase();
            const warning = getAttemptsWarning(cleanEmail);
            setAttemptWarning(warning);
            
            // Verificar si la cuenta está bloqueada
            const lockStatus = checkAccountLockStatus(cleanEmail);
            if (lockStatus.isLocked) {
                setErrors(prev => ({
                    ...prev,
                    general: lockStatus.message
                }));
            }
        } else if (name === 'email' && !value.trim()) {
            // Limpiar advertencia si se borra el email
            setAttemptWarning(null);
        }
    }, [errors, validateField, getAttemptsWarning, checkAccountLockStatus]);

    // Alterna la visibilidad de la contraseña
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Función principal para manejar el envío del formulario
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault(); // Prevenir recarga de página

        // Validar formulario completo antes de enviar
        const validation = validateAllFields();
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            // Enfocar el primer campo con error
            const firstErrorField = Object.keys(validation.errors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.focus();
            }
            return;
        }

        // Configurar estado de carga
        setIsLoading(true);
        setErrors({});
        setAttemptWarning(null);

        try {
            // Preparar datos limpios para el envío
            const cleanEmail = formData.email.trim().toLowerCase();
            const cleanPassword = formData.password.trim();
            
            // Crear promesa de login con timeout para conexiones lentas
            const loginPromise = login(cleanEmail, cleanPassword);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            // Ejecutar login con timeout de 30 segundos
            const result = await Promise.race([loginPromise, timeoutPromise]);

            // Procesar resultado del login
            if (result.success) {
                // Login exitoso - limpiar formulario
                setFormData({ email: '', password: '' });
                setErrors({});
                setAttemptWarning(null);
                
                // Pausa para asegurar que el estado se propagó
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } else {
                // Login fallido - manejar errores específicos
                if (result.isAccountLocked) {
                    setErrors({ 
                        general: result.message
                    });
                } else {
                    // Mapear errores específicos del backend a campos del formulario
                    const errorMessage = result.message?.toLowerCase() || '';
                    
                    if (errorMessage.includes('usuario no encontrado') || 
                        errorMessage.includes('user not found') ||
                        errorMessage.includes('not found')) {
                        setErrors({ email: 'No se encontró una cuenta con este correo electrónico' });
                    } else if (errorMessage.includes('contraseña') || 
                              errorMessage.includes('password') || 
                              errorMessage.includes('invalid') ||
                              errorMessage.includes('incorrecta')) {
                        setErrors({ password: 'La contraseña ingresada es incorrecta' });
                        
                        // Mostrar advertencia si hay múltiples líneas en el mensaje
                        const lines = result.message.split('\n');
                        if (lines.length > 1) {
                            const warningLine = lines.find(line => line.includes('Te quedan'));
                            if (warningLine) {
                                setAttemptWarning(warningLine);
                            }
                        }
                    } else if (errorMessage.includes('connection') || 
                              errorMessage.includes('network') ||
                              errorMessage.includes('timeout')) {
                        setErrors({ 
                            general: 'Error de conexión. Verifica tu internet e inténtalo nuevamente.' 
                        });
                    } else {
                        setErrors({ 
                            general: result.message || 'Error en el inicio de sesión. Inténtalo nuevamente.' 
                        });
                    }
                }
            }
        } catch (error) {
            // Manejar diferentes tipos de errores de red
            let errorMessage = 'Error de conexión. Verifica tu internet e inténtalo nuevamente.';
            
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. El servidor puede estar ocupado, inténtalo nuevamente en unos momentos.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Tiempo de espera agotado. El servidor puede estar ocupado, inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
            
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [formData, validateAllFields, login]);

    // Función para limpiar todos los errores del formulario
    const clearErrors = useCallback(() => {
        setErrors({});
        setAttemptWarning(null);
    }, []);

    // Función para limpiar el formulario completo
    const clearForm = useCallback(() => {
        setFormData({ email: '', password: '' });
        setErrors({});
        setAttemptWarning(null);
        setShowPassword(false);
    }, []);

    // Verifica si el formulario está listo para ser enviado
    const isFormValid = useMemo(() => {
        const validation = validateAllFields();
        return validation.isValid;
    }, [validateAllFields]);

    // Verifica si hay errores visibles en el formulario
    const hasErrors = useMemo(() => {
        return Object.keys(errors).length > 0;
    }, [errors]);

    // Verifica si el formulario está bloqueado por límite de intentos
    const isAccountLocked = useMemo(() => {
        return lockoutInfo && lockoutInfo.isLocked;
    }, [lockoutInfo]);

    // Obtiene información de bloqueo formateada para mostrar al usuario
    const lockoutMessage = useMemo(() => {
        if (!lockoutInfo || !lockoutInfo.isLocked) return null;
        
        return {
            message: `Tu cuenta está temporalmente bloqueada. Tiempo restante: ${lockoutInfo.formattedTime}`,
            remainingTime: lockoutInfo.remainingTime,
            formattedTime: lockoutInfo.formattedTime
        };
    }, [lockoutInfo]);

    // Obtiene el estado de progreso hacia el bloqueo
    const lockoutProgress = useMemo(() => {
        if (!formData.email) return null;
        
        const cleanEmail = formData.email.trim().toLowerCase();
        const warning = getAttemptsWarning(cleanEmail);
        
        if (warning) {
            // Extraer número de intentos restantes del mensaje de advertencia
            const match = warning.match(/Te quedan (\d+) intento/);
            if (match) {
                const remaining = parseInt(match[1]);
                const attempted = rateLimitConfig.maxAttempts - remaining;
                const percentage = (attempted / rateLimitConfig.maxAttempts) * 100;
                
                return {
                    attempted, // Intentos realizados
                    remaining, // Intentos restantes
                    maxAttempts: rateLimitConfig.maxAttempts, // Máximo permitido
                    percentage, // Porcentaje de progreso hacia el bloqueo
                    isNearLimit: attempted >= rateLimitConfig.warningThreshold // Si está cerca del límite
                };
            }
        }
        
        return null;
    }, [formData.email, getAttemptsWarning, rateLimitConfig]);

    // Retornar todos los estados y funciones necesarias para el formulario
    return {
        // Estados del formulario
        formData, // Datos actuales del formulario
        errors, // Errores de validación por campo
        isLoading, // Estado de carga durante el envío
        showPassword, // Estado de visibilidad de la contraseña
        
        // Estados computados
        isFormValid, // Si el formulario está listo para envío
        hasErrors, // Si hay errores visibles
        
        // Estados para límite de intentos
        attemptWarning, // Advertencia sobre intentos restantes
        isAccountLocked, // Si la cuenta está bloqueada
        lockoutMessage, // Mensaje de bloqueo formateado
        lockoutProgress, // Progreso hacia el bloqueo
        lockoutInfo, // Información completa de bloqueo
        
        // Manejadores de eventos
        handleInputChange, // Función para manejar cambios en inputs
        handleSubmit, // Función para manejar envío del formulario
        togglePasswordVisibility, // Función para mostrar/ocultar contraseña
        
        // Funciones de utilidad
        clearErrors, // Función para limpiar errores manualmente
        clearForm, // Función para limpiar formulario completo
        setFormData, // Función para actualizar datos del formulario
        validateField, // Función para validar campos individuales
        checkAccountLockStatus, // Función para verificar bloqueo manualmente
        
        // Configuración
        rateLimitConfig // Configuración del sistema de límites
    };
};

export default useLoginForm;
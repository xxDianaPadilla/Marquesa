import { useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el formulario de inicio de sesión con límite de intentos
 * MEJORADO: Incluye sistema completo de rate limiting y bloqueo temporal
 * Proporciona funcionalidades completas de autenticación:
 * - Manejo de campos del formulario (email, password)
 * - Validaciones en tiempo real del lado cliente
 * - Integración con el sistema de autenticación
 * - Sistema de límite de intentos fallidos con bloqueo temporal
 * - Manejo de errores específicos con mensajes amigables
 * - Advertencias sobre intentos restantes
 * - Redirección automática después del login exitoso
 * 
 * @returns {Object} Objeto con estados y funciones del formulario de login
 */
const useLoginForm = () => {
    // ============ ESTADOS DEL FORMULARIO ============
    
    /**
     * Estado que contiene los datos del formulario de login
     * - email: Dirección de correo electrónico del usuario
     * - password: Contraseña del usuario
     */
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    /**
     * Estado para manejar errores de validación y del servidor
     * Cada campo puede tener su propio error, más un error general
     */
    const [errors, setErrors] = useState({});

    /**
     * Estado para mostrar indicador de carga durante el proceso de login
     * Previene múltiples envíos y mejora la experiencia del usuario
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Estado para controlar la visibilidad de la contraseña
     * Permite al usuario alternar entre texto plano y oculto
     */
    const [showPassword, setShowPassword] = useState(false);

    /**
     * NUEVO: Estado para mostrar advertencias sobre intentos de login
     * Informa al usuario sobre intentos restantes antes del bloqueo
     */
    const [attemptWarning, setAttemptWarning] = useState(null);

    // ============ HOOKS DE NAVEGACIÓN Y AUTENTICACIÓN ============
    
    const navigate = useNavigate(); // Hook para redireccionar programáticamente
    
    // Hook para acceder al contexto de autenticación con nuevas funcionalidades
    const { 
        login, 
        lockoutInfo, 
        checkAccountLockStatus, 
        getAttemptsWarning,
        rateLimitConfig 
    } = useAuth();

    // ============ VALIDACIONES MEMOIZADAS ============
    
    /**
     * Reglas de validación memoizadas para optimizar rendimiento
     * Se recalculan solo cuando cambian las dependencias
     */
    const validationRules = useMemo(() => ({
        /**
         * Validación para el campo de email
         * @param {string} email - Email a validar
         * @returns {Object} Resultado de la validación
         */
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

        /**
         * Validación para el campo de contraseña
         * @param {string} password - Contraseña a validar
         * @returns {Object} Resultado de la validación
         */
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

    // ============ FUNCIONES DE VALIDACIÓN ============
    
    /**
     * Valida un campo específico en tiempo real
     * Memoizada para evitar recálculos innecesarios
     */
    const validateField = useCallback((fieldName, value) => {
        const validator = validationRules[fieldName];
        if (!validator) return { isValid: true, error: null };
        
        return validator(value);
    }, [validationRules]);

    /**
     * Valida todos los campos del formulario
     * MEJORADO: Incluye verificación de bloqueo de cuenta
     * Implementa validaciones del lado cliente para mejorar UX
     * Memoizada para optimizar rendimiento
     */
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

        // NUEVO: Verificar si la cuenta está bloqueada
        if (formData.email && isFormValid) {
            const lockStatus = checkAccountLockStatus(formData.email.trim().toLowerCase());
            if (lockStatus.isLocked) {
                newErrors.general = lockStatus.message;
                isFormValid = false;
            }
        }

        return { isValid: isFormValid, errors: newErrors };
    }, [formData.email, formData.password, validateField, checkAccountLockStatus]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja los cambios en los campos de entrada del formulario
     * MEJORADO: Incluye verificación de advertencias sobre intentos
     * Actualiza el estado del formulario y ejecuta validación en tiempo real
     * Memoizada para evitar re-creaciones innecesarias
     * 
     * @param {Event} e - Evento de cambio del input
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        
        // Actualizar el valor del campo correspondiente
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validación en tiempo real solo si el campo ya tiene contenido o ya tuvo un error
        if (value.trim() || errors[name]) {
            const validation = validateField(name, value);
            
            setErrors(prev => ({
                ...prev,
                [name]: validation.error,
                // Limpiar error general cuando el usuario empiece a corregir
                general: null
            }));
        }

        // NUEVO: Verificar advertencias sobre intentos cuando se cambie el email
        if (name === 'email' && value.trim()) {
            const cleanEmail = value.trim().toLowerCase();
            const warning = getAttemptsWarning(cleanEmail);
            setAttemptWarning(warning);
            
            // También verificar si la cuenta está bloqueada
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

    /**
     * Alterna la visibilidad de la contraseña
     * Memoizada para evitar re-creaciones
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // ============ FUNCIÓN PRINCIPAL DE ENVÍO ============
    
    /**
     * Maneja el envío del formulario de inicio de sesión
     * MEJORADO: Integración completa con sistema de límite de intentos
     * Ejecuta validaciones completas, llama al servicio de autenticación y maneja la respuesta
     * Memoizada para optimizar rendimiento
     * 
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault(); // Prevenir recarga de página

        console.log('Iniciando proceso de login con verificación de límites...');

        // ---- Validar formulario completo antes de enviar ----
        const validation = validateAllFields();
        
        if (!validation.isValid) {
            console.log('Formulario inválido, mostrando errores:', validation.errors);
            setErrors(validation.errors);
            
            // Enfocar el primer campo con error
            const firstErrorField = Object.keys(validation.errors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.focus();
            }
            
            return;
        }

        // ---- Configurar estado de carga ----
        setIsLoading(true);
        setErrors({}); // Limpiar errores previos
        setAttemptWarning(null); // Limpiar advertencias previas

        try {
            console.log('Enviando credenciales al servidor...');
            
            // Preparar datos limpios para el envío
            const cleanEmail = formData.email.trim().toLowerCase();
            const cleanPassword = formData.password.trim();
            
            // ---- Llamar al método de login del contexto de autenticación ----
            const result = await login(cleanEmail, cleanPassword);

            console.log('Respuesta recibida del servidor:', result.success ? 'Éxito' : 'Error');

            // ---- Procesar resultado del login ----
            if (result.success) {
                // Login exitoso - el AuthContext maneja la redirección automáticamente
                console.log('Login exitoso, redirigiendo...');
                
                // Limpiar formulario por seguridad
                setFormData({ email: '', password: '' });
                setErrors({});
                setAttemptWarning(null);
                
                // Nota: La redirección se maneja en el AuthContext o en el componente padre
                
            } else {
                // Login fallido - mostrar errores específicos
                console.log('Login fallido:', result.message);
                
                // ---- Verificar si es un bloqueo de cuenta ----
                if (result.isAccountLocked) {
                    console.log('Cuenta bloqueada detectada');
                    setErrors({ 
                        general: result.message
                    });
                } else {
                    // ---- Mapear errores específicos del backend a campos del formulario ----
                    const errorMessage = result.message?.toLowerCase() || '';
                    
                    if (errorMessage.includes('usuario no encontrado') || 
                        errorMessage.includes('user not found')) {
                        // Usuario no existe en el sistema
                        setErrors({ email: 'No se encontró una cuenta con este correo electrónico' });
                    } else if (errorMessage.includes('contraseña') || 
                              errorMessage.includes('password') || 
                              errorMessage.includes('invalid')) {
                        // Contraseña incorrecta
                        setErrors({ password: 'La contraseña ingresada es incorrecta' });
                        
                        // Mostrar advertencia si hay múltiples líneas (incluye advertencia de intentos)
                        const lines = result.message.split('\n');
                        if (lines.length > 1) {
                            const warningLine = lines.find(line => line.includes('⚠️'));
                            if (warningLine) {
                                setAttemptWarning(warningLine.replace('⚠️ ', ''));
                            }
                        }
                    } else {
                        // Error general o no especificado
                        setErrors({ 
                            general: result.message || 'Error en el inicio de sesión. Inténtalo nuevamente.' 
                        });
                    }
                }
            }
        } catch (error) {
            // ---- Manejar errores de red o del sistema ----
            console.error('Error durante el login:', error);
            
            let errorMessage = 'Error de conexión. Verifica tu internet e inténtalo nuevamente.';
            
            // Personalizar mensaje según el tipo de error
            if (error.name === 'TypeError') {
                errorMessage = 'Error de conexión con el servidor. Verifica tu internet.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            }
            
            setErrors({ general: errorMessage });
        } finally {
            // ---- Limpiar estado de carga ----
            setIsLoading(false);
        }
    }, [formData, validateAllFields, login]);

    // ============ FUNCIONES DE UTILIDAD ============
    
    /**
     * Limpia todos los errores del formulario
     * MEJORADO: También limpia advertencias de intentos
     * Útil para resetear el estado de errores manualmente
     * Memoizada para optimizar rendimiento
     */
    const clearErrors = useCallback(() => {
        console.log('Limpiando errores del formulario');
        setErrors({});
        setAttemptWarning(null);
    }, []);

    /**
     * Limpia el formulario completo
     * MEJORADO: También limpia advertencias de intentos
     * Útil para resetear el estado después de logout o cambio de página
     * Memoizada para optimizar rendimiento
     */
    const clearForm = useCallback(() => {
        console.log('Limpiando formulario completo');
        setFormData({ email: '', password: '' });
        setErrors({});
        setAttemptWarning(null);
        setShowPassword(false);
    }, []);

    /**
     * Verifica si el formulario está listo para ser enviado
     * MEJORADO: Considera bloqueo de cuenta en la validación
     * Memoizada para evitar recálculos innecesarios
     */
    const isFormValid = useMemo(() => {
        const validation = validateAllFields();
        return validation.isValid;
    }, [validateAllFields]);

    /**
     * Verifica si hay errores visibles en el formulario
     * Útil para mostrar/ocultar mensajes de error globales
     */
    const hasErrors = useMemo(() => {
        return Object.keys(errors).length > 0;
    }, [errors]);

    /**
     * NUEVO: Verifica si el formulario está bloqueado por límite de intentos
     * Útil para deshabilitar el formulario durante el bloqueo
     */
    const isAccountLocked = useMemo(() => {
        return lockoutInfo && lockoutInfo.isLocked;
    }, [lockoutInfo]);

    /**
     * NUEVO: Obtiene información de bloqueo formateada para mostrar al usuario
     */
    const lockoutMessage = useMemo(() => {
        if (!lockoutInfo || !lockoutInfo.isLocked) return null;
        
        return {
            message: `Tu cuenta está temporalmente bloqueada. Tiempo restante: ${lockoutInfo.formattedTime}`,
            remainingTime: lockoutInfo.remainingTime,
            formattedTime: lockoutInfo.formattedTime
        };
    }, [lockoutInfo]);

    /**
     * NUEVO: Obtiene el estado de progreso hacia el bloqueo
     * Útil para mostrar barras de progreso o indicadores visuales
     */
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
                    attempted,
                    remaining,
                    maxAttempts: rateLimitConfig.maxAttempts,
                    percentage,
                    isNearLimit: attempted >= rateLimitConfig.warningThreshold
                };
            }
        }
        
        return null;
    }, [formData.email, getAttemptsWarning, rateLimitConfig]);

    // ============ RETORNO DEL HOOK ============
    
    /**
     * Retorna todos los estados y funciones necesarias para el formulario de login
     * EXPANDIDO: Incluye nuevas funcionalidades de límite de intentos
     * Los componentes que usen este hook tendrán acceso completo a la funcionalidad
     */
    return {
        // ---- Estados del formulario (EXISTENTES) ----
        formData,              // Datos actuales del formulario (email, password)
        errors,                // Errores de validación por campo
        isLoading,             // Estado de carga durante el envío
        showPassword,          // Estado de visibilidad de la contraseña
        
        // ---- Estados computados (EXISTENTES) ----
        isFormValid,           // Si el formulario está listo para envío
        hasErrors,             // Si hay errores visibles
        
        // ---- NUEVOS ESTADOS para límite de intentos ----
        attemptWarning,        // Advertencia sobre intentos restantes
        isAccountLocked,       // Si la cuenta está bloqueada
        lockoutMessage,        // Mensaje de bloqueo formateado
        lockoutProgress,       // Progreso hacia el bloqueo
        lockoutInfo,           // Información completa de bloqueo del contexto
        
        // ---- Manejadores de eventos (EXISTENTES) ----
        handleInputChange,     // Función para manejar cambios en inputs
        handleSubmit,          // Función para manejar envío del formulario
        togglePasswordVisibility, // Función para mostrar/ocultar contraseña
        
        // ---- Funciones de utilidad (EXISTENTES) ----
        clearErrors,           // Función para limpiar errores manualmente
        clearForm,             // Función para limpiar formulario completo
        setFormData,           // Función para actualizar datos del formulario (uso avanzado)
        validateField,         // Función para validar campos individuales
        
        // ---- NUEVAS FUNCIONES de utilidad ----
        checkAccountLockStatus, // Función para verificar bloqueo manualmente
        
        // ---- NUEVAS CONSTANTES útiles ----
        rateLimitConfig        // Configuración del sistema de límites
    };
};

export default useLoginForm;
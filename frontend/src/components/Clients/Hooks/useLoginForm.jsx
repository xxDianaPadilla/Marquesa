import { useState, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el formulario de inicio de sesión
 * OPTIMIZADO: Uso de useCallback y useMemo para evitar re-renderizados innecesarios
 * Proporciona funcionalidades completas de autenticación:
 * - Manejo de campos del formulario (email, password)
 * - Validaciones en tiempo real del lado cliente
 * - Integración con el sistema de autenticación
 * - Manejo de errores específicos con mensajes amigables
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

    // ============ HOOKS DE NAVEGACIÓN Y AUTENTICACIÓN ============
    
    const navigate = useNavigate(); // Hook para redireccionar programáticamente
    const { login } = useAuth(); // Hook para acceder a la función de login del contexto

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

        return { isValid: isFormValid, errors: newErrors };
    }, [formData.email, formData.password, validateField]);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja los cambios en los campos de entrada del formulario
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
    }, [errors, validateField]);

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
     * Ejecuta validaciones completas, llama al servicio de autenticación y maneja la respuesta
     * Memoizada para optimizar rendimiento
     * 
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault(); // Prevenir recarga de página

        console.log('🔐 Iniciando proceso de login...');

        // ---- Validar formulario completo antes de enviar ----
        const validation = validateAllFields();
        
        if (!validation.isValid) {
            console.log('❌ Formulario inválido, mostrando errores:', validation.errors);
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

        try {
            console.log('📡 Enviando credenciales al servidor...');
            
            // Preparar datos limpios para el envío
            const cleanEmail = formData.email.trim().toLowerCase();
            const cleanPassword = formData.password.trim();
            
            // ---- Llamar al método de login del contexto de autenticación ----
            const result = await login(cleanEmail, cleanPassword);

            console.log('📥 Respuesta recibida del servidor:', result.success ? 'Éxito' : 'Error');

            // ---- Procesar resultado del login ----
            if (result.success) {
                // Login exitoso - el AuthContext maneja la redirección automáticamente
                console.log('✅ Login exitoso, redirigiendo...');
                
                // Limpiar formulario por seguridad
                setFormData({ email: '', password: '' });
                setErrors({});
                
                // Nota: La redirección se maneja en el AuthContext o en el componente padre
                
            } else {
                // Login fallido - mostrar errores específicos
                console.log('❌ Login fallido:', result.message);
                
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
                } else {
                    // Error general o no especificado
                    setErrors({ 
                        general: result.message || 'Error en el inicio de sesión. Inténtalo nuevamente.' 
                    });
                }
            }
        } catch (error) {
            // ---- Manejar errores de red o del sistema ----
            console.error('💥 Error durante el login:', error);
            
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
     * Útil para resetear el estado de errores manualmente
     * Memoizada para optimizar rendimiento
     */
    const clearErrors = useCallback(() => {
        console.log('🧹 Limpiando errores del formulario');
        setErrors({});
    }, []);

    /**
     * Limpia el formulario completo
     * Útil para resetear el estado después de logout o cambio de página
     * Memoizada para optimizar rendimiento
     */
    const clearForm = useCallback(() => {
        console.log('🗑️ Limpiando formulario completo');
        setFormData({ email: '', password: '' });
        setErrors({});
        setShowPassword(false);
    }, []);

    /**
     * Verifica si el formulario está listo para ser enviado
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

    // ============ RETORNO DEL HOOK ============
    
    /**
     * Retorna todos los estados y funciones necesarias para el formulario de login
     * Los componentes que usen este hook tendrán acceso completo a la funcionalidad
     */
    return {
        // ---- Estados del formulario ----
        formData,              // Datos actuales del formulario (email, password)
        errors,                // Errores de validación por campo
        isLoading,             // Estado de carga durante el envío
        showPassword,          // Estado de visibilidad de la contraseña
        
        // ---- Estados computados ----
        isFormValid,           // Si el formulario está listo para envío
        hasErrors,             // Si hay errores visibles
        
        // ---- Manejadores de eventos ----
        handleInputChange,     // Función para manejar cambios en inputs
        handleSubmit,          // Función para manejar envío del formulario
        togglePasswordVisibility, // Función para mostrar/ocultar contraseña
        
        // ---- Funciones de utilidad ----
        clearErrors,           // Función para limpiar errores manualmente
        clearForm,             // Función para limpiar formulario completo
        setFormData,           // Función para actualizar datos del formulario (uso avanzado)
        validateField          // Función para validar campos individuales
    };
};

export default useLoginForm;
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el formulario de inicio de sesión
 * Proporciona funcionalidades completas de autenticación:
 * - Manejo de campos del formulario (email, password)
 * - Validaciones del lado cliente
 * - Integración con el sistema de autenticación
 * - Manejo de errores específicos
 * - Redirección automática después del login
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

    // ============ HOOKS DE NAVEGACIÓN Y AUTENTICACIÓN ============
    
    const navigate = useNavigate(); // Hook para redireccionar programáticamente
    const { login } = useAuth(); // Hook para acceder a la función de login del contexto

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja los cambios en los campos de entrada del formulario
     * Actualiza el estado del formulario y limpia errores relacionados
     * 
     * @param {Event} e - Evento de cambio del input
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Actualizar el valor del campo correspondiente
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        // Esto mejora la UX al no mostrar errores obsoletos
        if(errors[name]){
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // ============ FUNCIONES DE VALIDACIÓN ============
    
    /**
     * Valida todos los campos del formulario antes del envío
     * Implementa validaciones del lado cliente para mejorar UX
     * 
     * @returns {boolean} true si todos los campos son válidos, false en caso contrario
     */
    const validateForm = () => {
        const newErrors = {};

        // ---- Validación del email ----
        if(!formData.email.trim()){
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)){
            // Regex básico para validar formato de email
            newErrors.email = 'El correo electrónico no es válido';
        }

        // ---- Validación de la contraseña ----
        if(!formData.password.trim()){
            newErrors.password = 'La contraseña es requerida';
        } else if(formData.password.length < 6){ 
            // Validar longitud mínima de contraseña
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Actualizar estado de errores
        setErrors(newErrors);
        
        // Retornar true si no hay errores
        return Object.keys(newErrors).length === 0;
    };

    // ============ FUNCIÓN PRINCIPAL DE ENVÍO ============
    
    /**
     * Maneja el envío del formulario de inicio de sesión
     * Ejecuta validaciones, llama al servicio de autenticación y maneja la respuesta
     * 
     * @param {Event} e - Evento de envío del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenir recarga de página

        console.log('🔐 Iniciando proceso de login...');

        // ---- Validar formulario antes de enviar ----
        if(!validateForm()){
            console.log('❌ Formulario inválido, abortando login');
            return;
        }

        // ---- Configurar estado de carga ----
        setIsLoading(true);
        setErrors({}); // Limpiar errores previos

        try {
            console.log('📡 Enviando credenciales al servidor...');
            
            // ---- Llamar al método de login del contexto de autenticación ----
            const result = await login(formData.email.trim(), formData.password);

            console.log('📥 Respuesta recibida del servidor:', result.success ? 'Éxito' : 'Error');

            // ---- Procesar resultado del login ----
            if(result.success){
                // Login exitoso - el AuthContext maneja la redirección automáticamente
                console.log('✅ Login exitoso, redirigiendo...');
                // No es necesario redireccionar manualmente aquí
                // El AuthContext se encarga de la redirección basada en el tipo de usuario
            } else {
                // Login fallido - mostrar errores específicos
                console.log('❌ Login fallido:', result.message);
                
                // ---- Mapear errores específicos del backend a campos del formulario ----
                let errorMessage = 'Error en el inicio de sesión';
                
                if(result.message === 'user not found'){
                    // Usuario no existe en el sistema
                    setErrors({ email: 'Usuario no encontrado' });
                } else if (result.message === 'Invalid password'){
                    // Contraseña incorrecta
                    setErrors({ password: 'Contraseña incorrecta' });
                } else {
                    // Error general o no especificado
                    setErrors({ general: result.message || errorMessage });
                }
            }
        } catch (error) {
            // ---- Manejar errores de red o del sistema ----
            console.error('💥 Error durante el login:', error);
            setErrors({ 
                general: 'Error de conexión. Intente nuevamente' 
            });
        } finally {
            // ---- Limpiar estado de carga ----
            setIsLoading(false);
        }
    };

    // ============ FUNCIONES DE UTILIDAD ============
    
    /**
     * Limpia todos los errores del formulario
     * Útil para resetear el estado de errores manualmente
     */
    const clearErrors = () => {
        console.log('🧹 Limpiando errores del formulario');
        setErrors({});
    };

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

        // ---- Manejadores de eventos ----
        handleInputChange,     // Función para manejar cambios en inputs
        handleSubmit,          // Función para manejar envío del formulario

        // ---- Funciones de utilidad ----
        clearErrors,           // Función para limpiar errores manualmente
        setFormData            // Función para actualizar datos del formulario (uso avanzado)
    };
};

export default useLoginForm;
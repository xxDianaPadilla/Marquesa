import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Hook personalizado para manejar el proceso de registro de usuarios
const useRegister = () => {
    // Estado para controlar si está en proceso de registro
    const [isRegistering, setIsRegistering] = useState(false);
    // Estado para almacenar errores de validación de campos específicos
    const [fieldErrors, setFieldErrors] = useState({});
    // Estado para mensaje de error general
    const [generalError, setGeneralError] = useState('');

    // Obtener función de registro del contexto de autenticación
    const { register: authRegister } = useAuth();

    // Función para validar formato de email según el backend
    const validateEmail = (email) => {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email es requerido' };
        }
        
        const trimmedEmail = email.trim().toLowerCase();
        
        if (trimmedEmail.length === 0) {
            return { isValid: false, error: 'Email no puede estar vacío' };
        }
        
        if (trimmedEmail.length > 254) {
            return { isValid: false, error: 'Email demasiado largo' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'Formato de email no válido' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para validar formato de teléfono según el backend
    const validatePhone = (phone) => {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, error: 'Teléfono es requerido' };
        }
        
        const trimmedPhone = phone.trim();
        
        if (trimmedPhone.length === 0) {
            return { isValid: false, error: 'Teléfono no puede estar vacío' };
        }
        
        // Validar formato de teléfono (permite números, espacios, guiones y paréntesis)
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(trimmedPhone)) {
            return { isValid: false, error: 'Formato de teléfono no válido' };
        }
        
        // Extraer solo números para validar longitud
        const numbersOnly = trimmedPhone.replace(/\D/g, '');
        if (numbersOnly.length < 8 || numbersOnly.length > 15) {
            return { isValid: false, error: 'Teléfono debe tener entre 8 y 15 dígitos' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para formatear teléfono automáticamente mientras el usuario escribe
    const formatPhoneInput = (input) => {
        // Remover todo lo que no sean números
        const numbersOnly = input.replace(/[^\d]/g, '');
        
        // Limitar a 8 dígitos máximo
        const limitedNumbers = numbersOnly.slice(0, 8);
        
        // Formatear automáticamente con guión después del 4to dígito
        if (limitedNumbers.length <= 4) {
            return limitedNumbers;
        } else {
            return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
        }
    };

    // Función para formatear teléfono a formato xxxx-xxxx final
    const formatPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (cleanPhone.length === 8) {
            return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4, 8)}`;
        }
        return phone;
    };

    // Función para validar contraseña según el backend
    const validatePassword = (password) => {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'Contraseña es requerida' };
        }
        
        if (password.length < 8) {
            return { isValid: false, error: 'Contraseña debe tener al menos 8 caracteres' };
        }
        
        if (password.length > 128) {
            return { isValid: false, error: 'Contraseña demasiado larga' };
        }
        
        // Validar complejidad
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumbers) {
            return { isValid: false, error: 'Contraseña debe contener al menos una mayúscula, una minúscula y un número' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para validar fecha de nacimiento según el backend (12 años mínimo, 120 máximo)
const validateBirthDate = (dateString) => {
    if (!dateString) {
        return { isValid: false, error: 'Fecha de nacimiento es requerida' };
    }
    
    try {
        // Parsear fecha en formato DD/MM/YYYY
        const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
        
        // Crear fecha con el día correcto
        const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
        
        // Verificar que los componentes de la fecha sean válidos
        if (
            date.getDate() !== day || 
            date.getMonth() !== month - 1 || 
            date.getFullYear() !== year ||
            isNaN(date.getTime())
        ) {
            return { isValid: false, error: 'Fecha de nacimiento no válida' };
        }
        
        // Verificar que no sea en el futuro
        const today = new Date();
        if (date > today) {
            return { isValid: false, error: 'Fecha de nacimiento no puede ser en el futuro' };
        }
        
        // Calcular edad correctamente
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        
        // Si no ha llegado el mes de cumpleaños, o si es el mes pero no ha llegado el día, restar 1 año
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        
        // Verificar edad mínima (12 años)
        if (age < 12) {
            return { isValid: false, error: `Debe tener al menos 12 años` };
        }
        
        // Verificar edad máxima (120 años)
        if (age > 120) {
            return { isValid: false, error: 'Fecha de nacimiento no válida' };
        }
        
        return { isValid: true, error: null };
    } catch (error) {
        console.error('Error validando fecha:', error);
        return { isValid: false, error: 'Fecha de nacimiento no válida' };
    }
};

    // Función para validar nombre completo según el backend
    const validateFullName = (fullName) => {
        if (!fullName || typeof fullName !== 'string') {
            return { isValid: false, error: 'Nombre completo es requerido' };
        }
        
        const trimmedName = fullName.trim();
        
        if (trimmedName.length === 0) {
            return { isValid: false, error: 'Nombre completo no puede estar vacío' };
        }
        
        // El backend requiere al menos 2 caracteres, pero el modelo requiere 10
        if (trimmedName.length < 10) {
            return { isValid: false, error: 'Nombre completo debe tener al menos 10 caracteres para asegurar nombre y apellido' };
        }
        
        if (trimmedName.length > 100) {
            return { isValid: false, error: 'Nombre completo demasiado largo' };
        }
        
        // Validar que solo contenga letras, espacios y algunos caracteres especiales
        const nameRegex = /^[a-zA-ZàáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜñÑ\s\-\.\']+$/;
        if (!nameRegex.test(trimmedName)) {
            return { isValid: false, error: 'Nombre completo contiene caracteres no válidos' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para validar dirección según el backend
    const validateAddress = (address) => {
        if (!address || typeof address !== 'string') {
            return { isValid: false, error: 'Dirección es requerida' };
        }
        
        const trimmedAddress = address.trim();
        
        if (trimmedAddress.length === 0) {
            return { isValid: false, error: 'Dirección no puede estar vacía' };
        }
        
        // El modelo requiere al menos 10 caracteres
        if (trimmedAddress.length < 10) {
            return { isValid: false, error: 'Dirección debe tener al menos 10 caracteres para dirección completa' };
        }
        
        if (trimmedAddress.length > 200) {
            return { isValid: false, error: 'Dirección demasiado larga' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para validar todos los campos usando las funciones individuales
    const validateAllFields = (formData) => {
        const errors = {};

        // Validar nombre completo
        const nameValidation = validateFullName(formData.nombre);
        if (!nameValidation.isValid) {
            errors.nombre = nameValidation.error;
        }

        // Validar teléfono
        const phoneValidation = validatePhone(formData.telefono);
        if (!phoneValidation.isValid) {
            errors.telefono = phoneValidation.error;
        }

        // Validar email
        const emailValidation = validateEmail(formData.correo);
        if (!emailValidation.isValid) {
            errors.correo = emailValidation.error;
        }

        // Validar fecha de nacimiento
        const birthDateValidation = validateBirthDate(formData.fechaNacimiento);
        if (!birthDateValidation.isValid) {
            errors.fechaNacimiento = birthDateValidation.error;
        }

        // Validar dirección
        const addressValidation = validateAddress(formData.direccion);
        if (!addressValidation.isValid) {
            errors.direccion = addressValidation.error;
        }

        // Validar contraseña
        const passwordValidation = validatePassword(formData.contrasena);
        if (!passwordValidation.isValid) {
            errors.contrasena = passwordValidation.error;
        }

        return errors;
    };

    // Función para verificar si el email existe en el backend
    const checkEmailExists = async (email) => {
        try {
            console.log('Verificando si el email existe:', email);
            
            const response = await fetch('https://marquesa.onrender.com/api/emailVerification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    fullName: null // Solo para verificar existencia
                })
            });

            const data = await response.json();
            console.log('Respuesta de verificación de email:', data);

            // Si el correo ya está registrado
            if (!data.success && data.message && data.message.includes('ya está registrado')) {
                return { 
                    exists: true, 
                    message: 'Este correo electrónico ya está registrado' 
                };
            }

            // Si no está registrado, está disponible
            return { exists: false, message: null };

        } catch (error) {
            console.error('Error verificando email:', error);
            return { 
                exists: false, 
                message: null,
                error: 'Error de conexión al verificar el email'
            };
        }
    };

    // Función principal para manejar el proceso de registro por pasos
    const handleRegisterProcess = async (formData) => {
        try {
            console.log('=== INICIANDO PROCESO DE REGISTRO ===');
            
            // PASO 1: Validar todos los campos localmente
            console.log('Paso 1: Validando campos localmente...');
            setFieldErrors({}); // Limpiar errores previos
            setGeneralError('');
            
            const validationErrors = validateAllFields(formData);
            
            if (Object.keys(validationErrors).length > 0) {
                console.log('Errores de validación encontrados:', validationErrors);
                setFieldErrors(validationErrors);
                return { 
                    success: false, 
                    step: 'validation',
                    errors: validationErrors,
                    message: 'Por favor corrige los errores en el formulario' 
                };
            }
            
            console.log('Paso 1 completado: Todos los campos son válidos');
            
            // PASO 2: Verificar si el email existe
            console.log('Paso 2: Verificando disponibilidad del email...');
            const emailCheck = await checkEmailExists(formData.correo);
            
            if (emailCheck.error) {
                setGeneralError(emailCheck.error);
                return { 
                    success: false, 
                    step: 'email_check',
                    message: emailCheck.error 
                };
            }
            
            if (emailCheck.exists) {
                console.log('Email ya existe, mostrando error');
                setGeneralError(emailCheck.message);
                return { 
                    success: false, 
                    step: 'email_exists',
                    message: emailCheck.message 
                };
            }
            
            console.log('Paso 2 completado: Email disponible');
            
            // PASO 3: Todo está bien, proceder con verificación
            console.log('Pasos completados exitosamente, procediendo a verificación de email');
            return { 
                success: true, 
                step: 'ready_for_verification',
                message: 'Validación completada, procediendo a verificación de email' 
            };

        } catch (error) {
            console.error('Error en proceso de registro:', error);
            const errorMessage = error.message || 'Error inesperado en el proceso de registro';
            setGeneralError(errorMessage);
            return { 
                success: false, 
                step: 'error',
                message: errorMessage 
            };
        }
    };

    // Función principal para procesar el registro (mantenida para compatibilidad)
    const handleRegister = async (formData, onlyValidate = false) => {
        try {
            if (!onlyValidate) {
                setIsRegistering(true);
            }
            setGeneralError('');
            setFieldErrors({});

            // Si solo es validación local, usar la nueva función
            if (onlyValidate) {
                const validationErrors = validateAllFields(formData);
                if (Object.keys(validationErrors).length > 0) {
                    setFieldErrors(validationErrors);
                    return { success: false, errors: validationErrors };
                }
                return { success: true };
            }

            // Para registro completo, formatear datos y llamar al backend
            const registerData = {
                fullName: formData.nombre.trim(),
                phone: formatPhone(formData.telefono),
                email: formData.correo.trim().toLowerCase(),
                birthDate: formData.fechaNacimiento,
                address: formData.direccion.trim(),
                password: formData.contrasena
            };

            // Llamar a la función de registro del contexto
            const result = await authRegister(registerData);
            
            if (result.success) {
                return { success: true, message: result.message };
            } else {
                setGeneralError(result.message || 'Error al registrar usuario');
                return { success: false, message: result.message };
            }

        } catch (error) {
            const errorMessage = error.message || 'Error de conexión. Inténtalo nuevamente.';
            if (!onlyValidate) {
                setGeneralError(errorMessage);
            }
            return { success: false, message: errorMessage };
        } finally {
            if (!onlyValidate) {
                setIsRegistering(false);
            }
        }
    };

    // Función para limpiar errores
    const clearErrors = () => {
        setFieldErrors({});
        setGeneralError('');
    };

    // Función para limpiar error de un campo específico
    const clearFieldError = (fieldName) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    return {
        // Estados
        isRegistering,
        fieldErrors,
        generalError,
        
        // Funciones principales
        handleRegister,
        handleRegisterProcess, // Nueva función principal
        
        // Funciones de limpieza
        clearErrors,
        clearFieldError,
        
        // Funciones de formateo
        formatPhone,
        formatPhoneInput,
        
        // Funciones de validación individual (ahora todas se usan)
        validateEmail,
        validatePhone,
        validatePassword,
        validateBirthDate,
        validateFullName,
        validateAddress,
        validateAllFields,
        checkEmailExists
    };
};

export default useRegister;
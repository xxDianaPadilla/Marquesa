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
            return false;
        }
        
        const trimmedEmail = email.trim().toLowerCase();
        
        if (trimmedEmail.length === 0) {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return false;
        }
        
        if (trimmedEmail.length > 254) {
            return false;
        }
        
        return true;
    };

    // Función para validar formato de teléfono según el backend
    const validatePhone = (phone) => {
        if (!phone || typeof phone !== 'string') {
            return false;
        }
        
        const trimmedPhone = phone.trim();
        
        if (trimmedPhone.length === 0) {
            return false;
        }
        
        // Validar formato de teléfono (permite números, espacios, guiones y paréntesis)
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(trimmedPhone)) {
            return false;
        }
        
        // Extraer solo números para validar longitud
        const numbersOnly = trimmedPhone.replace(/\D/g, '');
        if (numbersOnly.length < 8 || numbersOnly.length > 15) {
            return false;
        }
        
        return true;
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
            return false;
        }
        
        if (password.length < 8) {
            return false;
        }
        
        if (password.length > 128) {
            return false;
        }
        
        // Validar complejidad
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumbers) {
            return false;
        }
        
        return true;
    };

    // Función para validar fecha de nacimiento según el backend (cambiada a 12 años)
    const validateBirthDate = (dateString) => {
        if (!dateString) {
            return false;
        }
        
        try {
            // Parsear fecha en formato DD/MM/YYYY
            const [day, month, year] = dateString.split('/');
            const date = new Date(year, month - 1, day);
            
            // Verificar que sea una fecha válida
            if (isNaN(date.getTime())) {
                return false;
            }
            
            // Verificar que no sea en el futuro
            if (date > new Date()) {
                return false;
            }
            
            // Verificar edad mínima (12 años según lo solicitado)
            const minAge = 12;
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - minAge);
            
            if (date > minDate) {
                return false;
            }
            
            // Verificar edad máxima (120 años)
            const maxAge = 120;
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - maxAge);
            
            if (date < maxDate) {
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    };

    // Función para validar nombre completo según el backend
    const validateFullName = (fullName) => {
        if (!fullName || typeof fullName !== 'string') {
            return false;
        }
        
        const trimmedName = fullName.trim();
        
        if (trimmedName.length === 0) {
            return false;
        }
        
        // El backend requiere al menos 2 caracteres, pero el modelo requiere 10
        if (trimmedName.length < 10) {
            return false;
        }
        
        if (trimmedName.length > 100) {
            return false;
        }
        
        // Validar que solo contenga letras, espacios y algunos caracteres especiales
        const nameRegex = /^[a-zA-ZàáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜñÑ\s\-\.\']+$/;
        if (!nameRegex.test(trimmedName)) {
            return false;
        }
        
        return true;
    };

    // Función para validar dirección según el backend
    const validateAddress = (address) => {
        if (!address || typeof address !== 'string') {
            return false;
        }
        
        const trimmedAddress = address.trim();
        
        if (trimmedAddress.length === 0) {
            return false;
        }
        
        // El modelo requiere al menos 10 caracteres
        if (trimmedAddress.length < 10) {
            return false;
        }
        
        if (trimmedAddress.length > 200) {
            return false;
        }
        
        return true;
    };

    // Función principal para validar todos los campos del formulario con mensajes específicos del backend
    const validateForm = (formData) => {
        const errors = {};

        // Validar nombre completo con validación específica del backend
        if (!formData.nombre || typeof formData.nombre !== 'string') {
            errors.nombre = 'Nombre completo es requerido';
        } else {
            const trimmedName = formData.nombre.trim();
            
            if (trimmedName.length === 0) {
                errors.nombre = 'Nombre completo no puede estar vacío';
            } else if (trimmedName.length < 10) {
                errors.nombre = 'Nombre completo debe tener al menos 10 caracteres para asegurar nombre y apellido';
            } else if (trimmedName.length > 100) {
                errors.nombre = 'Nombre completo demasiado largo';
            } else {
                const nameRegex = /^[a-zA-ZàáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜñÑ\s\-\.\']+$/;
                if (!nameRegex.test(trimmedName)) {
                    errors.nombre = 'Nombre completo contiene caracteres no válidos';
                }
            }
        }

        // Validar teléfono con validación específica del backend
        if (!formData.telefono || typeof formData.telefono !== 'string') {
            errors.telefono = 'Teléfono es requerido';
        } else {
            const trimmedPhone = formData.telefono.trim();
            
            if (trimmedPhone.length === 0) {
                errors.telefono = 'Teléfono no puede estar vacío';
            } else {
                const phoneRegex = /^[\d\s\-\(\)\+]+$/;
                if (!phoneRegex.test(trimmedPhone)) {
                    errors.telefono = 'Formato de teléfono no válido';
                } else {
                    const numbersOnly = trimmedPhone.replace(/\D/g, '');
                    if (numbersOnly.length < 8 || numbersOnly.length > 15) {
                        errors.telefono = 'Teléfono debe tener entre 8 y 15 dígitos';
                    }
                }
            }
        }

        // Validar email con validación específica del backend
        if (!formData.correo || typeof formData.correo !== 'string') {
            errors.correo = 'Email es requerido';
        } else {
            const trimmedEmail = formData.correo.trim().toLowerCase();
            
            if (trimmedEmail.length === 0) {
                errors.correo = 'Email no puede estar vacío';
            } else if (trimmedEmail.length > 254) {
                errors.correo = 'Email demasiado largo';
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmedEmail)) {
                    errors.correo = 'Formato de email no válido';
                }
            }
        }

        // Validar fecha de nacimiento con validación específica del backend
        if (!formData.fechaNacimiento) {
            errors.fechaNacimiento = 'Fecha de nacimiento es requerida';
        } else {
            try {
                const [day, month, year] = formData.fechaNacimiento.split('/');
                const date = new Date(year, month - 1, day);
                
                if (isNaN(date.getTime())) {
                    errors.fechaNacimiento = 'Fecha de nacimiento no válida';
                } else if (date > new Date()) {
                    errors.fechaNacimiento = 'Fecha de nacimiento no puede ser en el futuro';
                } else {
                    // Verificar edad mínima (12 años)
                    const minAge = 12;
                    const minDate = new Date();
                    minDate.setFullYear(minDate.getFullYear() - minAge);
                    
                    if (date > minDate) {
                        errors.fechaNacimiento = `Debe tener al menos ${minAge} años`;
                    } else {
                        // Verificar edad máxima (120 años)
                        const maxAge = 120;
                        const maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() - maxAge);
                        
                        if (date < maxDate) {
                            errors.fechaNacimiento = 'Fecha de nacimiento no válida';
                        }
                    }
                }
            } catch (error) {
                errors.fechaNacimiento = 'Fecha de nacimiento no válida';
            }
        }

        // Validar dirección con validación específica del backend
        if (!formData.direccion || typeof formData.direccion !== 'string') {
            errors.direccion = 'Dirección es requerida';
        } else {
            const trimmedAddress = formData.direccion.trim();
            
            if (trimmedAddress.length === 0) {
                errors.direccion = 'Dirección no puede estar vacía';
            } else if (trimmedAddress.length < 10) {
                errors.direccion = 'Dirección debe tener al menos 10 caracteres para dirección completa';
            } else if (trimmedAddress.length > 200) {
                errors.direccion = 'Dirección demasiado larga';
            }
        }

        // Validar contraseña con validación específica del backend
        if (!formData.contrasena || typeof formData.contrasena !== 'string') {
            errors.contrasena = 'Contraseña es requerida';
        } else {
            if (formData.contrasena.length < 8) {
                errors.contrasena = 'Contraseña debe tener al menos 8 caracteres';
            } else if (formData.contrasena.length > 128) {
                errors.contrasena = 'Contraseña demasiado larga';
            } else {
                const hasUppercase = /[A-Z]/.test(formData.contrasena);
                const hasLowercase = /[a-z]/.test(formData.contrasena);
                const hasNumbers = /\d/.test(formData.contrasena);
                
                if (!hasUppercase || !hasLowercase || !hasNumbers) {
                    errors.contrasena = 'Contraseña debe contener al menos una mayúscula, una minúscula y un número';
                }
            }
        }

        return errors;
    };

    // Función principal para procesar el registro
    const handleRegister = async (formData) => {
        try {
            setIsRegistering(true);
            setGeneralError('');
            setFieldErrors({});

            // Validar formulario
            const errors = validateForm(formData);
            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                return { success: false, errors };
            }

            // Formatear datos para enviar al backend
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
            setGeneralError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsRegistering(false);
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
        isRegistering,
        fieldErrors,
        generalError,
        handleRegister,
        clearErrors,
        clearFieldError,
        validatePhone,
        formatPhone,
        formatPhoneInput,
        validateEmail
    };
};

export default useRegister;
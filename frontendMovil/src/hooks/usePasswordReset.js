import { useState } from 'react';

// Hook personalizado para manejar el proceso de recuperación de contraseña
const usePasswordReset = () => {
    // Estado para controlar si está enviando la solicitud
    const [isRequesting, setIsRequesting] = useState(false);
    // Estado para controlar si está verificando el código
    const [isVerifying, setIsVerifying] = useState(false);
    // Estado para controlar si está actualizando la contraseña
    const [isUpdating, setIsUpdating] = useState(false);
    // Estado para mensajes de error
    const [error, setError] = useState('');

    // URL base del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // Función para validar email
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

    // Función para validar código de verificación
    const validateVerificationCode = (code) => {
        if (!code || typeof code !== 'string') {
            return { isValid: false, error: 'Código de verificación es requerido' };
        }
        
        const trimmedCode = code.toString().trim();
        
        if (!/^\d{6}$/.test(trimmedCode)) {
            return { isValid: false, error: 'Código debe ser exactamente 6 dígitos' };
        }
        
        return { isValid: true, error: null };
    };

    // Función para validar contraseña
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
            return { 
                isValid: false, 
                error: 'Contraseña debe contener al menos una mayúscula, una minúscula y un número' 
            };
        }
        
        return { isValid: true, error: null };
    };

    // Función para solicitar código de recuperación
    const requestPasswordReset = async (email) => {
        try {
            setIsRequesting(true);
            setError('');

            // Validar email
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                setError(emailValidation.error);
                return { success: false, message: emailValidation.error };
            }

            const response = await fetch(`${API_BASE_URL}/passwordReset/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Código de recuperación enviado'
                };
            } else {
                setError(data.message || 'Error al enviar código de recuperación');
                return {
                    success: false,
                    message: data.message || 'Error al enviar código de recuperación'
                };
            }
        } catch (error) {
            const errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setIsRequesting(false);
        }
    };

    // Función para verificar código de recuperación
    const verifyCode = async (email, verificationCode) => {
        try {
            setIsVerifying(true);
            setError('');

            // Validar email
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                setError(emailValidation.error);
                return { success: false, message: emailValidation.error };
            }

            // Validar código
            const codeValidation = validateVerificationCode(verificationCode);
            if (!codeValidation.isValid) {
                setError(codeValidation.error);
                return { success: false, message: codeValidation.error };
            }

            const response = await fetch(`${API_BASE_URL}/passwordReset/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    verificationCode: verificationCode.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Código verificado correctamente'
                };
            } else {
                setError(data.message || 'Código de verificación incorrecto');
                return {
                    success: false,
                    message: data.message || 'Código de verificación incorrecto'
                };
            }
        } catch (error) {
            const errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setIsVerifying(false);
        }
    };

    // Función para actualizar contraseña
    const updatePassword = async (email, verificationCode, newPassword) => {
        try {
            setIsUpdating(true);
            setError('');

            // Validar email
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                setError(emailValidation.error);
                return { success: false, message: emailValidation.error };
            }

            // Validar código
            const codeValidation = validateVerificationCode(verificationCode);
            if (!codeValidation.isValid) {
                setError(codeValidation.error);
                return { success: false, message: codeValidation.error };
            }

            // Validar contraseña
            const passwordValidation = validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                setError(passwordValidation.error);
                return { success: false, message: passwordValidation.error };
            }

            const response = await fetch(`${API_BASE_URL}/passwordReset/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    verificationCode: verificationCode.trim(),
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Contraseña actualizada correctamente'
                };
            } else {
                setError(data.message || 'Error actualizando contraseña');
                return {
                    success: false,
                    message: data.message || 'Error actualizando contraseña'
                };
            }
        } catch (error) {
            const errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setIsUpdating(false);
        }
    };

    // Función para limpiar errores
    const clearError = () => {
        setError('');
    };

    return {
        // Estados
        isRequesting,
        isVerifying,
        isUpdating,
        error,
        
        // Funciones principales
        requestPasswordReset,
        verifyCode,
        updatePassword,
        
        // Funciones de utilidad
        validateEmail,
        validateVerificationCode,
        validatePassword,
        clearError
    };
};

export default usePasswordReset;
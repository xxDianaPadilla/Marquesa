import { useState } from 'react';

// Hook personalizado para manejar la verificación de email en móvil
export const useEmailVerificationMobile = () => {
    const [isLoading, setIsLoading] = useState(false);

    // URL base del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // Función para solicitar código de verificación de email
    const requestEmailVerification = async (email, fullName) => {
        try {
            setIsLoading(true);
            console.log('Solicitando verificación para:', email);

            const response = await fetch(`${API_BASE_URL}/emailVerification/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    fullName: fullName?.trim() || null
                })
            });

            const data = await response.json();
            console.log('Respuesta de solicitud:', data);

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Código de verificación enviado'
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Error al enviar código de verificación'
                };
            }
        } catch (error) {
            console.error('Error en requestEmailVerification:', error);
            return {
                success: false,
                message: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    // Función para verificar código y completar registro
    const verifyEmailAndRegister = async (email, verificationCode, userData) => {
        try {
            setIsLoading(true);
            console.log('Verificando código y completando registro para:', email);

            const response = await fetch(`${API_BASE_URL}/emailVerification/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    verificationCode: verificationCode.trim(),
                    userData: userData
                })
            });

            const data = await response.json();
            console.log('Respuesta de verificación:', data);

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'Email verificado y registro completado'
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Código de verificación incorrecto'
                };
            }
        } catch (error) {
            console.error('Error en verifyEmailAndRegister:', error);
            return {
                success: false,
                message: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        requestEmailVerification,
        verifyEmailAndRegister,
        isLoading
    };
};
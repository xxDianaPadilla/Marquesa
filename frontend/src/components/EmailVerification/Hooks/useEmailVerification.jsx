import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar el proceso de verificación de email
 * Maneja el envío del código y la verificación del mismo
 */
export const useEmailVerification = () => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Solicitar código de verificación de email
     * @param {string} email - Email del usuario
     * @param {string} fullName - Nombre completo del usuario
     * @returns {Object} - Resultado de la operación
     */
    const requestEmailVerification = async (email, fullName) => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:4000/api/email-verification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, fullName }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Correo de verificación enviado', {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
                    },
                    iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#10B981',
                    },
                });

                return { success: true, message: data.message };
            } else {
                toast.error(data.message, {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
                    },
                    iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#EF4444',
                    },
                });

                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error en requestEmailVerification:', error);
            
            toast.error('Error de conexión. Verifica tu internet e intenta nuevamente', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });

            return { success: false, message: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verificar código de email y completar registro
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @param {Object} userData - Datos del usuario para el registro
     * @returns {Object} - Resultado de la operación
     */
    const verifyEmailAndRegister = async (email, verificationCode, userData) => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:4000/api/email-verification/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode, userData }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('¡Registro exitoso! Ya puedes iniciar sesión', {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
                    },
                    iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#10B981',
                    },
                });

                return { success: true, message: data.message };
            } else {
                toast.error(data.message, {
                    duration: 4000,
                    style: {
                        background: '#EF4444',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
                    },
                    iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#EF4444',
                    },
                });

                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error en verifyEmailAndRegister:', error);
            
            toast.error('Error de conexión. Verifica tu internet e intenta nuevamente', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });

            return { success: false, message: 'Error de conexión' };
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
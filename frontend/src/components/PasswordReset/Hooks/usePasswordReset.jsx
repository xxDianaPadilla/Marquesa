import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar el proceso de recuperación de contraseña
 * Maneja las 3 etapas: solicitud, verificación y actualización
 */
export const usePasswordReset = () => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Solicitar código de recuperación de contraseña
     * @param {string} email - Email del usuario
     * @returns {Object} - Resultado de la operación
     */
    const requestPasswordReset = async (email) => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:4000/api/passwordReset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar toast de éxito
                toast.success(data.message, {
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
                // Mostrar toast de error
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
            console.error('Error en requestPasswordReset:', error);
            
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
     * Verificar código de recuperación
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @returns {Object} - Resultado de la operación
     */
    const verifyCode = async (email, verificationCode) => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:4000/api/passwordReset/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode }),
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar toast de éxito
                toast.success(data.message, {
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
                // Mostrar toast de error
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
            console.error('Error en verifyCode:', error);
            
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
     * Actualizar contraseña
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @param {string} newPassword - Nueva contraseña
     * @returns {Object} - Resultado de la operación
     */
    const updatePassword = async (email, verificationCode, newPassword) => {
        try {
            setIsLoading(true);

            const response = await fetch('http://localhost:4000/api/passwordReset/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar toast de éxito
                toast.success(data.message, {
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
                // Mostrar toast de error
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
            console.error('Error en updatePassword:', error);
            
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
        requestPasswordReset,
        verifyCode,
        updatePassword,
        isLoading
    };
};
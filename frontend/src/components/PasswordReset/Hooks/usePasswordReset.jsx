import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el proceso de recuperación de contraseña
 * ACTUALIZADO: Sistema de autenticación cross-domain híbrido
 * Maneja las 3 etapas: solicitud, verificación y actualización
 */
export const usePasswordReset = () => {
    const [isLoading, setIsLoading] = useState(false);

    // ✅ NUEVO: Hook de autenticación para sistema híbrido
    const { getBestAvailableToken, setAuthToken } = useAuth();

    /**
     * ✅ NUEVA FUNCIÓN: Crear headers de autenticación híbridos
     */
    const getAuthHeaders = () => {
        const token = getBestAvailableToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    /**
     * ✅ ACTUALIZADA: Solicitar código de recuperación de contraseña con sistema híbrido
     * @param {string} email - Email del usuario
     * @returns {Object} - Resultado de la operación
     */
    const requestPasswordReset = async (email) => {
        try {
            setIsLoading(true);

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/passwordReset/request', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({ email }),
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();

            if (data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                let token = null;

                // Primera prioridad: response body
                if (data.token) {
                    token = data.token;
                    if (setAuthToken && typeof setAuthToken === 'function') {
                        setAuthToken(token);
                    } // Guardar en estado local
                }

                // Segunda prioridad: cookie (con retraso)
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getBestAvailableToken();
                    if (token) {
                        if (setAuthToken && typeof setAuthToken === 'function') {
                            setAuthToken(token);
                        }
                    }
                }

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

            // ✅ NUEVO: Manejo específico de errores de red vs servidor
            let errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente';

            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }

            toast.error(errorMessage, {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });

            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * ✅ ACTUALIZADA: Verificar código de recuperación con sistema híbrido
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @returns {Object} - Resultado de la operación
     */
    const verifyCode = async (email, verificationCode) => {
        try {
            setIsLoading(true);

            const response = await fetch('https://marquesa.onrender.com/api/passwordReset/verify', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message, {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
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
                });

                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error en verifyCode:', error);

            const errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente';

            toast.error(errorMessage, {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });

            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * ✅ ACTUALIZADA: Actualizar contraseña con sistema híbrido
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @param {string} newPassword - Nueva contraseña
     * @returns {Object} - Resultado de la operación
     */
    const updatePassword = async (email, verificationCode, newPassword) => {
        try {
            setIsLoading(true);

            const response = await fetch('https://marquesa.onrender.com/api/passwordReset/update', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message, {
                    duration: 4000,
                    style: {
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontFamily: 'Poppins, sans-serif',
                        borderRadius: '8px',
                        fontSize: '14px'
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
                });

                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error en updatePassword:', error);

            const errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente';

            toast.error(errorMessage, {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    fontSize: '14px'
                },
            });

            return { success: false, message: errorMessage };
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
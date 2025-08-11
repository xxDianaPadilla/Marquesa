import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook personalizado para manejar el proceso de verificación de email
 * ACTUALIZADO: Sistema de autenticación cross-domain híbrido
 * Maneja el envío del código y la verificación del mismo
 */
export const useEmailVerification = () => {
    const [isLoading, setIsLoading] = useState(false);

    // ✅ NUEVO: Hook de autenticación para sistema híbrido
    const { getBestAvailableToken,setAuthToken } = useAuth();

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
     * ✅ ACTUALIZADA: Solicitar código de verificación de email con sistema híbrido
     * @param {string} email - Email del usuario
     * @param {string} fullName - Nombre completo del usuario
     * @returns {Object} - Resultado de la operación
     */
    const requestEmailVerification = async (email, fullName) => {
        try {
            setIsLoading(true);

            console.log('Enviando solicitud de verificación:', { email, fullName });

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/emailVerification/request', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify({ 
                    email: email?.trim(), 
                    fullName: fullName?.trim() 
                }),
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta del servidor (request):', data);

            if (data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                let token = null;

                // Primera prioridad: response body
                if (data.token) {
                    token = data.token;
                    setAuthToken(token); // Guardar en estado local
                }

                // Segunda prioridad: cookie (con retraso)
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getBestAvailableToken();
                    if (token) {
                        setAuthToken(token);
                    }
                }

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
     * ✅ ACTUALIZADA: Verificar código de email y completar registro con sistema híbrido
     * @param {string} email - Email del usuario
     * @param {string} verificationCode - Código de verificación
     * @param {Object} userData - Datos del usuario para el registro
     * @returns {Object} - Resultado de la operación
     */
    const verifyEmailAndRegister = async (email, verificationCode, userData) => {
        try {
            setIsLoading(true);

            // Validar datos antes de enviar
            if (!email || !verificationCode || !userData) {
                const errorMessage = 'Faltan datos requeridos para la verificación';
                console.error(errorMessage, { email: !!email, verificationCode: !!verificationCode, userData: !!userData });
                return { success: false, message: errorMessage };
            }

            // Validar campos de userData
            const requiredFields = ['fullName', 'phone', 'birthDate', 'address', 'password'];
            const missingFields = requiredFields.filter(field => !userData[field] || !userData[field].toString().trim());
            
            if (missingFields.length > 0) {
                const errorMessage = `Faltan campos requeridos: ${missingFields.join(', ')}`;
                console.error(errorMessage);
                return { success: false, message: errorMessage };
            }

            // Limpiar y preparar datos
            const cleanUserData = {
                fullName: userData.fullName.toString().trim(),
                phone: userData.phone.toString().trim(),
                birthDate: userData.birthDate,
                address: userData.address.toString().trim(),
                password: userData.password.toString().trim(),
                favorites: userData.favorites || [],
                discount: userData.discount || null
            };

            const requestData = {
                email: email.trim(),
                verificationCode: verificationCode.toString().trim(),
                userData: cleanUserData
            };

            console.log('Enviando verificación:', {
                email: requestData.email,
                verificationCode: requestData.verificationCode,
                userData: 'datos presentes'
            });

            // ✅ NUEVA LÓGICA: Petición con sistema híbrido
            const operationPromise = fetch('https://marquesa.onrender.com/api/emailVerification/verify', {
                method: 'POST',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                body: JSON.stringify(requestData),
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();
            console.log('Respuesta del servidor (verify):', data);

            if (data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
                let token = null;

                // Primera prioridad: response body
                if (data.token) {
                    token = data.token;
                    setAuthToken(token); // Guardar en estado local
                }

                // Segunda prioridad: cookie (con retraso)
                if (!token) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    token = getBestAvailableToken();
                    if (token) {
                        setAuthToken(token);
                    }
                }

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

    return {
        requestEmailVerification,
        verifyEmailAndRegister,
        isLoading
    };
};
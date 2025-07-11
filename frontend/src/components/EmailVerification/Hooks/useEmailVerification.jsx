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

            console.log('Enviando solicitud de verificación:', { email, fullName });

            const response = await fetch('http://localhost:4000/api/emailVerification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email?.trim(), 
                    fullName: fullName?.trim() 
                }),
            });

            const data = await response.json();
            console.log('Respuesta del servidor (request):', data);

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
     * Verificar código de email y completar registro
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

            const response = await fetch('http://localhost:4000/api/emailVerification/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log('Respuesta del servidor (verify):', data);

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
        requestEmailVerification,
        verifyEmailAndRegister,
        isLoading
    };
};
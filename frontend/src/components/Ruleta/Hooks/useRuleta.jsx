// frontend/src/components/Ruleta/Hooks/useRuleta.jsx - VERSIÓN ACTUALIZADA CON CONTROL DE ESTADO
import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
 
// Sistema de autenticación cross-domain híbrido
export const useRuleta = () => {
    // Estados de la UI de la ruleta
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [error, setError] = useState(null);
 
    // Acceso al contexto de autenticación híbrido
    const { isAuthenticated, getBestAvailableToken, setAuthToken } = useAuth();
 
    /**
     * Crear headers de autenticación híbridos
     */
    const getAuthHeaders = useCallback(() => {
        const token = getBestAvailableToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }, [getBestAvailableToken]);
 
    // Función para generar código aleatorio de 6 dígitos (para mostrar en UI)
    const generateRandomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
 
    // Códigos de descuento que COINCIDEN con el backend
    const discountCodes = [
        {
            name: 'Verano 2025',
            discount: '25% OFF',
            color: '#FADDDD',
            textColor: '#374151',
            badgeColor: 'bg-red-100 text-red-700'
        },
        {
            name: 'Ruleta marquesa',
            discount: '20% OFF',
            color: '#E8ACD2',
            textColor: '#FFFFFF',
            badgeColor: 'bg-white bg-opacity-80 text-purple-700'
        },
        {
            name: 'Primavera 2025',
            discount: '15% OFF',
            color: '#C6E2C6',
            textColor: '#374151',
            badgeColor: 'bg-green-100 text-green-700'
        },
        {
            name: 'Flores especiales',
            discount: '30% OFF',
            color: '#FADDDD',
            textColor: '#374151',
            badgeColor: 'bg-red-100 text-red-700'
        },
        {
            name: 'Giftbox deluxe',
            discount: '18% OFF',
            color: '#E8ACD2',
            textColor: '#FFFFFF',
            badgeColor: 'bg-white bg-opacity-80 text-purple-700'
        },
        {
            name: 'Cuadros únicos',
            discount: '22% OFF',
            color: '#C6E2C6',
            textColor: '#374151',
            badgeColor: 'bg-green-100 text-green-700'
        },
        {
            name: 'Colección Rosa',
            discount: '12% OFF',
            color: '#F8D7DA',
            textColor: '#721C24',
            badgeColor: 'bg-red-100 text-red-800'
        },
        {
            name: 'Especial Marquesa',
            discount: '35% OFF',
            color: '#D1ECF1',
            textColor: '#0C5460',
            badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
            name: 'Descuento Premium',
            discount: '28% OFF',
            color: '#D4EDDA',
            textColor: '#155724',
            badgeColor: 'bg-green-100 text-green-800'
        },
        {
            name: 'Oferta Exclusiva',
            discount: '10% OFF',
            color: '#FFF3CD',
            textColor: '#856404',
            badgeColor: 'bg-yellow-100 text-yellow-800'
        }
    ];

    /**
     * ✅ NUEVA FUNCIÓN: Verificar si la ruleta está activa
     */
    const checkRuletaStatus = useCallback(async () => {
        try {
            const response = await fetch('https://marquesa.onrender.com/api/clients/ruleta/status', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { 
                    isActive: data.isActive, 
                    message: data.message 
                };
            } else {
                // Si hay error, asumir que está activa para no bloquear
                return { isActive: true, message: 'Estado desconocido' };
            }
        } catch (error) {
            console.error('Error verificando estado de ruleta:', error);
            // Si hay error de conexión, asumir que está activa
            return { isActive: true, message: 'Error de conexión' };
        }
    }, []);
 
    /**
     * Función principal para girar la ruleta y generar código en el backend
     */
    const spinRuleta = useCallback(async () => {
        if (isSpinning || hasSpun) return;
 
        // Verificar autenticación
        if (!isAuthenticated) {
            setError('Debes iniciar sesión para girar la ruleta');
            return;
        }
 
        console.log('🎰 Iniciando giro de ruleta...');
        setIsSpinning(true);
        setShowResult(false);
        setError(null);
 
        // Seleccionar un código aleatorio para preview
        const randomIndex = Math.floor(Math.random() * discountCodes.length);
        const selectedDiscount = {
            ...discountCodes[randomIndex],
            code: generateRandomCode()
        };
 
        // Tiempo de giro: 4 segundos
        setTimeout(async () => {
            console.log('⏰ Animación de 4s completada, manteniendo fullscreen...');
           
            // Generar código real en el backend
            try {
                const operationPromise = fetch('https://marquesa.onrender.com/api/clients/ruleta/generate', {
                    method: 'POST',
                    credentials: 'include',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({})
                });
 
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('TIMEOUT')), 30000);
                });
 
                const response = await Promise.race([operationPromise, timeoutPromise]);
                const data = await response.json();
 
                if (response.ok && data.success) {
                    console.log('✅ Código real generado en el backend:', data.code);
 
                    // Manejo híbrido de tokens
                    let token = null;
 
                    if (data.token) {
                        token = data.token;
                        setAuthToken(token);
                    }
 
                    if (!token) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        token = getBestAvailableToken();
                        if (token) {
                            setAuthToken(token);
                        }
                    }
 
                    // Usar el código real del backend
                    const realCode = {
                        code: data.code.code,
                        name: data.code.name,
                        discount: data.code.discount,
                        color: data.code.color,
                        textColor: data.code.textColor,
                        expiresAt: data.code.expiresAt
                    };
 
                    console.log('✅ Código real con nombre específico:', {
                        name: realCode.name,
                        discount: realCode.discount,
                        code: realCode.code
                    });
 
                    setSelectedCode(realCode);
                } else {
                    console.error('❌ Error del backend:', data.message);
                    setSelectedCode(selectedDiscount);
                    setError(data.message || 'Error al generar código, usando código temporal');
                }
            } catch (error) {
                console.error('❌ Error de conexión:', error);
               
                let errorMessage = 'Error de conexión, usando código temporal';
               
                if (error.message === 'TIMEOUT') {
                    errorMessage = 'La conexión tardó demasiado tiempo. Usando código temporal.';
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'No se pudo conectar con el servidor. Usando código temporal.';
                } else if (error.message?.includes('timeout')) {
                    errorMessage = 'La conexión tardó demasiado. Usando código temporal.';
                } else if (error.message?.includes('network')) {
                    errorMessage = 'Error de red. Usando código temporal.';
                }
               
                setSelectedCode(selectedDiscount);
                setError(errorMessage);
            }
 
            setIsSpinning(false);
            setShowResult(true);
            setHasSpun(true);
            console.log('🎉 Modal de resultado mostrado');
        }, 4000);
    }, [isSpinning, hasSpun, isAuthenticated, discountCodes, getAuthHeaders, getBestAvailableToken, setAuthToken]);
 
    /**
     * Función para resetear la ruleta
     */
    const resetRuleta = useCallback(() => {
        console.log('🔄 Reseteando ruleta...');
        setIsSpinning(false);
        setSelectedCode(null);
        setShowResult(false);
        setHasSpun(false);
        setError(null);
    }, []);
 
    /**
     * Función para cerrar el modal de resultado
     */
    const closeResult = useCallback(() => {
        console.log('❌ Cerrando modal de resultado...');
        setShowResult(false);
    }, []);
 
    /**
     * Función para copiar código al portapapeles
     */
    const copyToClipboard = useCallback((code) => {
        navigator.clipboard.writeText(code).then(() => {
            console.log('📋 Código copiado al portapapeles:', code);
        }).catch(err => {
            console.error('❌ Error al copiar código:', err);
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }, []);
 
    /**
     * ✅ MODIFICADA: Función para verificar si el usuario puede girar la ruleta
     * Ahora también verifica si la ruleta está activa
     */
    const checkCanSpin = useCallback(async () => {
        if (!isAuthenticated) {
            return { canSpin: false, reason: 'Debes iniciar sesión para girar la ruleta' };
        }

        // ✅ NUEVA VERIFICACIÓN: Primero verificar si la ruleta está activa
        const ruletaStatus = await checkRuletaStatus();
        if (!ruletaStatus.isActive) {
            return { 
                canSpin: false, 
                reason: 'La ruleta de descuentos está temporalmente desactivada. Inténtalo más tarde.',
                isRuletaDisabled: true
            };
        }

        try {
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/ruleta/codes', {
                method: 'GET',
                credentials: 'include',
                headers: getAuthHeaders(),
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();

            if (response.ok && data.success) {
                if (data.token) {
                    setAuthToken(data.token);
                }

                const activeCodes = data.activeCodes || 0;
                const maxActive = data.maxActiveAllowed || 10;

                if (activeCodes >= maxActive) {
                    return {
                        canSpin: false,
                        reason: `Has alcanzado el máximo de códigos activos (${maxActive}). Utiliza tus códigos existentes o espera a que se caduquen.`,
                        activeCodes,
                        maxActive
                    };
                }

                return { canSpin: true, activeCodes, maxActive };
            } else {
                return { canSpin: false, reason: 'Error al verificar códigos existentes' };
            }

        } catch (error) {
            console.error('Error verificando códigos:', error);
           
            let errorMessage = 'Error de conexión';
           
            if (error.message === 'TIMEOUT') {
                errorMessage = 'La conexión tardó demasiado tiempo. Inténtalo nuevamente.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'La conexión tardó demasiado. Inténtalo nuevamente.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Error de red. Verifica tu conexión a internet.';
            }
           
            return { canSpin: false, reason: errorMessage };
        }
    }, [isAuthenticated, getAuthHeaders, setAuthToken, checkRuletaStatus]);
 
    /**
     * Función mejorada para girar la ruleta con validaciones
     */
    const spinRuletaWithValidation = useCallback(async () => {
        if (isSpinning || hasSpun) return;
 
        const canSpinResult = await checkCanSpin();
       
        if (!canSpinResult.canSpin) {
            setError(canSpinResult.reason);
            return;
        }
 
        await spinRuleta();
    }, [isSpinning, hasSpun, checkCanSpin, spinRuleta]);
 
    return {
        // Estados de la UI
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        error,
       
        // Datos para preview
        discountCodes,
       
        // Funciones principales
        spinRuleta: spinRuletaWithValidation,
        resetRuleta,
        closeResult,
        copyToClipboard,
       
        // Funciones de verificación
        checkCanSpin,
        checkRuletaStatus, // ✅ NUEVA: Exportar función para verificar estado
       
        // Función para limpiar errores
        clearError: useCallback(() => setError(null), [])
    };
};
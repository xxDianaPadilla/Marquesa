// frontend/src/components/Ruleta/Hooks/useRuleta.jsx
import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

// ACTUALIZADO: Sistema de autenticación cross-domain híbrido
export const useRuleta = () => {
    // Estados de la UI de la ruleta
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [error, setError] = useState(null);

    // ✅ NUEVO: Acceso al contexto de autenticación híbrido
    const { isAuthenticated, getBestAvailableToken,setAuthToken } = useAuth();

    /**
     * ✅ NUEVA FUNCIÓN: Crear headers de autenticación híbridos
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

    // Códigos de descuento disponibles con colores exactos de la imagen (para preview)
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
        }
    ];

    /**
     * ✅ ACTUALIZADA: Función principal para girar la ruleta y generar código en el backend con sistema híbrido
     * AJUSTADO: Mantener fullscreen hasta que aparezca el modal
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

        // Seleccionar un código aleatorio para preview (como era originalmente)
        const randomIndex = Math.floor(Math.random() * discountCodes.length);
        const selectedDiscount = {
            ...discountCodes[randomIndex],
            code: generateRandomCode() // Código temporal para preview
        };

        // Tiempo de giro: 4 segundos (animación original)
        setTimeout(async () => {
            console.log('⏰ Animación de 4s completada, manteniendo fullscreen...');
            // IMPORTANTE: NO cambiar isSpinning aquí, mantenerlo en true para que el fullscreen permanezca
            
            // Generar código real en el backend mientras el fullscreen sigue activo
            try {
                // ✅ NUEVA LÓGICA: Llamar al backend para generar código real con sistema híbrido
                const operationPromise = fetch('https://marquesa.onrender.com/api/clients/ruleta/generate', {
                    method: 'POST',
                    credentials: 'include', // ✅ NUEVO: Incluir cookies
                    headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
                });

                // ✅ NUEVO: Timeout para conexiones lentas
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('TIMEOUT')), 30000);
                });

                const response = await Promise.race([operationPromise, timeoutPromise]);
                const data = await response.json();

                if (response.ok && data.success) {
                    console.log('✅ Código real generado en el backend:', data.code);

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

                    // Usar el código real del backend
                    const realCode = {
                        code: data.code.code,
                        name: data.code.name,
                        discount: data.code.discount,
                        color: data.code.color,
                        textColor: data.code.textColor,
                        expiresAt: data.code.expiresAt
                    };

                    setSelectedCode(realCode);
                } else {
                    // Si hay error, usar el código de preview
                    console.error('❌ Error del backend, usando código preview:', data.message);
                    setSelectedCode(selectedDiscount);
                    setError(data.message || 'Error al generar código, usando código temporal');
                }
            } catch (error) {
                console.error('❌ Error de conexión, usando código preview:', error);
                
                // ✅ NUEVO: Manejo específico de errores de red vs servidor
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

            // AHORA SÍ cambiar isSpinning y mostrar el modal inmediatamente
            setIsSpinning(false);
            setShowResult(true);
            setHasSpun(true);
            console.log('🎉 Modal de resultado mostrado inmediatamente');
        }, 4000); // Timing original - 4 segundos
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
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }, []);

    /**
     * ✅ ACTUALIZADA: Función para verificar si el usuario puede girar la ruleta con sistema híbrido
     */
    const checkCanSpin = useCallback(async () => {
        if (!isAuthenticated) {
            return { canSpin: false, reason: 'Debes iniciar sesión para girar la ruleta' };
        }

        try {
            const operationPromise = fetch('https://marquesa.onrender.com/api/clients/ruleta/codes', {
                method: 'GET',
                credentials: 'include', // ✅ NUEVO: Incluir cookies
                headers: getAuthHeaders(), // ✅ NUEVO: Headers híbridos
            });

            // ✅ NUEVO: Timeout para conexiones lentas
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('TIMEOUT')), 30000);
            });

            const response = await Promise.race([operationPromise, timeoutPromise]);
            const data = await response.json();

            if (response.ok && data.success) {
                // ✅ NUEVO: Manejo híbrido de tokens
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
            
            // ✅ NUEVO: Manejo específico de errores de red vs servidor
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
    }, [isAuthenticated, getAuthHeaders, setAuthToken]);

    /**
     * Función mejorada para girar la ruleta con validaciones
     */
    const spinRuletaWithValidation = useCallback(async () => {
        if (isSpinning || hasSpun) return;

        // Verificar si puede girar
        const canSpinResult = await checkCanSpin();
        
        if (!canSpinResult.canSpin) {
            setError(canSpinResult.reason);
            return;
        }

        // Si puede girar, proceder con el giro normal
        await spinRuleta();
    }, [isSpinning, hasSpun, checkCanSpin, spinRuleta]);

    return {
        // Estados de la UI
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        error,
        
        // Datos para preview (compatibilidad)
        discountCodes,
        
        // Funciones principales
        spinRuleta: spinRuletaWithValidation, // Usar versión con validación
        resetRuleta,
        closeResult,
        copyToClipboard,
        
        // Nuevas funciones
        checkCanSpin,
        
        // Función para limpiar errores
        clearError: useCallback(() => setError(null), [])
    };
};
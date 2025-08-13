// frontend/src/components/Ruleta/Hooks/useRuleta.jsx - VERSIÓN CORREGIDA
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
 
    // ✅ CORRECCIÓN: Acceso al contexto de autenticación híbrido
    const { isAuthenticated, getBestAvailableToken, setAuthToken } = useAuth();
 
    /**
     * ✅ FUNCIÓN EXISTENTE: Crear headers de autenticación híbridos
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
 
    // ✅ CORREGIDOS: Códigos de descuento que COINCIDEN con el backend
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
        // ✅ NUEVOS: Códigos adicionales que coinciden con el backend
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
     * ✅ FUNCIÓN CORREGIDA: Función principal para girar la ruleta y generar código en el backend
     * Ahora el backend devuelve nombres específicos que coinciden con discountCodes
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
 
        // ✅ CORREGIDO: Seleccionar un código aleatorio para preview que coincida con el backend
        const randomIndex = Math.floor(Math.random() * discountCodes.length);
        const selectedDiscount = {
            ...discountCodes[randomIndex],
            code: generateRandomCode() // Código temporal para preview
        };
 
        // Tiempo de giro: 4 segundos (animación original)
        setTimeout(async () => {
            console.log('⏰ Animación de 4s completada, manteniendo fullscreen...');
           
            // Generar código real en el backend mientras el fullscreen sigue activo
            try {
                // ✅ LÓGICA EXISTENTE: Llamar al backend para generar código real con sistema híbrido
                const operationPromise = fetch('https://marquesa.onrender.com/api/clients/ruleta/generate', {
                    method: 'POST',
                    credentials: 'include', // Incluir cookies
                    headers: getAuthHeaders(), // Headers híbridos
                    // ✅ NUEVO: Enviar datos vacíos para que el backend use su lógica de selección aleatoria
                    body: JSON.stringify({
                        // Dejar vacío para que el backend seleccione aleatoriamente
                        // de sus listas predefinidas que ahora coinciden con el frontend
                    })
                });
 
                // Timeout para conexiones lentas
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('TIMEOUT')), 30000);
                });
 
                const response = await Promise.race([operationPromise, timeoutPromise]);
                const data = await response.json();
 
                if (response.ok && data.success) {
                    console.log('✅ Código real generado en el backend:', data.code);
 
                    // Manejo híbrido de tokens
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
 
                    // ✅ CORREGIDO: Usar el código real del backend (ahora tiene nombres específicos)
                    const realCode = {
                        code: data.code.code,
                        name: data.code.name, // ✅ Ahora viene del backend con nombres específicos
                        discount: data.code.discount, // ✅ Ahora viene del backend con descuentos específicos
                        color: data.code.color, // ✅ Ahora viene del backend con colores específicos
                        textColor: data.code.textColor, // ✅ Ahora viene del backend
                        expiresAt: data.code.expiresAt
                    };
 
                    console.log('✅ Código real con nombre específico:', {
                        name: realCode.name,
                        discount: realCode.discount,
                        code: realCode.code
                    });
 
                    setSelectedCode(realCode);
                } else {
                    // Si hay error, usar el código de preview
                    console.error('❌ Error del backend, usando código preview:', data.message);
                    setSelectedCode(selectedDiscount);
                    setError(data.message || 'Error al generar código, usando código temporal');
                }
            } catch (error) {
                console.error('❌ Error de conexión, usando código preview:', error);
               
                // Manejo específico de errores de red vs servidor
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
     * ✅ FUNCIÓN EXISTENTE: Función para verificar si el usuario puede girar la ruleta
     */
    const checkCanSpin = useCallback(async () => {
        if (!isAuthenticated) {
            return { canSpin: false, reason: 'Debes iniciar sesión para girar la ruleta' };
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
       
        // ✅ CORREGIDOS: Datos para preview (ahora coinciden con backend)
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
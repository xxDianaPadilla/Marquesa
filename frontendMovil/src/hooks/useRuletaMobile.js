// frontendMovil/src/hooks/useRuletaMobile.js
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ruletaService from '../services/RuletaService';

/**
 * Hook personalizado para manejar la lógica de la ruleta en React Native
 * Basado en useRuleta.jsx del frontend web pero adaptado para móvil
 */
export const useRuletaMobile = () => {
    // Estados de la UI de la ruleta
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [error, setError] = useState(null);

    // Acceso al contexto de autenticación
    const { isAuthenticated, getBestAvailableToken, saveTokenToStorage } = useAuth();

    // Función para generar código aleatorio de 6 dígitos (para mostrar en UI preview)
    const generateRandomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Códigos de descuento que COINCIDEN con el backend (copiados del web)
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
     * Función principal para girar la ruleta y generar código en el backend
     * Adaptada de la versión web con manejo específico para móvil
     */
    const spinRuleta = useCallback(async () => {
        if (isSpinning || hasSpun) return;

        // Verificar autenticación
        if (!isAuthenticated) {
            setError('Debes iniciar sesión para girar la ruleta');
            return;
        }

        console.log('🎰 Iniciando giro de ruleta móvil...');
        setIsSpinning(true);
        setShowResult(false);
        setError(null);

        // Seleccionar un código aleatorio para preview
        const randomIndex = Math.floor(Math.random() * discountCodes.length);
        const selectedDiscount = {
            ...discountCodes[randomIndex],
            code: generateRandomCode() // Código temporal para preview
        };

        // Tiempo de giro: 4 segundos (mismo que web)
        setTimeout(async () => {
            console.log('⏰ Animación de 4s completada, generando código real...');
           
            try {
                // Obtener token actual
                const token = await getBestAvailableToken();
                if (!token) {
                    throw new Error('No hay sesión activa');
                }

                // Generar código real en el backend
                const response = await ruletaService.generateDiscountCode(token);

                if (response.success) {
                    console.log('✅ Código real generado:', response.code);

                    // Manjo de tokens (si viene nuevo token del backend)
                    if (response.token) {
                        await saveTokenToStorage(response.token);
                    }

                    // Usar el código real del backend
                    const realCode = {
                        code: response.code.code,
                        name: response.code.name,
                        discount: response.code.discount,
                        color: response.code.color,
                        textColor: response.code.textColor,
                        expiresAt: response.code.expiresAt
                    };

                    console.log('✅ Código real con nombre específico:', {
                        name: realCode.name,
                        discount: realCode.discount,
                        code: realCode.code
                    });

                    setSelectedCode(realCode);
                } else {
                    // Si hay error, usar el código de preview
                    console.error('❌ Error del backend, usando código preview');
                    setSelectedCode(selectedDiscount);
                    setError('Error al generar código, usando código temporal');
                }
            } catch (error) {
                console.error('❌ Error de conexión, usando código preview:', error);
               
                // Manejo específico de errores para móvil
                let errorMessage = 'Error de conexión, usando código temporal';
               
                if (error.message === 'TIMEOUT') {
                    errorMessage = 'La conexión tardó demasiado tiempo. Usando código temporal.';
                } else if (error.message?.includes('network')) {
                    errorMessage = 'Error de red. Usando código temporal.';
                } else if (error.message === 'No hay sesión activa') {
                    errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
                }
               
                setSelectedCode(selectedDiscount);
                setError(errorMessage);
            }

            // Mostrar resultado
            setIsSpinning(false);
            setShowResult(true);
            setHasSpun(true);
            console.log('🎉 Modal de resultado mostrado');
        }, 4000); // Timing original - 4 segundos
    }, [isSpinning, hasSpun, isAuthenticated, getBestAvailableToken, saveTokenToStorage]);

    /**
     * Función para verificar si el usuario puede girar la ruleta
     */
    const checkCanSpin = useCallback(async () => {
        if (!isAuthenticated) {
            return { canSpin: false, reason: 'Debes iniciar sesión para girar la ruleta' };
        }

        try {
            const token = await getBestAvailableToken();
            if (!token) {
                return { canSpin: false, reason: 'No hay sesión activa' };
            }

            const result = await ruletaService.checkCanSpin(token);
            
            // Actualizar token si viene en la respuesta
            if (result.token) {
                await saveTokenToStorage(result.token);
            }

            return result;

        } catch (error) {
            console.error('Error verificando códigos:', error);
            return { canSpin: false, reason: 'Error de conexión. Verifica tu internet.' };
        }
    }, [isAuthenticated, getBestAvailableToken, saveTokenToStorage]);

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

    /**
     * Función para resetear la ruleta
     */
    const resetRuleta = useCallback(() => {
        console.log('🔄 Reseteando ruleta móvil...');
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
     * Función para copiar código al portapapeles (React Native)
     */
    const copyToClipboard = useCallback(async (code) => {
        try {
            // En React Native necesitamos importar Clipboard
            const { Clipboard } = require('react-native');
            await Clipboard.setString(code);
            console.log('📋 Código copiado al portapapeles:', code);
            return true;
        } catch (error) {
            console.error('❌ Error al copiar código:', error);
            return false;
        }
    }, []);

    /**
     * Función para obtener códigos del usuario
     */
    const getUserCodes = useCallback(async () => {
        if (!isAuthenticated) {
            return { success: false, codes: [], reason: 'Usuario no autenticado' };
        }

        try {
            const token = await getBestAvailableToken();
            if (!token) {
                return { success: false, codes: [], reason: 'No hay sesión activa' };
            }

            const result = await ruletaService.getUserCodes(token);
            
            // Actualizar token si viene en la respuesta
            if (result.token) {
                await saveTokenToStorage(result.token);
            }

            return result;

        } catch (error) {
            console.error('Error obteniendo códigos del usuario:', error);
            return { 
                success: false, 
                codes: [], 
                reason: 'Error de conexión. Verifica tu internet.' 
            };
        }
    }, [isAuthenticated, getBestAvailableToken, saveTokenToStorage]);

    return {
        // Estados de la UI
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        error,
       
        // Datos para preview (coinciden con backend)
        discountCodes,
       
        // Funciones principales
        spinRuleta: spinRuletaWithValidation, // Usar versión con validación
        resetRuleta,
        closeResult,
        copyToClipboard,
        getUserCodes,
       
        // Nuevas funciones
        checkCanSpin,
       
        // Función para limpiar errores
        clearError: useCallback(() => setError(null), [])
    };
};
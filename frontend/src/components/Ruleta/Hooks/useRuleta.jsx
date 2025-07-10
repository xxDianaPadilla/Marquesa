// frontend/src/components/Ruleta/Hooks/useRuleta.jsx
import { useState, useCallback } from 'react';

export const useRuleta = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);

    // Función para generar código aleatorio de 6 dígitos
    const generateRandomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Códigos de descuento disponibles con colores exactos de la imagen
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

    const spinRuleta = useCallback(() => {
        if (isSpinning || hasSpun) return;

        console.log('🎰 Iniciando giro de ruleta...');
        setIsSpinning(true);
        setShowResult(false);

        // Seleccionar un código aleatorio al inicio
        const randomIndex = Math.floor(Math.random() * discountCodes.length);
        const selectedDiscount = {
            ...discountCodes[randomIndex],
            code: generateRandomCode() // Generar código aleatorio de 6 dígitos
        };
        console.log('🎯 Código seleccionado:', selectedDiscount);

        // Tiempo de giro: 4 segundos (coincide con la animación CSS)
        setTimeout(() => {
            console.log('⏰ Giro completado, mostrando resultado...');
            setSelectedCode(selectedDiscount);
            setIsSpinning(false);
            
            // Pequeña pausa antes de mostrar el modal para mejor UX
            setTimeout(() => {
                setShowResult(true);
                setHasSpun(true);
                console.log('🎉 Modal de resultado mostrado');
            }, 1000);
        }, 4000); // 4 segundos - coincide con la animación CSS
    }, [isSpinning, hasSpun, discountCodes]);

    const resetRuleta = useCallback(() => {
        console.log('🔄 Reseteando ruleta...');
        setIsSpinning(false);
        setSelectedCode(null);
        setShowResult(false);
        setHasSpun(false);
    }, []);

    const closeResult = useCallback(() => {
        console.log('❌ Cerrando modal de resultado...');
        setShowResult(false);
    }, []);

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

    return {
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        discountCodes,
        spinRuleta,
        resetRuleta,
        closeResult,
        copyToClipboard
    };
};
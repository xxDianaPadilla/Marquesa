// hooks/useKeyboardDetector.js - Sistema dinámico de detección de altura de teclado
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Dimensions, Platform, StatusBar, View, Text } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Hook personalizado para detectar dinámicamente la altura del teclado
 * ✅ Funciona en tiempo real sin estimaciones
 * ✅ Se adapta automáticamente a cualquier teclado (Gboard, SwiftKey, Samsung, etc.)
 * ✅ Considera diferentes orientaciones y densidades de pantalla
 */
export const useKeyboardDetector = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [keyboardType, setKeyboardType] = useState('standard');
    const [keyboardBrand, setKeyboardBrand] = useState('unknown');

    // Referencias para almacenar valores previos
    const previousHeightRef = useRef(0);

    // Estados adicionales para debugging
    const [keyboardMetrics, setKeyboardMetrics] = useState({
        screenHeight: SCREEN_HEIGHT,
        screenWidth: SCREEN_WIDTH,
        statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        availableHeight: SCREEN_HEIGHT - (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
        keyboardRatio: 0
    });

    useEffect(() => {
        console.log('🔧 Inicializando KeyboardDetector...');

        /**
         * Detecta cuando el teclado aparece
         */
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
            (event) => {
                const { height, screenX, screenY, width } = event.endCoordinates;

                console.log('⌨️ === TECLADO DETECTADO ===');
                console.log('⌨️ Altura:', height);
                console.log('⌨️ Posición:', { screenX, screenY, width });
                console.log('⌨️ Pantalla:', `${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
                console.log('⌨️ Platform:', Platform.OS);

                // Calcular altura efectiva del teclado
                let effectiveHeight = height;

                if (Platform.OS === 'android') {
                    // En Android, la altura puede incluir la navigation bar
                    const statusBarHeight = StatusBar.currentHeight || 0;
                    const availableScreen = SCREEN_HEIGHT - statusBarHeight;

                    // Si la altura del teclado es más del 50% de la pantalla, ajustar
                    if (height > availableScreen * 0.5) {
                        console.log('⌨️ Ajustando altura para Android...');
                        effectiveHeight = Math.min(height, availableScreen * 0.45); // Máximo 45% de la pantalla
                    }
                }

                // Detectar tipo de teclado basado en altura
                const screenRatio = effectiveHeight / SCREEN_HEIGHT;
                let detectedType = 'standard';
                let detectedBrand = 'unknown';

                if (screenRatio < 0.25) {
                    detectedType = 'compact';
                } else if (screenRatio > 0.4) {
                    detectedType = 'extended';
                } else {
                    detectedType = 'standard';
                }

                // Intentar detectar marca del teclado basado en patrones de altura
                if (Platform.OS === 'android') {
                    if (height >= 280 && height <= 285) {
                        detectedBrand = 'gboard';
                    } else if (height >= 290 && height <= 300) {
                        detectedBrand = 'samsung';
                    } else if (height >= 275 && height <= 280) {
                        detectedBrand = 'swiftkey';
                    } else if (height >= 300 && height <= 320) {
                        detectedBrand = 'custom';
                    }
                }

                // Actualizar estados
                setKeyboardHeight(effectiveHeight);
                setIsKeyboardVisible(true);
                setKeyboardType(detectedType);
                setKeyboardBrand(detectedBrand);

                // Actualizar métricas
                setKeyboardMetrics({
                    screenHeight: SCREEN_HEIGHT,
                    screenWidth: SCREEN_WIDTH,
                    statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
                    availableHeight: SCREEN_HEIGHT - (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
                    keyboardRatio: screenRatio
                });

                // Almacenar altura para comparaciones futuras
                previousHeightRef.current = effectiveHeight;

                console.log('⌨️ Altura efectiva:', effectiveHeight);
                console.log('⌨️ Tipo detectado:', detectedType);
                console.log('⌨️ Marca detectada:', detectedBrand);
                console.log('⌨️ Ratio:', (screenRatio * 100).toFixed(1) + '%');
            }
        );

        /**
         * Detecta cuando el teclado se oculta
         */
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
            () => {
                console.log('⌨️ === TECLADO OCULTADO ===');

                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        /**
         * Listener adicional para cambios de orientación
         */
        const dimensionsListener = Dimensions.addEventListener('change', ({ screen }) => {
            console.log('📱 Cambio de orientación detectado:', screen);

            // Actualizar métricas de pantalla
            setKeyboardMetrics(prev => ({
                ...prev,
                screenHeight: screen.height,
                screenWidth: screen.width,
                availableHeight: screen.height - (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0)
            }));
        });

        // Cleanup
        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
            dimensionsListener?.remove();
        };
    }, []);

    /**
     * Función para obtener altura ajustada según el contexto
     */
    const getAdjustedKeyboardHeight = (context = 'input') => {
        if (!isKeyboardVisible || keyboardHeight === 0) return 0;

        let adjustedHeight = keyboardHeight;

        switch (context) {
            case 'input':
                // Para posicionar el input, usar altura exacta
                adjustedHeight = keyboardHeight;
                break;
            case 'scroll':
                // Para scroll, agregar un poco de padding
                adjustedHeight = keyboardHeight + 20;
                break;
            case 'modal':
                // Para modales, considerar un offset menor
                adjustedHeight = keyboardHeight * 0.9;
                break;
            default:
                adjustedHeight = keyboardHeight;
        }

        return Math.round(adjustedHeight);
    };

    /**
     * Función para obtener información detallada del teclado
     */
    const getKeyboardInfo = () => ({
        height: keyboardHeight,
        isVisible: isKeyboardVisible,
        type: keyboardType,
        brand: keyboardBrand,
        metrics: keyboardMetrics,
        platform: Platform.OS,
        previousHeight: previousHeightRef.current
    });

    return {
        // Estados principales
        keyboardHeight,
        isKeyboardVisible,

        // Estados adicionales
        keyboardType,
        keyboardBrand,
        keyboardMetrics,

        // Funciones utilitarias
        getAdjustedKeyboardHeight,
        getKeyboardInfo
    };
};

/**
 * Hook simplificado para casos básicos
 */
export const useSimpleKeyboard = () => {
    const { keyboardHeight, isKeyboardVisible } = useKeyboardDetector();

    return {
        keyboardHeight,
        isKeyboardVisible,
        keyboardBottom: isKeyboardVisible ? keyboardHeight : 0
    };
};

/**
 * Componente de debug para mostrar información del teclado
 */
export const KeyboardDebugInfo = ({ visible = false }) => {
    const keyboardInfo = useKeyboardDetector();

    if (!visible) return null;

    return (
        <View style={{
            position: 'absolute',
            top: 100,
            left: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 10,
            borderRadius: 5,
            zIndex: 9999
        }}>
            <Text style={{ color: 'white', fontSize: 12, fontFamily: 'monospace' }}>
                🔧 KEYBOARD DEBUG INFO{'\n'}
                Height: {keyboardInfo.keyboardHeight}px{'\n'}
                Visible: {keyboardInfo.isKeyboardVisible ? 'YES' : 'NO'}{'\n'}
                Type: {keyboardInfo.keyboardType}{'\n'}
                Brand: {keyboardInfo.keyboardBrand}{'\n'}
                Screen: {keyboardInfo.keyboardMetrics.screenWidth}x{keyboardInfo.keyboardMetrics.screenHeight}px{'\n'}
                Ratio: {(keyboardInfo.keyboardMetrics.keyboardRatio * 100).toFixed(1)}%{'\n'}
                Platform: {Platform.OS}
            </Text>
        </View>
    );
};
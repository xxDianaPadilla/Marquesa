// ResponsiveHelper.js - Sistema responsive simplificado
import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints para responsive design
const BREAKPOINTS = {
    small: 320,    // iPhone SE, Galaxy S5
    medium: 375,   // iPhone X, 11, 12, 13
    large: 414,    // iPhone Plus, Max
    tablet: 768    // Tablets
};

// Función para obtener el factor de escala según el ancho de pantalla
const getScaleFactor = () => {
    if (SCREEN_WIDTH <= BREAKPOINTS.small) return 0.85;
    if (SCREEN_WIDTH <= BREAKPOINTS.medium) return 0.95;
    if (SCREEN_WIDTH <= BREAKPOINTS.large) return 1;
    if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return 1.1;
    return 1.2;
};

// ✅ EXPORTAR - Función principal para obtener valores responsive
export const responsive = (size) => {
    const scaleFactor = getScaleFactor();
    return Math.round(size * scaleFactor);
};

// ✅ EXPORTAR - Obtener padding horizontal adaptive
export const getHorizontalPadding = () => {
    if (SCREEN_WIDTH <= 360) return responsive(12);
    if (SCREEN_WIDTH <= 393) return responsive(16);
    if (SCREEN_WIDTH <= 412) return responsive(16);
    if (SCREEN_WIDTH >= 600) return responsive(24);
    return responsive(16);
};

// ✅ EXPORTAR - Obtener altura estimada del teclado según dispositivo
export const getKeyboardHeight = () => {
    if (SCREEN_WIDTH <= 360) return 255;        // Dispositivos pequeños
    if (SCREEN_WIDTH <= 393) return 275;        // Dispositivos medianos
    if (SCREEN_WIDTH <= 412) return 285;        // Dispositivos grandes
    if (SCREEN_WIDTH >= 600) return 315;        // Tablets
    return 280; // Default
};

// ✅ EXPORTAR - Obtener altura del header con consideración de notch
export const getHeaderHeight = () => {
    const baseHeight = responsive(56);
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const notchPadding = responsive(8); // Padding por defecto
    
    return baseHeight + statusBarHeight + notchPadding;
};

// ✅ EXPORTAR - Obtener tamaño del botón scroll to bottom
export const getScrollButtonSize = () => {
    if (SCREEN_WIDTH <= 360) return responsive(44);
    if (SCREEN_WIDTH <= 393) return responsive(48);
    return responsive(48);
};

// ✅ EXPORTAR - Obtener dimensiones para preview de imagen
export const getImagePreviewDimensions = () => {
    if (SCREEN_WIDTH <= 360) {
        return { width: responsive(60), height: responsive(60) };
    } else if (SCREEN_WIDTH <= 393) {
        return { width: responsive(70), height: responsive(70) };
    } else if (SCREEN_WIDTH <= 412) {
        return { width: responsive(80), height: responsive(80) };
    }
    return { width: responsive(90), height: responsive(90) };
};

// ✅ EXPORTAR - Calcular altura del preview container
export const getImagePreviewContainerHeight = () => {
    const previewDims = getImagePreviewDimensions();
    const padding = responsive(16);
    const textHeight = responsive(20);
    return previewDims.height + (padding * 2) + textHeight;
};

// ✅ EXPORTAR - Obtener tamaños de botones responsive
export const getButtonSizes = () => {
    if (SCREEN_WIDTH <= 360) {
        return {
            small: responsive(36),
            medium: responsive(40),
            large: responsive(44)
        };
    } else if (SCREEN_WIDTH <= 393) {
        return {
            small: responsive(38),
            medium: responsive(42),
            large: responsive(46)
        };
    } else if (SCREEN_WIDTH <= 412) {
        return {
            small: responsive(40),
            medium: responsive(44),
            large: responsive(48)
        };
    }
    return {
        small: responsive(42),
        medium: responsive(46),
        large: responsive(50)
    };
};

// ✅ EXPORTAR - Obtener configuración de texto responsive
export const getTextSizes = () => {
    return {
        tiny: responsive(10),
        small: responsive(12),
        medium: responsive(14),
        large: responsive(16),
        xlarge: responsive(18),
        xxlarge: responsive(20),
        xxxlarge: responsive(24)
    };
};

// ✅ EXPORTAR - Configuración específica para input de chat
export const getChatInputConfig = () => {
    const buttons = getButtonSizes();
    const padding = getHorizontalPadding();
    
    return {
        containerPadding: padding,
        inputMinHeight: responsive(40),
        inputMaxHeight: responsive(100),
        buttonSize: buttons.medium,
        borderRadius: responsive(20),
        fontSize: responsive(16)
    };
};

// ✅ EXPORTAR - Configuración para burbujas de chat
export const getChatBubbleConfig = () => {
    const maxWidth = SCREEN_WIDTH <= 360 ? '85%' : SCREEN_WIDTH <= 393 ? '78%' : '75%';
    
    return {
        maxWidth,
        borderRadius: responsive(18),
        paddingHorizontal: responsive(12),
        paddingVertical: responsive(8),
        marginVertical: responsive(2),
        fontSize: responsive(16),
        lineHeight: responsive(20)
    };
};

// ✅ EXPORTAR - Debug info para desarrollo
export const getDeviceInfo = () => {
    return {
        screenWidth: SCREEN_WIDTH,
        screenHeight: SCREEN_HEIGHT,
        scaleFactor: getScaleFactor(),
        keyboardHeight: getKeyboardHeight(),
        platform: Platform.OS,
        statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    };
};

// ✅ EXPORTAR - Función para logging de debug
export const logDeviceInfo = () => {
    const info = getDeviceInfo();
    console.log('📱 === DEVICE INFO ===');
    console.log(`📱 Screen: ${info.screenWidth}x${info.screenHeight}`);
    console.log(`📱 Scale Factor: ${info.scaleFactor}`);
    console.log(`📱 Keyboard Height: ${info.keyboardHeight}px`);
    console.log(`📱 Platform: ${info.platform}`);
    console.log(`📱 Status Bar: ${info.statusBarHeight}px`);
    console.log('📱 ==================');
};
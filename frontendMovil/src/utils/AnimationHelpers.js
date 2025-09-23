// Utilidades para animaciones en el sistema de login
// Este archivo contiene funciones auxiliares para manejar animaciones de alertas y elementos UI

import { Animated, Easing } from 'react-native';

// Configuración de animaciones para alertas y notificaciones
export const ANIMATION_CONFIG = {
    // Duración de animaciones en milisegundos
    slideInDuration: 400,
    slideOutDuration: 300,
    progressDuration: 300,
    pulseDuration: 1000,
    
    // Configuraciones de easing
    slideEasing: Easing.out(Easing.cubic),
    progressEasing: Easing.out(Easing.quad),
    pulseEasing: Easing.inOut(Easing.sine),
};

// Clase con utilidades de animación
export class AnimationHelpers {
    // Anima la entrada de una alerta con deslizamiento
    static slideInAlert(animatedValue, callback = null) {
        return Animated.timing(animatedValue, {
            toValue: 1,
            duration: ANIMATION_CONFIG.slideInDuration,
            easing: ANIMATION_CONFIG.slideEasing,
            useNativeDriver: true,
        }).start(callback);
    }

    // Anima la salida de una alerta con deslizamiento
    static slideOutAlert(animatedValue, callback = null) {
        return Animated.timing(animatedValue, {
            toValue: 0,
            duration: ANIMATION_CONFIG.slideOutDuration,
            easing: ANIMATION_CONFIG.slideEasing,
            useNativeDriver: true,
        }).start(callback);
    }

    // Anima la barra de progreso de intentos
    static animateProgressBar(animatedValue, progress, callback = null) {
        return Animated.timing(animatedValue, {
            toValue: progress,
            duration: ANIMATION_CONFIG.progressDuration,
            easing: ANIMATION_CONFIG.progressEasing,
            useNativeDriver: false, // No se puede usar nativeDriver para width
        }).start(callback);
    }

    // Anima un efecto de pulso para elementos importantes
    static createPulseAnimation(animatedValue) {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1.1,
                    duration: ANIMATION_CONFIG.pulseDuration / 2,
                    easing: ANIMATION_CONFIG.pulseEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: ANIMATION_CONFIG.pulseDuration / 2,
                    easing: ANIMATION_CONFIG.pulseEasing,
                    useNativeDriver: true,
                }),
            ])
        );
    }

    // Anima la rotación continua de un spinner
    static createSpinAnimation(animatedValue) {
        animatedValue.setValue(0);
        return Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
    }

    // Interpola valores para transformaciones de deslizamiento
    static getSlideTransform(animatedValue, fromY = -20, toY = 0) {
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [fromY, toY],
        });
    }

    // Interpola valores para opacidad
    static getOpacityTransform(animatedValue, fromOpacity = 0, toOpacity = 1) {
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [fromOpacity, toOpacity],
        });
    }

    // Interpola valores para colores en la barra de progreso
    static getProgressColorTransform(animatedValue) {
        return animatedValue.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: ['#FFA500', '#FF6B35', '#FF3333'],
        });
    }

    // Interpola valores para el ancho de la barra de progreso
    static getProgressWidthTransform(animatedValue) {
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });
    }

    // Interpola valores para rotación de spinner
    static getSpinTransform(animatedValue) {
        return animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
    }

    // Combina múltiples animaciones en secuencia
    static sequenceAnimations(animations) {
        return Animated.sequence(animations);
    }

    // Combina múltiples animaciones en paralelo
    static parallelAnimations(animations) {
        return Animated.parallel(animations);
    }

    // Anima un retraso antes de ejecutar otra animación
    static delayAnimation(duration) {
        return Animated.delay(duration);
    }
}

// Exportar configuración y utilidades por defecto
export default AnimationHelpers;
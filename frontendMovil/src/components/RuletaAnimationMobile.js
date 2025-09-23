// frontendMovil/src/components/RuletaAnimationMobile.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    StyleSheet,
    Dimensions,
    Text
} from 'react-native';
import ruletaImage from '../images/ruletaDescuentos.png'; // Importa la imagen de la ruleta

const { width } = Dimensions.get('window');

/**
 * Componente de animación de la ruleta para React Native
 * Adaptado de la versión web con animaciones nativas
 */
export default function RuletaAnimationMobile({ 
    isSpinning, 
    onSpin, 
    hasSpun, 
    showResult 
}) {
    const [canPress, setCanPress] = useState(true);
    const spinValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Calcular tamaño de la ruleta basado en pantalla
    const ruletaSize = Math.min(width * 0.8, 300);

    /**
     * Manejar el toque en la ruleta
     */
    const handlePress = () => {
        if (!canPress || isSpinning || hasSpun) return;

        console.log('🎰 Usuario tocó la ruleta');
        setCanPress(false);
        
        // Efecto de escala al tocar
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        // Iniciar giro
        if (onSpin) {
            onSpin();
        }
    };

    /**
     * Efecto para manejar la animación de giro
     */
    useEffect(() => {
        if (isSpinning) {
            console.log('🎮 Iniciando animación de giro...');
            
            // Reset del valor de giro
            spinValue.setValue(0);

            // Animación de giro completa (4 segundos)
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 4000, // 4 segundos igual que web
                easing: Easing.out(Easing.cubic), // Easing que desacelera al final
                useNativeDriver: true,
            }).start(() => {
                console.log('✅ Animación de giro completada');
                setCanPress(true);
            });
        }
    }, [isSpinning, spinValue]);

    /**
     * Efecto para resetear estado cuando se resetea la ruleta
     */
    useEffect(() => {
        if (!isSpinning && !hasSpun && !showResult) {
            console.log('🔄 Reseteando animación de ruleta');
            spinValue.setValue(0);
            scaleValue.setValue(1);
            setCanPress(true);
        }
    }, [isSpinning, hasSpun, showResult, spinValue, scaleValue]);

    // Interpolación para la rotación (múltiples vueltas)
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1800deg'], // 5 vueltas completas
    });

    // Opacidad para efecto visual durante el giro
    const opacity = spinValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.8, 1],
    });

    return (
        <View style={styles.container}>
            <View style={styles.ruletaContainer}>
                {/* Sombra de la ruleta */}
                <View 
                    style={[
                        styles.ruletaShadow, 
                        { 
                            width: ruletaSize + 10, 
                            height: ruletaSize + 10 
                        }
                    ]} 
                />
                
                {/* Ruleta principal con animación */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePress}
                    disabled={!canPress || isSpinning || hasSpun}
                    style={[
                        styles.ruletaTouchable,
                        { 
                            width: ruletaSize, 
                            height: ruletaSize,
                            opacity: (canPress && !isSpinning && !hasSpun) ? 1 : 0.7
                        }
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.ruletaAnimated,
                            {
                                transform: [
                                    { rotate: spin },
                                    { scale: scaleValue }
                                ],
                                opacity: opacity,
                            }
                        ]}
                    >
                        <Image
                            source={ruletaImage}
                            style={[
                                styles.ruletaImage,
                                { width: ruletaSize, height: ruletaSize }
                            ]}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </TouchableOpacity>

                {/* Indicador/aguja de la ruleta (estático) */}
                <View style={styles.indicatorContainer}>
                    <View style={styles.indicator} />
                </View>

                {/* Texto de estado debajo de la ruleta */}
                <View style={styles.statusContainer}>
                    {isSpinning && (
                        <Text style={styles.spinningText}>
                            🎲 Girando...
                        </Text>
                    )}
                    {!isSpinning && !hasSpun && canPress && (
                        <Text style={styles.readyText}>
                            ¡Toca para girar!
                        </Text>
                    )}
                    {hasSpun && !isSpinning && (
                        <Text style={styles.completedText}>
                            ¡Código generado! 🎉
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    ruletaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ruletaShadow: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        top: 5,
        left: -5,
    },
    ruletaTouchable: {
        borderRadius: 1000,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    ruletaAnimated: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ruletaImage: {
        borderRadius: 1000,
    },
    indicatorContainer: {
        position: 'absolute',
        top: -10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    indicator: {
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 25,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#E8ACD2', // Color rosa de la marca
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statusContainer: {
        marginTop: 30,
        alignItems: 'center',
        minHeight: 30,
    },
    spinningText: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#E8ACD2',
        textAlign: 'center',
    },
    readyText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        textAlign: 'center',
    },
    completedText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#4CAF50',
        textAlign: 'center',
    },
});
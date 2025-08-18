import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import logoMovil from '../images/logoMovil.png';

// Obtener las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Animaciones inicializadas con valores de inicio
  const fadeAnim = new Animated.Value(0); // Para efecto fade in/out (opacidad)
  const scaleAnim = new Animated.Value(0.5); // Para efecto de escala (crecimiento)
  const slideAnim = new Animated.Value(50); // Para efecto de deslizamiento vertical
  const progressAnim = new Animated.Value(0); // Para la barra de progreso de carga

  useEffect(() => {
    // Ejecutar animaciones de entrada en paralelo
    Animated.parallel([
      // Animación de fade in (aparición gradual)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Animación de escala con efecto spring (rebote)
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50, // Tensión del resorte
        friction: 8, // Fricción del resorte
        useNativeDriver: true,
      }),
      // Animación de deslizamiento hacia arriba
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de la barra de progreso (no usa native driver por el width)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false, 
    }).start();

    // Timer para navegar a la siguiente pantalla después de 3 segundos
    const timer = setTimeout(() => {
      // Animaciones de salida en paralelo
      Animated.parallel([
        // Fade out (desvanecimiento)
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Reducción de escala
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navegar a la pantalla Welcome cuando terminen las animaciones
        navigation.replace('Welcome');
      });
    }, 3000);

    // Cleanup: limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Decoración de fondo con círculos flotantes */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      {/* Logo y texto principal con animaciones */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim, // Aplicar animación de opacidad
            transform: [
              { scale: scaleAnim }, // Aplicar animación de escala
              { translateY: slideAnim } // Aplicar animación de deslizamiento
            ],
          },
        ]}
      >
        {/* Contenedor del icono decorativo */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🌸</Text>
        </View>

        {/* Logo de la aplicación */}
        <Image source={logoMovil} style={styles.appName} />
        {/* Texto descriptivo de la app */}
        <Text style={styles.tagline}>Momentos Inolvidables</Text>
      </Animated.View>

      {/* Indicador de carga con barra de progreso */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim, // Aplicar misma animación de opacidad
            transform: [{ translateY: slideAnim }], // Aplicar misma animación de deslizamiento
          },
        ]}
      >
        <Text style={styles.loadingText}>Cargando...</Text>
        {/* Contenedor de la barra de progreso */}
        <View style={styles.loadingBar}>
          {/* Barra de progreso animada */}
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                // Interpolar el progreso de 0% a 100% basado en progressAnim
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  container: {
    flex: 1,
    backgroundColor: '#FADDDD', // Color de fondo rosa suave
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Contenedor de elementos decorativos de fondo
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  // Estilo base para los círculos decorativos
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Blanco semi-transparente
    borderRadius: 100, // Hace los elementos circulares
  },
  // Círculo decorativo 1 - grande, arriba izquierda
  circle1: {
    width: 200,
    height: 200,
    top: 80,
    left: -60,
  },
  // Círculo decorativo 2 - mediano, abajo derecha
  circle2: {
    width: 120,
    height: 120,
    bottom: 150,
    right: -40,
  },
  // Círculo decorativo 3 - pequeño, centro derecha
  circle3: {
    width: 80,
    height: 80,
    top: '55%',
    right: 40,
  },
  // Círculo decorativo 4 - grande, arriba derecha, más transparente
  circle4: {
    width: 160,
    height: 160,
    top: '20%',
    right: -50,
    opacity: 0.5,
  },
  // Contenedor del logo y textos principales
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  // Contenedor del icono emoji con sombra
  iconContainer: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Fondo blanco semi-transparente
    borderRadius: 45, // Hace el contenedor circular
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    // Propiedades de sombra para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Sombra para Android
  },
  // Estilo del emoji del icono
  icon: {
    fontSize: 45,
  },
  // Estilo del nombre de la aplicación
  appName: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#6B4B6B', // Color morado/rosa oscuro
    letterSpacing: 4, // Espaciado entre letras
    marginBottom: 15,
    textAlign: 'center',
  },
  // Estilo del texto descriptivo
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#3C3550', // Color gris-morado oscuro
    opacity: 0.9,
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Contenedor del indicador de carga
  loadingContainer: {
    position: 'absolute',
    bottom: 120, // Posicionado cerca de la parte inferior
    width: width * 0.7, // 70% del ancho de la pantalla
    alignItems: 'center',
  },
  // Estilo del texto "Cargando..."
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B7B8B', // Color gris-morado suave
    marginBottom: 15,
    opacity: 0.8,
  },
  // Contenedor de la barra de progreso (fondo)
  loadingBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(107, 75, 107, 0.2)', // Fondo de la barra semi-transparente
    borderRadius: 2,
    overflow: 'hidden', // Ocultar contenido que se salga del contenedor
  },
  // Barra de progreso animada (relleno)
  loadingProgress: {
    height: '100%',
    backgroundColor: '#E8A5A5', // Color rosa para el progreso
    borderRadius: 2,
  },
});
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import logoMovil from '../images/logoMovil.png';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  const slideAnim = new Animated.Value(50);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false, 
    }).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace('Welcome');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Decoración de fondo */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      {/* Logo y texto principal */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          },
        ]}
      >
        {/* Icono decorativo */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🌸</Text>
        </View>

        {/* Nombre de la app */}
        <Image source={logoMovil} style={styles.appName} />
        <Text style={styles.tagline}>Momentos Inolvidables</Text>
      </Animated.View>

      {/* Indicador de carga */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.loadingText}>Cargando...</Text>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
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
  container: {
    flex: 1,
    backgroundColor: '#FADDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
  },
  circle1: {
    width: 200,
    height: 200,
    top: 80,
    left: -60,
  },
  circle2: {
    width: 120,
    height: 120,
    bottom: 150,
    right: -40,
  },
  circle3: {
    width: 80,
    height: 80,
    top: '55%',
    right: 40,
  },
  circle4: {
    width: 160,
    height: 160,
    top: '20%',
    right: -50,
    opacity: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  iconContainer: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 45,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#6B4B6B',
    letterSpacing: 4,
    marginBottom: 15,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#3C3550',
    opacity: 0.9,
    textAlign: 'center',
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    width: width * 0.7,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8B7B8B',
    marginBottom: 15,
    opacity: 0.8,
  },
  loadingBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(107, 75, 107, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#E8A5A5',
    borderRadius: 2,
  },
});
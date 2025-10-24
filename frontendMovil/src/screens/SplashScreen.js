import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import videoSplash from "../Video/splashScreenVideo.mp4";

// Obtener las dimensiones de la pantalla del dispositivo
const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Referencia para controlar el componente de video
  const videoRef = useRef(null);

  useEffect(() => {
    // Timer para navegar a la siguiente pantalla después de que termine el video
    // Ajusta el tiempo según la duración de tu video
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000); // 3 segundos - ajusta según la duración de tu video

    // Cleanup: limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Componente de video que ocupa toda la pantalla */}
      <Video
        ref={videoRef}
        source={videoSplash}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        isMuted={false}
        onPlaybackStatusUpdate={(status) => {
          // Navegar cuando el video termine de reproducirse
          if (status.didJustFinish) {
            navigation.replace('Welcome');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fondo negro para evitar parpadeos
  },
  // Estilo del video para que ocupe toda la pantalla
  video: {
    width: width,
    height: height,
  },
});
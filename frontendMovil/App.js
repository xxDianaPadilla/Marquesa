// Importaciones de Expo y React Native
import { StatusBar } from 'expo-status-bar'; // StatusBar de Expo para controlar la barra de estado
import { StyleSheet, View, Text } from 'react-native'; // Componentes básicos de React Native

// Importaciones de navegación y contextos
import Navigation from './src/navigation/Navigation'; // Componente principal de navegación
import { AuthProvider } from './src/context/AuthContext'; // Proveedor de contexto para autenticación
import { CartProvider } from './src/context/CartContext'; // Proveedor de contexto para carrito de compras

// Importaciones para manejo de fuentes
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen'; // Control del splash screen nativo
import { useEffect } from 'react';

// Prevenir que el splash screen nativo se oculte automáticamente
// Esto permite controlar manualmente cuándo ocultarlo después de cargar las fuentes
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Hook para cargar las fuentes de Google Fonts
  // Devuelve un boolean que indica si las fuentes están cargadas
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,    // Fuente regular (peso 400)
    'Poppins-Medium': Poppins_500Medium,      // Fuente mediana (peso 500)
    'Poppins-SemiBold': Poppins_600SemiBold, // Fuente semi-bold (peso 600)
    'Poppins-Bold': Poppins_700Bold,          // Fuente bold (peso 700)
  });

  // Efecto que se ejecuta cuando las fuentes terminan de cargar
  useEffect(() => {
    if (fontsLoaded) {
      // Ocultar el splash screen nativo una vez que las fuentes estén listas
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]); // Dependencia: se ejecuta cuando fontsLoaded cambia

  // Mostrar pantalla de carga mientras las fuentes no estén disponibles
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // Renderizar la aplicación principal una vez que las fuentes estén cargadas
  return (
    <View style={styles.container}>
      {/* Estructura de proveedores de contexto anidados */}
      {/* AuthProvider: Proporciona contexto de autenticación a toda la app */}
      <AuthProvider>
        {/* CartProvider: Proporciona contexto del carrito de compras */}
        <CartProvider>
          {/* Componente principal de navegación */}
          <Navigation />
        </CartProvider>
      </AuthProvider>
      {/* StatusBar con configuración automática según el tema del dispositivo */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal de la aplicación
  container: {
    flex: 1 // Ocupa toda la pantalla disponible
  },
  // Contenedor para la pantalla de carga de fuentes
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', // Centrar verticalmente
    alignItems: 'center',     // Centrar horizontalmente
    backgroundColor: '#F5D7DA', // Fondo rosa suave coherente con el tema de la app
  }
});
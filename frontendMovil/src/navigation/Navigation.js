// Importamos React para poder crear el componente
import React from "react";
// Importamos el contenedor principal de navegación de React Navigation
import { NavigationContainer } from "@react-navigation/native";
// Importamos la función para crear un stack navigator nativo (iOS/Android)
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// Importamos nuestro provider de contexto de autenticación
import { AuthProvider } from "../context/AuthContext";
// IMPORTAMOS CART PROVIDER
import { CartProvider } from "../context/CartContext";
// Importamos el navegador de pestañas (tabs) principal de la app
import TabNavigator from "./TabNavigator";
// Importamos todas las pantallas que formarán parte de la navegación:
import SplashScreen from "../screens/SplashScreen";       // Pantalla de carga inicial
import WelcomeScreen from "../screens/WelcomeScreen";     // Pantalla de bienvenida
import LoginScreen from "../screens/LoginScreen";         // Pantalla de login
import ProfileScreen from "../screens/ProfileScreen";     // Pantalla de perfil de usuario
import SearchScreen from "../screens/SearchScreen";       // Pantalla de búsqueda
import RegisterScreen from "../screens/RegisterScreen";
import RecoveryPasswordScreen from "../screens/RecoveryPasswordScreen";
import ShoppingCartScreen from "../screens/ShoppingCartScreen";
import RecoveryCodeScreen from "../screens/RecoveryCodeScreen";
import ChatScreen from "../screens/ChatScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import OrdersScreen from "../screens/OrdersScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import MediaScreen from "../screens/MediaScreen";
import CustomProductsScreen from "../screens/CustomProductsScreen";
import CustomizationFormScreen from "../screens/CustomizationFormScreen";
import PaymentProcessScreen from "../screens/PaymentProcessScreen";
import VideoPlayerScreen from "../screens/VideoPlayerScreen";

// ✅ NUEVAS PANTALLAS DE RULETA - IMPORTACIÓN
import RuletaScreen from "../screens/RuletaScreen";
import DiscountCodesScreen from "../screens/DiscountCodesScreen";

// Componente principal de navegación de toda la aplicación
export default function Navigation() {
    // Creamos una instancia del Stack Navigator
    // Stack = navegación tipo "pila" donde las pantallas se apilan una sobre otra
    const Stack = createNativeStackNavigator();

    return (
        // AuthProvider debe envolver CartProvider
        <AuthProvider>
            <CartProvider>
                {/* NavigationContainer es el contenedor raíz requerido por React Navigation */}
                {/* Maneja el estado de navegación y la vinculación con el sistema nativo */}
                <NavigationContainer>
                    {/* Stack.Navigator define la estructura de navegación tipo pila */}
                    <Stack.Navigator
                        initialRouteName="Splash"    // Pantalla inicial que se muestra al abrir la app
                        screenOptions={{             // Opciones que se aplican a TODAS las pantallas
                            headerShown: false,      // Oculta el header por defecto en todas las pantallas
                        }}
                    >
                        {/* 
                            Cada Stack.Screen define una pantalla en la pila de navegación
                            - name: identificador único para navegar a esta pantalla
                            - component: componente React que se renderiza
                        */}

                        {/* Pantalla de splash/carga inicial */}
                        <Stack.Screen
                            name="Splash"              // Nombre de la ruta
                            component={SplashScreen}   // Componente a renderizar
                        />

                        {/* Pantalla de bienvenida (onboarding) */}
                        <Stack.Screen
                            name="Welcome"             // Nombre de la ruta
                            component={WelcomeScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de inicio de sesión */}
                        <Stack.Screen
                            name="Login"               // Nombre de la ruta
                            component={LoginScreen}    // Componente a renderizar
                        />

                        {/* Navegador de pestañas (contiene Home, Categories, Cart, etc.) */}
                        <Stack.Screen
                            name="TabNavigator"        // Nombre de la ruta
                            component={TabNavigator}   // Componente del tab navigator
                        />

                        {/* Pantalla de perfil de usuario */}
                        <Stack.Screen
                            name="Profile"             // Nombre de la ruta
                            component={ProfileScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de registro */}
                        <Stack.Screen
                            name="Register"             // Nombre de la ruta
                            component={RegisterScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de recuperación de contraseña */}
                        <Stack.Screen
                            name="RecoveryPassword"             // Nombre de la ruta
                            component={RecoveryPasswordScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de carrito de compras */}
                        <Stack.Screen
                            name="ShoppingCart"             // Nombre de la ruta
                            component={ShoppingCartScreen}  // Componente a renderizar
                        />

                        {/* Pantalla código de recuperación de contraseña */}
                        <Stack.Screen
                            name="RecoveryCode"             // Nombre de la ruta
                            component={RecoveryCodeScreen}  // Componente a renderizar
                        />

                        {/* Pantalla código de chat */}
                        <Stack.Screen
                            name="Chat"             // Nombre de la ruta
                            component={ChatScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de detalles producto */}
                        <Stack.Screen
                            name="ProductDetail"             // Nombre de la ruta
                            component={ProductDetailScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de cambio de contraseña */}
                        <Stack.Screen
                            name="ChangePassword"             // Nombre de la ruta
                            component={ChangePasswordScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de edición de perfil */}
                        <Stack.Screen
                            name="EditProfile"             // Nombre de la ruta
                            component={EditProfileScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de pedidos del cliente */}
                        <Stack.Screen
                            name="Orders"             // Nombre de la ruta
                            component={OrdersScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de detalles del pedido */}
                        <Stack.Screen
                            name="OrderDetailsScreen"             // Nombre de la ruta
                            component={OrderDetailsScreen}        // Componente a renderizar
                        />

                        {/* Pantalla de multimedia */}
                        <Stack.Screen
                            name="Media"             // Nombre de la ruta
                            component={MediaScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de personalización de productos */}
                        <Stack.Screen
                            name="CustomProducts"             // Nombre de la ruta
                            component={CustomProductsScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de finalización de personalización de productos */}
                        <Stack.Screen
                            name="FinalizeCustomProducts"             // Nombre de la ruta
                            component={CustomizationFormScreen}  // Componente a renderizar
                        />

                        {/* Pantalla de proceso de pago */}
                        <Stack.Screen
                            name="PaymentProcess"
                            component={PaymentProcessScreen}
                            options={{
                                headerShown: false,
                                gestureEnabled: false
                            }}
                        />

                        {/* Pantalla de búsqueda */}
                        <Stack.Screen
                            name="Search"              // Nombre de la ruta
                            component={SearchScreen}   // Componente a renderizar
                            options={{                 // Opciones específicas para esta pantalla
                                headerShown: false,    // Sin header porque ya tiene el suyo propio
                                animation: 'slide_from_right', // Animación de entrada desde la derecha
                            }}
                        />
                        
                        <Stack.Screen
                            name="VideoPlayerScreen"
                            component={VideoPlayerScreen}
                        />

                        {/* ✅ NUEVAS PANTALLAS DE RULETA */}
                        
                        {/* Pantalla principal de la ruleta */}
                        <Stack.Screen
                            name="Ruleta"                  // Nombre de la ruta
                            component={RuletaScreen}       // Componente a renderizar
                            options={{
                                headerShown: false,        // Sin header personalizado
                                animation: 'slide_from_bottom', // Animación especial desde abajo
                            }}
                        />

                        {/* Pantalla de códigos de descuento del usuario */}
                        <Stack.Screen
                            name="DiscountCodes"           // Nombre de la ruta  
                            component={DiscountCodesScreen} // Componente a renderizar
                            options={{
                                headerShown: false,        // Sin header personalizado
                                animation: 'slide_from_right', // Animación desde la derecha
                            }}
                        />

                    </Stack.Navigator>
                </NavigationContainer>
            </CartProvider>
        </AuthProvider>
    );
}
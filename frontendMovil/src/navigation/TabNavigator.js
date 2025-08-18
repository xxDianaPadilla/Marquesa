import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, Image, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importación de iconos para cada tab
import homeIcon from "../images/homeIcon.png";
import favoritesIcon from "../images/favoritesIcon.png";
import chatIcon from "../images/chatIcon.png";
import shoppingCartIcon from "../images/shoppingCartIcon.png";

// Importación de pantallas para cada tab
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen"; 
import ShoppingCart from "../screens/ShoppingCartScreen";
import ChatScreen from "../screens/ChatScreen";

// Creación del navegador de pestañas inferiores
const Tab = createBottomTabNavigator();

/**
 * Componente personalizado para renderizar iconos de las pestañas
 * @param {boolean} focused - Indica si la pestaña está activa/seleccionada
 * @param {object} iconSource - Fuente de la imagen del icono
 * @param {number} size - Tamaño del icono
 * @param {string} color - Color del icono
 */
const TabIcon = ({ focused, iconSource, size, color }) => {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Imagen del icono de la pestaña */}
            <Image
                source={iconSource}
                style={{
                    width: size,
                    height: size,
                    tintColor: color, // Aplica color dinámico al icono
                }}
            />
            {/* Indicador visual para la pestaña activa */}
            {focused && (
                <View
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#FF6B6B', // Color rosa para el indicador
                        marginTop: 4,
                        position: 'absolute',
                        bottom: -8, // Posiciona el punto debajo del icono
                    }}
                />
            )}
        </View>
    );
};

/**
 * Componente principal del navegador de pestañas
 * Maneja la navegación entre las 4 pantallas principales de la app
 */
const TabNavigator = () => {
    // Hook para obtener las áreas seguras del dispositivo (notch, barra de estado, etc.)
    const insets = useSafeAreaInsets();
    
    /**
     * Calcula la altura dinámica de la barra de pestañas
     * Considera las áreas seguras y diferencias entre plataformas
     * @returns {number} Altura calculada para la barra de pestañas
     */
    const getTabBarHeight = () => {
        const baseHeight = 60; // Altura base de la barra
        // Padding inferior que se adapta al dispositivo y plataforma
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10);
        return baseHeight + paddingBottom;
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Oculta el header de navegación
                
                /**
                 * Función que renderiza el icono personalizado para cada pestaña
                 * @param {object} params - Parámetros del icono (focused, color, size)
                 */
                tabBarIcon: ({ focused, color, size }) => {
                    let iconSource;

                    // Asignación de iconos según el nombre de la ruta
                    if (route.name === 'Home') {
                        iconSource = homeIcon;
                    } else if (route.name === 'Favorites') {
                        iconSource = favoritesIcon;
                    } else if (route.name === 'Chat') {
                        iconSource = chatIcon;
                    } else if (route.name === 'ShoppingCart') {
                        iconSource = shoppingCartIcon;
                    }

                    return (
                        <TabIcon
                            focused={focused}
                            iconSource={iconSource}
                            size={size}
                            color={focused ? '#FF6B6B' : color} // Color rosa cuando está activo
                        />
                    );
                },
                
                // Configuración de colores para las pestañas
                tabBarActiveTintColor: '#FF6B6B',   // Color cuando la pestaña está activa
                tabBarInactiveTintColor: '#8E8E93', // Color cuando la pestaña está inactiva
                
                // Estilos personalizados para la barra de pestañas
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',     // Fondo blanco
                    borderTopWidth: 0,             // Elimina el borde superior
                    elevation: 8,                  // Sombra en Android
                    
                    // Configuración de sombra para iOS
                    shadowColor: '#000', 
                    shadowOffset: {
                        width: 0,
                        height: -2, // Sombra hacia arriba
                    },
                    shadowOpacity: 0.1,            // Opacidad sutil de la sombra
                    shadowRadius: 8,               // Radio de difuminado de la sombra
                    
                    // Dimensiones y posicionamiento
                    height: getTabBarHeight(),     // Altura dinámica calculada
                    paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10), // Padding inferior adaptativo
                    paddingTop: 10,                // Padding superior
                    position: 'absolute',          // Posicionamiento absoluto
                    bottom: 0,                     // Pegado al fondo
                    left: 0,                       // Ocupar todo el ancho
                    right: 0,
                },
                
                // Estilos para las etiquetas de texto
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                
                tabBarShowLabel: false,            // Oculta las etiquetas de texto
                tabBarHideOnKeyboard: true,        // Oculta la barra cuando aparece el teclado
            })}
        >
            {/* Definición de cada pestaña con su pantalla correspondiente */}
            
            {/* Pestaña de Inicio */}
            <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Inicio' // Etiqueta para accesibilidad aunque no se muestre
                }}
            />
            
            {/* Pestaña de Favoritos */}
            <Tab.Screen 
                name="Favorites" 
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoritos'
                }}
            />
            
            {/* Pestaña de Chat */}
            <Tab.Screen 
                name="Chat" 
                component={ChatScreen}
                options={{
                    tabBarLabel: 'Chat'
                }}
            />
            
            {/* Pestaña de Carrito de Compras */}
            <Tab.Screen 
                name="ShoppingCart" 
                component={ShoppingCart}
                options={{
                    tabBarLabel: 'Carrito'
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
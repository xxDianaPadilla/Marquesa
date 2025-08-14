import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, Image, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import homeIcon from "../images/homeIcon.png";
import favoritesIcon from "../images/favoritesIcon.png";
import chatIcon from "../images/chatIcon.png";
import shoppingCartIcon from "../images/shoppingCartIcon.png";
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen"; // ← ESTE IMPORT SÍ LO DEJAS
import ShoppingCart from "../screens/ShoppingCart";

// ELIMINA ESTA LÍNEA: const FavoritesScreen = () => HomeScreen;
const ChatScreen = () => HomeScreen; 
const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, iconSource, size, color }) => {
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Image
                source={iconSource}
                style={{
                    width: size,
                    height: size,
                    tintColor: color,
                }}
            />
            {/* Indicador de tab activo */}
            {focused && (
                <View
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#FF6B6B', 
                        marginTop: 4,
                        position: 'absolute',
                        bottom: -8,
                    }}
                />
            )}
        </View>
    );
};

const TabNavigator = () => {
    const insets = useSafeAreaInsets();
    
    const getTabBarHeight = () => {
        const baseHeight = 60;
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10);
        return baseHeight + paddingBottom;
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconSource;

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
                            color={focused ? '#FF6B6B' : color}
                        />
                    );
                },
                tabBarActiveTintColor: '#FF6B6B', 
                tabBarInactiveTintColor: '#8E8E93', 
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#000', 
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    height: getTabBarHeight(),
                    paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10),
                    paddingTop: 10,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true, 
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Inicio'
                }}
            />
            <Tab.Screen 
                name="Favorites" 
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoritos'
                }}
            />
            <Tab.Screen 
                name="Chat" 
                component={ChatScreen}
                options={{
                    tabBarLabel: 'Chat'
                }}
            />
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
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";

export default function Navigation() {
    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                />
                <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
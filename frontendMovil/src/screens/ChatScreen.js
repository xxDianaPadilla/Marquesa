import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    SafeAreaView, 
    Image, 
    Platform, 
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importación de iconos y elementos gráficos
import backIcon from '../images/backIcon.png';
import marquesaMiniLogo from "../images/marquesaMiniLogo.png";
import mockMessageImage from "../images/mockMessageImage.png";
import attachImage from "../images/attachImage.png";
import sendIcon from "../images/sendIcon.png";

// Importación de componentes personalizados
import ChatBubbles from "../components/ChatBubbles";

/**
 * Pantalla de chat principal que permite la conversación entre usuarios
 * Maneja la visibilidad del teclado, posicionamiento de elementos y navegación
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
const ChatScreen = ({ navigation }) => {
    // Hook para obtener las áreas seguras del dispositivo
    const insets = useSafeAreaInsets();
    
    // Estados para manejar la visibilidad y altura del teclado
    const [keyboardHeight, setKeyboardHeight] = useState(0); // Altura actual del teclado
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // Estado de visibilidad del teclado
    
    /**
     * Effect que configura los listeners del teclado
     * Detecta cuando se muestra/oculta el teclado y ajusta la interfaz accordingly
     */
    useEffect(() => {
        // Listener para cuando se muestra el teclado
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height); // Guarda la altura del teclado
                setIsKeyboardVisible(true);
            }
        );
        
        // Listener para cuando se oculta el teclado
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0); // Resetea la altura
                setIsKeyboardVisible(false);
            }
        );

        // Cleanup function para remover los listeners al desmontar el componente
        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);
    
    /**
     * Calcula la altura de la barra de pestañas considerando las áreas seguras
     * @returns {number} Altura total de la barra de pestañas
     */
    const getTabBarHeight = () => {
        const baseHeight = 60; // Altura base
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10);
        return baseHeight + paddingBottom;
    };

    /**
     * Oculta el teclado cuando se toca fuera del input
     */
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    /**
     * Calcula la posición bottom del contenedor de input
     * Se ajusta dinámicamente según la visibilidad del teclado
     * @returns {number} Valor bottom en píxeles
     */
    const getInputContainerBottom = () => {
        if (isKeyboardVisible) {
            // Cuando el teclado está visible, posiciona el input encima
            const extraPadding = Platform.OS === 'ios' ? 10 : 50; // Padding adicional por plataforma
            return keyboardHeight + extraPadding;
        }
        // Cuando el teclado está oculto, posiciona encima de la barra de pestañas
        return getTabBarHeight();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* TouchableWithoutFeedback permite cerrar el teclado tocando fuera */}
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    {/* Header del chat con información del contacto */}
                    <View style={styles.header}>
                        {/* Botón de retroceso */}
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>

                        {/* Información central del contacto */}
                        <View style={styles.headerCenter}>
                            <Image source={marquesaMiniLogo} style={styles.profileImage} />
                            <Text style={styles.headerTitle}>Marquesa</Text>
                        </View>

                        {/* Espacio derecho para mantener el balance visual */}
                        <View style={styles.headerRight} />
                    </View>

                    {/* Contenedor de mensajes con scroll */}
                    <ScrollView 
                        style={[
                            styles.messagesContainer, 
                            { marginBottom: getInputContainerBottom() + 70 } // Margen dinámico para evitar superposición
                        ]} 
                        showsVerticalScrollIndicator={false} // Oculta la barra de scroll
                        contentContainerStyle={styles.messagesContent}
                    >
                        {/* Indicador de fecha */}
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>Hoy</Text>
                        </View>

                        {/* Mensaje enviado por el usuario actual */}
                        <ChatBubbles
                            message="Buenas tardes, será que le puedo cotizar un arreglo de flores"
                            time=""
                            isOwnMessage={true} // Indica que es mensaje propio
                            hasImage={false}
                        />

                        {/* Mensaje recibido del otro usuario */}
                        <ChatBubbles
                            message="Si, claro con gusto"
                            time="9:00 am"
                            isOwnMessage={false} // Indica que es mensaje recibido
                            hasImage={false}
                        />

                        {/* Mensaje con imagen del otro usuario */}
                        <ChatBubbles
                            message=""
                            time=""
                            isOwnMessage={false}
                            hasImage={true} // Indica que contiene imagen
                            imageSource={mockMessageImage}
                        />

                        {/* Mensaje con precio del otro usuario */}
                        <ChatBubbles
                            message="Le costaría $50 😊"
                            time="9:02 am"
                            isOwnMessage={false}
                            hasImage={false}
                        />

                        {/* Respuesta final del usuario actual */}
                        <ChatBubbles
                            message="Perfecto, me gustaría comprarlo"
                            time=""
                            isOwnMessage={true}
                            hasImage={false}
                        />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            {/* Contenedor de input posicionado absolutamente para mantenerse fijo */}
            <View style={[
                styles.inputContainer, 
                { bottom: getInputContainerBottom() } // Posición dinámica según estado del teclado
            ]}>
                {/* Botón para adjuntar archivos/imágenes */}
                <TouchableOpacity style={styles.attachButton}>
                    <Image source={attachImage} style={styles.attachIcon} />
                </TouchableOpacity>

                {/* Wrapper del campo de texto */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Mensaje..."
                        placeholderTextColor="#999"
                        multiline // Permite múltiples líneas
                    />
                </View>

                {/* Botón de envío */}
                <TouchableOpacity style={styles.sendButton}>
                    <Image source={sendIcon} style={styles.sendIcon} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Contenedor principal - ocupa toda la pantalla
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    
    // Header del chat con información del contacto y navegación
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1', // Línea sutil de separación
        marginTop: 30, // Espacio desde el área segura superior
    },
    
    // Área clickeable del botón de retroceso
    backButton: {
        padding: 4,
    },
    
    // Icono de retroceso
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#333333', // Color oscuro para buena visibilidad
    },
    
    // Contenedor central del header con información del contacto
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -110, // Compensación para centrar considerando el botón de retroceso
    },
    
    // Imagen de perfil del contacto
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16, // Hace la imagen circular
        marginRight: 8,
    },
    
    // Título con el nombre del contacto
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 4, // Ajuste fino para alineación visual
    },
    
    // Espacio derecho para mantener balance en el header
    headerRight: {
        width: 28,
    },
    
    // Contenedor principal de los mensajes
    messagesContainer: {
        flex: 1,
    },
    
    // Contenido interno del scroll de mensajes
    messagesContent: {
        paddingVertical: 16,
        paddingBottom: 20, // Espaciado inferior para mejor UX
    },
    
    // Contenedor del indicador de fecha
    dateContainer: {
        alignItems: 'center',
        marginBottom: 6,
    },
    
    // Estilo del texto de fecha
    dateText: {
        fontSize: 14,
        color: '#999999',
        backgroundColor: '#E5E5EA', // Fondo gris claro
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12, // Forma redondeada
        overflow: 'hidden',
        fontFamily: 'Poppins-Regular',
    },
    
    // Contenedor de input posicionado absolutamente
    inputContainer: {
        position: 'absolute', // Se mantiene fijo en la parte inferior
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end', // Alinea elementos al fondo para texto multilínea
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1', // Separador superior sutil
        
        // Sombra para elevación visual
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2, // Sombra hacia arriba
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Elevación para Android
    },
    
    // Botón de adjuntar archivos
    attachButton: {
        padding: 8, // Área de toque cómoda
        marginRight: 8,
    },
    
    // Icono de adjuntar
    attachIcon: {
        width: 24,
        height: 24,
        tintColor: '#666', // Color gris medio
    },
    
    // Wrapper que contiene el TextInput
    inputWrapper: {
        flex: 1, // Toma todo el espacio disponible
        backgroundColor: '#F5F5F5', // Fondo gris claro
        borderRadius: 20, // Forma redondeada
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        minHeight: 40, // Altura mínima
        maxHeight: 100, // Altura máxima para evitar que crezca demasiado
    },
    
    // Campo de texto para escribir mensajes
    textInput: {
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'center', // Centra verticalmente el texto
    },
    
    // Botón de envío con fondo colorido
    sendButton: {
        backgroundColor: '#F8BBD9', // Color rosa de la marca
        width: 36,
        height: 36,
        borderRadius: 18, // Forma circular
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Icono de envío
    sendIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF', // Blanco para contrastar con el fondo rosa
    },
});

export default ChatScreen;
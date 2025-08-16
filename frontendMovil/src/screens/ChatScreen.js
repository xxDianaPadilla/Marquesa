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
import backIcon from '../images/backIcon.png';
import marquesaMiniLogo from "../images/marquesaMiniLogo.png";
import mockMessageImage from "../images/mockMessageImage.png";
import attachImage from "../images/attachImage.png";
import sendIcon from "../images/sendIcon.png";
import ChatBubbles from "../components/ChatBubbles";

const ChatScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
            }
        );
        
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);
    
    const getTabBarHeight = () => {
        const baseHeight = 60;
        const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 10);
        return baseHeight + paddingBottom;
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const getInputContainerBottom = () => {
        if (isKeyboardVisible) {
            const extraPadding = Platform.OS === 'ios' ? 10 : 50;
            return keyboardHeight + extraPadding;
        }
        return getTabBarHeight();
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>

                        <View style={styles.headerCenter}>
                            <Image source={marquesaMiniLogo} style={styles.profileImage} />
                            <Text style={styles.headerTitle}>Marquesa</Text>
                        </View>

                        <View style={styles.headerRight} />
                    </View>

                    {/* Messages Container */}
                    <ScrollView 
                        style={[
                            styles.messagesContainer, 
                            { marginBottom: getInputContainerBottom() + 70 }
                        ]} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messagesContent}
                    >
                        {/* Fecha */}
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>Hoy</Text>
                        </View>

                        {/* Mensaje propio */}
                        <ChatBubbles
                            message="Buenas tardes, será que le puedo cotizar un arreglo de flores"
                            time=""
                            isOwnMessage={true}
                            hasImage={false}
                        />

                        {/* Mensaje del otro usuario */}
                        <ChatBubbles
                            message="Si, claro con gusto"
                            time="9:00 am"
                            isOwnMessage={false}
                            hasImage={false}
                        />

                        {/* Mensaje con imagen */}
                        <ChatBubbles
                            message=""
                            time=""
                            isOwnMessage={false}
                            hasImage={true}
                            imageSource={mockMessageImage}
                        />

                        {/* Mensaje con precio */}
                        <ChatBubbles
                            message="Le costaría $50 😊"
                            time="9:02 am"
                            isOwnMessage={false}
                            hasImage={false}
                        />

                        {/* Respuesta final */}
                        <ChatBubbles
                            message="Perfecto, me gustaría comprarlo"
                            time=""
                            isOwnMessage={true}
                            hasImage={false}
                        />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            {/* Input Container posicionado absolutamente */}
            <View style={[
                styles.inputContainer, 
                { bottom: getInputContainerBottom() }
            ]}>
                <TouchableOpacity style={styles.attachButton}>
                    <Image source={attachImage} style={styles.attachIcon} />
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Mensaje..."
                        placeholderTextColor="#999"
                        multiline
                    />
                </View>

                <TouchableOpacity style={styles.sendButton}>
                    <Image source={sendIcon} style={styles.sendIcon} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
        marginTop: 30,
    },
    backButton: {
        padding: 4,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: '#333333',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -110,
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 4,
    },
    headerRight: {
        width: 28,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
        paddingBottom: 20, 
    },
    dateContainer: {
        alignItems: 'center',
        marginBottom: 6,
    },
    dateText: {
        fontSize: 14,
        color: '#999999',
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: 'Poppins-Regular',
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E1E1E1',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    attachButton: {
        padding: 8,
        marginRight: 8,
    },
    attachIcon: {
        width: 24,
        height: 24,
        tintColor: '#666',
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        minHeight: 40,
        maxHeight: 100,
    },
    textInput: {
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'center',
    },
    sendButton: {
        backgroundColor: '#F8BBD9',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF',
    },
});

export default ChatScreen;
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ChatBubbles = ({ message, time, isOwnMessage, hasImage, imageSource }) => {
    return (
        <View style={[styles.container, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
            {!isOwnMessage && (
                <View style={styles.avatar}>
                    <Image source={require('../images/marquesaMiniLogo.png')} style={styles.avatarImage} />
                </View>
            )}

            <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
                {hasImage && imageSource && (
                    <Image source={imageSource} style={styles.messageImage} />
                )}
                <Text style={[styles.messageText, isOwnMessage ? styles.ownText : styles.otherText]}>
                    {message}
                </Text>
                <Text style={[styles.timeText, isOwnMessage ? styles.ownTime : styles.otherTime]}>
                    {time}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    ownMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        position: 'relative',
        marginBottom: 5,
    },
    ownBubble: {
        backgroundColor: '#F8BBD9',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    ownText: {
        color: '#000000',
    },
    otherText: {
        color: '#000000'
    },
    timeText: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Poppins-Regular'
    },
    otherTime: {
        color: '#666666',
        textAlign: 'left',
    },
    messageImage: {
        width: 150,
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
        resizeMode: 'cover',
    },
});

export default ChatBubbles;
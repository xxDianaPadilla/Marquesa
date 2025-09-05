import { useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para manejar notificaciones push del chat
 * Gestiona notificaciones locales y remotas
 */
export const useChatNotifications = () => {
    const { user, isAuthenticated } = useAuth();
    const appState = useRef(AppState.currentState);
    const notificationQueue = useRef([]);

    /**
     * Configura las notificaciones push
     */
    const configureNotifications = useCallback(() => {
        PushNotification.configure({
            // Callback cuando se recibe una notificación (app en foreground)
            onNotification: function(notification) {
                console.log('📱 Notificación recibida:', notification);

                // Manejar tap en notificación
                if (notification.userInteraction) {
                    handleNotificationTap(notification);
                }

                // Requerido en iOS para indicar que se procesó la notificación
                if (Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            },

            // Callback cuando se registra el token (solo Android)
            onRegister: function(token) {
                console.log('📱 Token de notificación registrado:', token);
                // Enviar token al servidor si es necesario
                sendTokenToServer(token);
            },

            // IOS: Permisos requeridos
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Android: Configuración del canal
            requestPermissions: Platform.OS === 'ios',
        });

        // Crear canal de notificación para Android
        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: "chat-messages",
                    channelName: "Mensajes de Chat",
                    channelDescription: "Notificaciones de nuevos mensajes",
                    soundName: "default",
                    importance: 4,
                    vibrate: true,
                },
                (created) => console.log(`📱 Canal de notificación creado: ${created}`)
            );
        }
    }, []);

    /**
     * Envía el token al servidor para notificaciones remotas
     */
    const sendTokenToServer = useCallback(async (token) => {
        try {
            if (!isAuthenticated || !user?.id) return;

            const response = await fetch('https://marquesa.onrender.com/api/chat/notification-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    token: token.token,
                    platform: Platform.OS
                })
            });

            if (response.ok) {
                console.log('✅ Token enviado al servidor exitosamente');
            }
        } catch (error) {
            console.error('❌ Error enviando token al servidor:', error);
        }
    }, [isAuthenticated, user?.id]);

    /**
     * Maneja el tap en una notificación
     */
    const handleNotificationTap = useCallback((notification) => {
        console.log('👆 Usuario tocó notificación:', notification);

        // Navegar al chat si la notificación contiene datos de conversación
        if (notification.data && notification.data.conversationId) {
            // Aquí puedes usar navigation para ir al chat específico
            // navigation.navigate('ChatScreen', { conversationId: notification.data.conversationId });
        }
    }, []);

    /**
     * Muestra una notificación local para nuevo mensaje
     */
    const showNewMessageNotification = useCallback((message, senderName = 'Marquesa') => {
        // No mostrar notificación si la app está en foreground
        if (appState.current === 'active') {
            return;
        }

        const notification = {
            channelId: "chat-messages",
            title: senderName,
            message: message.message || '📷 Imagen',
            playSound: true,
            soundName: 'default',
            actions: Platform.OS === 'android' ? ['Responder', 'Marcar como leído'] : undefined,
            data: {
                messageId: message._id,
                conversationId: message.conversationId,
                type: 'chat_message'
            },
            userInfo: {
                messageId: message._id,
                conversationId: message.conversationId,
                type: 'chat_message'
            }
        };

        PushNotification.localNotification(notification);
        console.log('📱 Notificación local mostrada para mensaje:', message._id);
    }, []);

    /**
     * Limpia todas las notificaciones del chat
     */
    const clearChatNotifications = useCallback(() => {
        PushNotification.cancelAllLocalNotifications();
        
        // También limpiar el badge en iOS
        if (Platform.OS === 'ios') {
            PushNotification.setApplicationIconBadgeNumber(0);
        }
        
        console.log('🧹 Notificaciones del chat limpiadas');
    }, []);

    /**
     * Actualiza el badge count
     */
    const updateBadgeCount = useCallback((count) => {
        if (Platform.OS === 'ios') {
            PushNotification.setApplicationIconBadgeNumber(count);
        }
    }, []);

    /**
     * Solicita permisos de notificación
     */
    const requestNotificationPermissions = useCallback(async () => {
        try {
            if (Platform.OS === 'android') {
                // En Android los permisos se manejan automáticamente
                return true;
            }

            // En iOS, solicitar permisos explícitamente
            const permissions = await PushNotification.requestPermissions();
            console.log('📱 Permisos de notificación:', permissions);
            
            return permissions.alert && permissions.badge && permissions.sound;
        } catch (error) {
            console.error('❌ Error solicitando permisos de notificación:', error);
            return false;
        }
    }, []);

    /**
     * Programa una notificación de recordatorio
     */
    const scheduleReminderNotification = useCallback((message, delay = 300000) => { // 5 minutos por defecto
        const notification = {
            channelId: "chat-messages",
            title: "Mensaje pendiente",
            message: "Tienes un mensaje sin leer de Marquesa",
            date: new Date(Date.now() + delay),
            data: {
                type: 'reminder'
            }
        };

        PushNotification.localNotificationSchedule(notification);
        console.log('⏰ Recordatorio programado para:', new Date(Date.now() + delay));
    }, []);

    /**
     * Cancela notificaciones programadas
     */
    const cancelScheduledNotifications = useCallback(() => {
        PushNotification.cancelAllLocalNotifications();
        console.log('❌ Notificaciones programadas canceladas');
    }, []);

    // Effect para configurar notificaciones al montar
    useEffect(() => {
        configureNotifications();

        // Listener para cambios en el estado de la app
        const handleAppStateChange = (nextAppState) => {
            console.log('📱 App state cambió:', appState.current, '->', nextAppState);

            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App volvió al foreground, limpiar notificaciones
                clearChatNotifications();
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Solicitar permisos al inicializar
        requestNotificationPermissions();

        return () => {
            subscription?.remove();
            PushNotification.unregister();
        };
    }, [configureNotifications, clearChatNotifications, requestNotificationPermissions]);

    // Effect para limpiar notificaciones cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated) {
            clearChatNotifications();
        }
    }, [isAuthenticated, clearChatNotifications]);

    return {
        // Funciones principales
        showNewMessageNotification,
        clearChatNotifications,
        updateBadgeCount,
        
        // Funciones de programación
        scheduleReminderNotification,
        cancelScheduledNotifications,
        
        // Funciones de configuración
        requestNotificationPermissions,
        sendTokenToServer,
        
        // Estado actual
        isConfigured: true
    };
};
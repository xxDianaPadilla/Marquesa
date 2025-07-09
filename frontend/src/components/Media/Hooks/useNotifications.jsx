import { useState, useCallback } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success', duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remover después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Funciones de conveniencia
    const showSuccess = useCallback((message, duration) => 
        showNotification(message, 'success', duration), [showNotification]);
    
    const showError = useCallback((message, duration) => 
        showNotification(message, 'error', duration), [showNotification]);
    
    const showWarning = useCallback((message, duration) => 
        showNotification(message, 'warning', duration), [showNotification]);
    
    const showInfo = useCallback((message, duration) => 
        showNotification(message, 'info', duration), [showNotification]);

    return {
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        clearAllNotifications
    };
};
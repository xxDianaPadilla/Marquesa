import React from 'react';

// Componente para el contenedor de notificaciones
// Muestra notificaciones de diferentes tipos (éxito, error, advertencia, información
const NotificationItem = ({ notification, onRemove }) => {
    const { id, message, type } = notification;

    const getNotificationStyles = () => {
        const baseStyles = "p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm border-l-4";
        
        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
            case 'error':
                return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
            case 'warning':
                return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
            case 'info':
                return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
            default:
                return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`;
        }
    };
// Función para obtener el ícono según el tipo de notificación
    // Retorna un SVG correspondiente al tipo de notificación
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={getNotificationStyles()} style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={() => onRemove(id)}
                    className="ml-2 hover:opacity-70 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const NotificationContainer = ({ notifications, onRemove }) => {
    if (!notifications || notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-[60] space-y-3">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
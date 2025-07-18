import React, { useState, useRef, useEffect } from 'react';

const MessageItem = ({ 
    message, 
    isOwnMessage, 
    isAdmin = false,
    onAction,
    MediaRenderer,
    formatTime,
    compact = false
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef(null);

    // Cerrar menú de acciones al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                setShowActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        onAction?.(action, message);
        setShowActions(false);
    };

    // LÓGICA MEJORADA: Determinar permisos de eliminación
    const canDelete = () => {
        if (isAdmin) {
            // Los administradores pueden eliminar cualquier mensaje
            return true;
        } else {
            // Los clientes solo pueden eliminar sus propios mensajes
            return isOwnMessage && message.senderType === 'Customer';
        }
    };

    // LÓGICA MEJORADA: Determinar si mostrar menú de acciones
    const shouldShowActionsMenu = () => {
        if (isAdmin) {
            // Los administradores ven el menú en todos los mensajes
            return true;
        } else {
            // Los clientes solo ven el menú en sus propios mensajes
            return isOwnMessage;
        }
    };

    const showActionsMenu = shouldShowActionsMenu();
    const canDeleteMessage = canDelete();

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
            <div className={`relative ${compact ? 'max-w-[85%]' : 'max-w-xs lg:max-w-md'}`}>
                {/* Avatar y nombre para mensajes de otros usuarios */}
                {!isOwnMessage && !compact && (
                    <div className="flex items-center space-x-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-[#E8ACD2] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {message.senderId?.profilePicture ? (
                                <img 
                                    src={message.senderId.profilePicture} 
                                    alt={message.senderId.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                message.senderId?.fullName?.charAt(0)?.toUpperCase() || 'U'
                            )}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                            {message.senderId?.fullName || (message.senderType === 'admin' ? 'Atención al Cliente' : 'Cliente')}
                        </span>
                    </div>
                )}
                
                <div className={`relative px-3 py-2 rounded-lg ${
                    isOwnMessage 
                        ? 'bg-[#E8ACD2] text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                    {/* Contenido multimedia */}
                    {message.media && MediaRenderer && (
                        <div className="mb-2">
                            <MediaRenderer 
                                media={message.media} 
                                maxWidth={compact ? 'max-w-[200px]' : 'max-w-xs'} 
                            />
                        </div>
                    )}
                    
                    {/* Mensaje de texto */}
                    {message.message && (
                        <p className={`${compact ? 'text-xs' : 'text-sm'} break-words`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {message.message}
                        </p>
                    )}
                    
                    {/* Hora */}
                    <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-white text-opacity-80' : 'text-gray-500'
                    }`}>
                        {formatTime(message.createdAt)}
                        {/* Indicador de leído para mensajes propios */}
                        {isOwnMessage && message.isRead && (
                            <span className="ml-1">✓✓</span>
                        )}
                    </p>

                    {/* Botón de acciones - Solo visible en hover y si tiene permisos */}
                    {showActionsMenu && (
                        <div className={`absolute ${isOwnMessage ? '-left-8' : '-right-8'} top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-full shadow-lg transition-colors"
                                title="Más opciones"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                </svg>
                            </button>

                            {/* Menú de acciones */}
                            {showActions && (
                                <div 
                                    ref={actionsRef}
                                    className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]`}
                                >
                                    {/* Eliminar - Solo si tiene permisos */}
                                    {canDeleteMessage && (
                                        <button
                                            onClick={() => handleAction('delete')}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Eliminar
                                        </button>
                                    )}

                                    {/* Mensaje informativo si no puede eliminar */}
                                    {!canDeleteMessage && showActionsMenu && (
                                        <div className="px-3 py-2 text-xs text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            No puedes eliminar este mensaje
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
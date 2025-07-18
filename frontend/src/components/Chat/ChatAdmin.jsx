import React, { useState, useRef } from 'react';
import { useChat } from './Hooks/useChat';

// Importar componentes modulares
import DeleteMessageModal from './DeleteMessageModal';
import MessageItem from './MessageItem';
import FilePreview from './FilePreview';
import MediaRenderer from './MediaRenderer';
import TypingIndicator from './TypingIndicator';
import ChatStatus from './ChatStatus';

const ChatAdmin = () => {
    const {
        conversations,
        activeConversation,
        messages,
        newMessage,
        setNewMessage,
        loading,
        error,
        unreadCount,
        isConnected,
        sendMessage,
        deleteMessage,
        selectConversation,
        clearError,
        messagesEndRef,
        typingUsers,
        // Estados para modal de eliminación
        showDeleteModal,
        messageToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteMessage
    } = useChat();

    // Estados para archivos
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Referencia para el input de archivos
    const fileInputRef = useRef(null);

    // Manejar envío de mensaje
    const handleSendMessage = async (messageText, file = null) => {
        if (!activeConversation || (!messageText?.trim() && !file && !selectedFile)) return;
        
        const fileToSend = file || selectedFile;
        const success = await sendMessage(activeConversation.conversationId, messageText, fileToSend);
        
        if (success) {
            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            // Limpiar el input de archivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Manejar envío del formulario
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (newMessage?.trim() || selectedFile) {
            handleSendMessage(newMessage);
        }
    };

    // Manejar presionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage?.trim() || selectedFile) {
                handleSendMessage(newMessage);
            }
        }
    };

    // Manejar selección de archivo
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Crear preview para imágenes
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target.result);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    // FUNCIÓN MEJORADA: Manejar acciones de mensaje
    const handleMessageAction = (action, message) => {
        if (action === 'delete') {
            // Verificar permisos antes de abrir modal
            const canDelete = message.senderType === 'admin' || 
                            (message.senderType === 'Customer' && 
                             (activeConversation?.clientId?._id === message.senderId?._id || 
                              activeConversation?.clientId?.id === message.senderId?.id));
            
            if (canDelete) {
                openDeleteModal(message);
            } else {
                console.warn('No tienes permisos para eliminar este mensaje');
            }
        }
    };

    // Formatear fecha y hora
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return messageDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8ACD2]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[80vh] md:h-[600px] flex flex-col md:flex-row">
            {/* Panel izquierdo - Lista de conversaciones */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Chat de Soporte
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {conversations.length} conversación(es)
                    </p>
                </div>

                {/* Estado de conexión */}
                <ChatStatus isConnected={isConnected} />

                {/* Lista de conversaciones */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                                No hay conversaciones activas
                            </p>
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.conversationId}
                                onClick={() => selectConversation(conversation)}
                                className={`p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    activeConversation?.conversationId === conversation.conversationId
                                        ? 'bg-[#E8ACD2] bg-opacity-20 border-l-4 border-l-[#E8ACD2]'
                                        : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div className="w-8 md:w-10 h-8 md:h-10 bg-[#E8ACD2] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {conversation.clientId?.profilePicture ? (
                                                <img 
                                                    src={conversation.clientId.profilePicture} 
                                                    alt={conversation.clientId.fullName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                conversation.clientId?.fullName?.charAt(0)?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        
                                        {/* Info del cliente */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {conversation.clientId?.fullName || 'Usuario'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {conversation.lastMessage || 'Sin mensajes'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Indicadores */}
                                    <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
                                        <span className="text-xs text-gray-500">
                                            {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                                        </span>
                                        
                                        {conversation.unreadCountAdmin > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                                {conversation.unreadCountAdmin}
                                            </span>
                                        )}
                                        
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            conversation.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {conversation.status === 'active' ? 'Activo' : 'Cerrado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Panel derecho - Chat activo */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeConversation ? (
                    <>
                        {/* Header del chat */}
                        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 md:w-8 h-6 md:h-8 bg-[#E8ACD2] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {activeConversation.clientId?.profilePicture ? (
                                        <img 
                                            src={activeConversation.clientId.profilePicture} 
                                            alt={activeConversation.clientId.fullName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        activeConversation.clientId?.fullName?.charAt(0)?.toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {activeConversation.clientId?.fullName || 'Usuario'}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {activeConversation.clientId?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Área de mensajes */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 min-h-0">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        No hay mensajes en esta conversación
                                    </p>
                                </div>
                            ) : (
                                messages.filter(message => !message.isDeleted).map((message, index) => {
                                    const showDate = index === 0 || 
                                        formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                                    
                                    return (
                                        <div key={message._id}>
                                            {showDate && (
                                                <div className="text-center mb-4">
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                        {formatDate(message.createdAt)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <MessageItem
                                                message={message}
                                                isOwnMessage={message.senderType === 'admin'}
                                                isAdmin={true}
                                                onAction={handleMessageAction}
                                                MediaRenderer={MediaRenderer}
                                                formatTime={formatTime}
                                            />
                                        </div>
                                    );
                                })
                            )}
                            
                            {/* Indicador de escritura */}
                            {typingUsers && typingUsers.size > 0 && (
                                <TypingIndicator users={Array.from(typingUsers)} />
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Preview de archivo seleccionado */}
                        {selectedFile && (
                            <FilePreview 
                                file={selectedFile}
                                previewUrl={previewUrl}
                                onClear={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                            />
                        )}

                        {/* Input de mensaje */}
                        <div className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                            <form onSubmit={handleFormSubmit} className="flex items-end space-x-2 md:space-x-3">
                                {/* Botón de archivo */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 p-2 text-gray-500 hover:text-[#E8ACD2] transition-colors"
                                    title="Adjuntar archivo"
                                    disabled={!activeConversation}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                    className="hidden"
                                />
                                
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu respuesta..."
                                    className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8ACD2] focus:border-transparent min-h-[40px] max-h-24"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                    rows="1"
                                    disabled={!activeConversation}
                                />
                                
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || !activeConversation}
                                    className="flex-shrink-0 px-3 md:px-4 py-2 bg-[#E8ACD2] text-white rounded-lg hover:bg-[#E096C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    <span className="hidden md:inline">Enviar</span>
                                    <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Selecciona una conversación para comenzar
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmación para eliminar mensaje */}
            <DeleteMessageModal
                isOpen={showDeleteModal}
                message={messageToDelete}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteMessage}
                isDeleting={isDeleting}
                formatTime={formatTime}
            />

            {/* Modal de error */}
            {error && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-red-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Error
                        </h3>
                        <p className="text-gray-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {error}
                        </p>
                        <button
                            onClick={clearError}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAdmin;
import React, { useState, useRef } from 'react';
import { useChat } from './Hooks/useChat';

// Importar componentes modulares
import DeleteMessageModal from './DeleteMessageModal';
import MessageItem from './MessageItem';
import FilePreview from './FilePreview';
import MediaRenderer from './MediaRenderer';
import TypingIndicator from './TypingIndicator';
import ChatStatus from './ChatStatus';

const ChatClient = ({ isOpen, onClose }) => {
    const {
        activeConversation,
        messages,
        newMessage,
        setNewMessage,
        loading,
        error,
        isConnected,
        sendMessage,
        deleteMessage,
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

    // FUNCIÓN MEJORADA: Manejar acciones de mensaje (solo eliminar mensajes propios)
    const handleMessageAction = (action, message) => {
        if (action === 'delete') {
            // Solo permitir eliminar mensajes propios del cliente
            if (message.senderType === 'Customer') {
                openDeleteModal(message);
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

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
            <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-sm h-[70vh] md:h-96 flex flex-col border border-gray-200">
                {/* Header del chat */}
                <div className="bg-[#E8ACD2] p-3 md:p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                        <div className="w-6 md:w-8 h-6 md:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                            <img 
                                src="/assets/marquesaMiniLogo.png" 
                                alt="Marquesa"
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <svg className="w-3 md:w-5 h-3 md:h-5 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-xs md:text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Atención al cliente
                            </h3>
                            <p className="text-white text-opacity-80 text-xs truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {loading ? 'Conectando...' : isConnected ? 'En línea' : 'Desconectado'}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors flex-shrink-0 ml-2"
                    >
                        <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-[#E8ACD2]"></div>
                    </div>
                ) : (
                    <>
                        {/* Estado de conexión */}
                        {!isConnected && (
                            <ChatStatus isConnected={isConnected} />
                        )}

                        {/* Área de mensajes */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 space-y-3 min-h-0">
                            {/* Mensaje de bienvenida automático */}
                            <div className="flex justify-start">
                                <div className="bg-white rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-[#E8ACD2] flex items-center justify-center">
                                            <img 
                                                src="/assets/marquesaMiniLogo.png" 
                                                alt="Marquesa"
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <span className="text-xs text-white hidden">M</span>
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium">Atención al Cliente</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        ¡Hola! Bienvenido a MARQUESA. ¿En qué podemos ayudarte hoy?
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTime(new Date())}
                                    </p>
                                </div>
                            </div>

                            {/* Mensajes del chat - Solo mostrar mensajes no eliminados */}
                            {messages.filter(message => !message.isDeleted).map((message, index) => {
                                const showDate = index === 0 || 
                                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                                
                                return (
                                    <div key={message._id}>
                                        {showDate && (
                                            <div className="text-center mb-3">
                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                                    {formatDate(message.createdAt)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        <MessageItem
                                            message={message}
                                            isOwnMessage={message.senderType === 'Customer'}
                                            isAdmin={false}
                                            onAction={handleMessageAction}
                                            MediaRenderer={MediaRenderer}
                                            formatTime={formatTime}
                                            compact={true} // Para el cliente, usar vista compacta
                                        />
                                    </div>
                                );
                            })}

                            {/* Indicador de escritura */}
                            {typingUsers && typingUsers.size > 0 && (
                                <TypingIndicator users={Array.from(typingUsers)} compact={true} />
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
                                compact={true} // Vista compacta para cliente
                            />
                        )}

                        {/* Input para escribir mensaje */}
                        <div className="p-2 md:p-3 border-t border-gray-200 bg-white flex-shrink-0">
                            <form onSubmit={handleFormSubmit} className="flex items-end space-x-2">
                                {/* Botón de archivo */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 p-1 text-gray-500 hover:text-[#E8ACD2] transition-colors"
                                    title="Adjuntar archivo"
                                    disabled={!activeConversation}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E8ACD2] focus:border-transparent"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                    disabled={!activeConversation}
                                />
                                
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || !activeConversation}
                                    className="flex-shrink-0 px-2 py-1 bg-[#E8ACD2] text-white rounded-lg hover:bg-[#E096C8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                )}

                {/* Modal de confirmación para eliminar mensaje */}
                <DeleteMessageModal
                    isOpen={showDeleteModal}
                    message={messageToDelete}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDeleteMessage}
                    isDeleting={isDeleting}
                    formatTime={formatTime}
                    compact={true} // Modal compacto para cliente
                />

                {/* Modal de error */}
                {error && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="bg-white rounded-lg p-4 max-w-xs mx-4">
                            <h3 className="text-lg font-semibold text-red-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Error
                            </h3>
                            <p className="text-gray-700 mb-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {error}
                            </p>
                            <button
                                onClick={clearError}
                                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatClient;
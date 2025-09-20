import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './Hooks/useChat';

// Importar componentes modulares
import DeleteMessageModal from './DeleteMessageModal';
import MessageItem from './MessageItem';
import FilePreview from './FilePreview';
import MediaRenderer from './MediaRenderer';
import TypingIndicator from './TypingIndicator';
import ChatStatus from './ChatStatus';
import MiniLogo from '../../assets/marquesaMiniLogo.png';

/**
 * Componente de Chat para Clientes - CORRECCIÓN CRÍTICA PARA PRIMER MENSAJE
 * 
 * CAMBIOS IMPLEMENTADOS:
 * - Espera a que Socket.IO esté realmente listo antes de permitir envío
 * - Mejor indicadores visuales del estado de conexión
 * - Manejo mejorado de primer mensaje con feedback visual
 * - Sincronización garantizada con Socket.IO
 * 
 * Ubicación: frontend/src/components/Chat/ChatClient.jsx
 */

// ✅ Error Boundary (sin cambios)
class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ Error en ChatClient:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
                    <div className="bg-red-50 border border-red-200 rounded-lg shadow-xl w-[90vw] max-w-sm p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-red-800 font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Error en el Chat
                            </h3>
                        </div>
                        <p className="text-red-700 text-xs mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Hubo un problema al cargar el chat. Por favor, recarga la página.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Recargar Página
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-3">
                                <summary className="text-xs text-red-600 cursor-pointer">Ver detalles del error</summary>
                                <pre className="text-xs text-red-500 mt-2 overflow-auto max-h-20">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ✅ COMPONENTE DE LOADING MEJORADO
const ChatLoading = ({ isSocketReady, socketConnected }) => (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
        <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-sm h-[70vh] md:h-96 flex flex-col border border-gray-200">
            <div className="bg-[#E8ACD2] p-3 md:p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
                    <div>
                        <div className="w-20 h-3 bg-white bg-opacity-20 rounded animate-pulse mb-1"></div>
                        <div className="w-16 h-2 bg-white bg-opacity-20 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8ACD2] mx-auto mb-2"></div>
                    {/* ✅ INDICADOR MEJORADO DEL ESTADO */}
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {!socketConnected ? 'Conectando al servidor...' : 
                         !isSocketReady ? 'Preparando chat...' : 
                         'Inicializando...'}
                    </p>
                    {/* ✅ INDICADOR VISUAL DEL PROGRESO */}
                    <div className="mt-2 flex justify-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${isSocketReady ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ✅ Componente principal del chat
const ChatClient = ({ isOpen, onClose }) => {
    // ✅ Hook con estado de Socket.IO listo
    const {
        activeConversation,
        messages,
        newMessage,
        setNewMessage,
        loading,
        error,
        isConnected,
        authLoading,
        isSocketReady, // ✅ NUEVO: Estado crítico de Socket.IO
        sendMessage,
        deleteMessage,
        clearError,
        messagesEndRef,
        typingUsers,
        showDeleteModal,
        messageToDelete,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteMessage
    } = useChat();

    // Estados locales para archivos
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(false);
    // ✅ NUEVO: Estado para mostrar indicador de espera de Socket.IO
    const [isWaitingForSocket, setIsWaitingForSocket] = useState(false);

    const fileInputRef = useRef(null);

    // ✅ EFECTO DE INICIALIZACIÓN MEJORADO
    useEffect(() => {
        console.log('🔄 ChatClient - Estados de inicialización:', {
            authLoading,
            loading,
            isSocketReady,
            isConnected,
            activeConversation: !!activeConversation
        });

        if (!authLoading && !loading) {
            setIsInitialized(true);
            setIsFirstMessage(!activeConversation);
        }
    }, [authLoading, loading, activeConversation, isSocketReady]);

    // ✅ EFECTO PARA DETECTAR PRIMER MENSAJE
    useEffect(() => {
        setIsFirstMessage(!activeConversation);
    }, [activeConversation]);

    // ✅ EFECTO PARA MANEJAR INDICADOR DE ESPERA
    useEffect(() => {
        if (isFirstMessage && !isSocketReady && isConnected) {
            setIsWaitingForSocket(true);
        } else {
            setIsWaitingForSocket(false);
        }
    }, [isFirstMessage, isSocketReady, isConnected]);

    if (!isOpen) return null;

    // ✅ LOADING MEJORADO CON ESTADOS DE SOCKET.IO
    if (authLoading || (loading && !isInitialized)) {
        return <ChatLoading isSocketReady={isSocketReady} socketConnected={isConnected} />;
    }

    // ✅ FUNCIONES DE ENVÍO MEJORADAS
    const handleSendMessage = async (messageText, file = null) => {
        if (!messageText?.trim() && !file && !selectedFile) return;

        const fileToSend = file || selectedFile;
        const conversationId = activeConversation?.conversationId || null;

        // ✅ VERIFICACIÓN CRÍTICA: Socket.IO listo para primer mensaje
        if (isFirstMessage && !isSocketReady) {
            console.log('⚠️ Primer mensaje pero Socket.IO no listo, mostrando indicador...');
            setIsWaitingForSocket(true);
        }

        const success = await sendMessage(conversationId, messageText, fileToSend);

        if (success) {
            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsWaitingForSocket(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            if (isFirstMessage) {
                setIsFirstMessage(false);
            }
        } else {
            setIsWaitingForSocket(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (newMessage?.trim() || selectedFile) {
            handleSendMessage(newMessage);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage?.trim() || selectedFile) {
                handleSendMessage(newMessage);
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreviewUrl(e.target.result);
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleMessageAction = (action, message) => {
        console.log('🔧 Acción de mensaje:', { action, messageId: message._id, senderType: message.senderType });
        
        if (action === 'delete') {
            // ✅ VERIFICAR QUE ES UN MENSAJE PROPIO
            if (message.senderType === 'Customer') {
                console.log('🗑️ Abriendo modal de eliminación para mensaje propio');
                openDeleteModal(message);
            } else {
                console.log('⚠️ Intento de eliminar mensaje que no es propio');
                setError('Solo puedes eliminar tus propios mensajes');
            }
        }
    };

    // ✅ Funciones de formato
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

        const messageDateOnly = messageDate.toDateString();
        const todayOnly = today.toDateString();
        const yesterdayOnly = yesterday.toDateString();

        if (messageDateOnly === todayOnly) {
            return 'Hoy';
        } else if (messageDateOnly === yesterdayOnly) {
            return 'Ayer';
        } else {
            return messageDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    };

    const safeMessages = messages || [];
    const messageCount = safeMessages.filter(msg => !msg.isDeleted).length;
    const isNearLimit = messageCount >= 70;
    const isAtLimit = messageCount >= 75;

    return (
        <ChatErrorBoundary>
            <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50">
                <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-sm h-[70vh] md:h-96 flex flex-col border border-gray-200">
                    {/* Header del chat mejorado */}
                    <div className="bg-[#E8ACD2] p-3 md:p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                            <div className="w-6 md:w-8 h-6 md:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 relative">
                                <img
                                    src={MiniLogo}
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

                    {/* ✅ INDICADOR DE ESPERA DE SOCKET.IO */}
                    {isWaitingForSocket && (
                        <div className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-b">
                            <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Preparando chat para tu primer mensaje...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Estado de conexión */}
                    {!isConnected && (
                        <ChatStatus isConnected={isConnected} />
                    )}

                    {/* Indicador de límite de mensajes */}
                    {isNearLimit && (
                        <div className={`px-2 py-1 text-xs ${isAtLimit ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'} border-b`}>
                            <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>
                                    {isAtLimit
                                        ? 'Límite de mensajes alcanzado'
                                        : `${messageCount}/75 mensajes`
                                    }
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Área de mensajes */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 space-y-3 min-h-0">
                        {/* ✅ MENSAJE DE BIENVENIDA MEJORADO */}
                        <div className="flex justify-start">
                            <div className="bg-white rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-4 h-4 rounded-full bg-[#E8ACD2] flex items-center justify-center">
                                        <img
                                            src={MiniLogo}
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
                                    {isFirstMessage
                                        ? '¡Hola! Bienvenido a MARQUESA. ¿En qué podemos ayudarte hoy? Envía tu primer mensaje para comenzar.'
                                        : '¡Hola! Bienvenido a MARQUESA. ¿En qué podemos ayudarte hoy?'
                                    }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTime(new Date())}
                                </p>
                            </div>
                        </div>

                        {/* ✅ MENSAJES DEL CHAT */}
                        {!isFirstMessage && (() => {
                            const validMessages = safeMessages.filter(message => !message.isDeleted);

                            return validMessages.map((message, index) => {
                                const showDate = index === 0 ||
                                    formatDate(message.createdAt) !== formatDate(validMessages[index - 1].createdAt);

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
                                            compact={true}
                                            activeConversation={activeConversation}
                                            // ✅ PERMITIR ELIMINACIÓN DE MENSAJES PROPIOS
                                            canDelete={message.senderType === 'Customer'}
                                        />
                                    </div>
                                );
                            });
                        })()}

                        {/* ✅ MENSAJE DE AYUDA MEJORADO */}
                        {isFirstMessage && (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {!isSocketReady 
                                            ? 'Conectando al chat, espera un momento...'
                                            : 'Escribe tu mensaje abajo para iniciar la conversación'
                                        }
                                    </span>
                                </div>
                            </div>
                        )}

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
                            compact={true}
                        />
                    )}

                    {/* ✅ INPUT MEJORADO CON VALIDACIÓN DE SOCKET.IO */}
                    <div className="p-2 md:p-3 border-t border-gray-200 bg-white flex-shrink-0">
                        <form onSubmit={handleFormSubmit} className="flex items-end space-x-2">
                            {/* Botón de archivo */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isFirstMessage && !isSocketReady}
                                className={`flex-shrink-0 p-1 transition-colors ${
                                    isFirstMessage && !isSocketReady 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-[#E8ACD2]'
                                }`}
                                title={isFirstMessage && !isSocketReady ? 'Conectando...' : 'Adjuntar archivo'}
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
                                value={newMessage || ''}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    isFirstMessage && !isSocketReady 
                                        ? "Conectando al chat..." 
                                        : isFirstMessage 
                                            ? "Escribe tu primer mensaje..." 
                                            : "Escribe un mensaje..."
                                }
                                disabled={isFirstMessage && !isSocketReady}
                                className={`flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#E8ACD2] focus:border-transparent ${
                                    isFirstMessage && !isSocketReady ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />

                            <button
                                type="submit"
                                disabled={(!newMessage?.trim() && !selectedFile) || (isFirstMessage && !isSocketReady)}
                                className={`flex-shrink-0 px-2 py-1 rounded-lg transition-colors ${
                                    (!newMessage?.trim() && !selectedFile) || (isFirstMessage && !isSocketReady)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#E8ACD2] text-white hover:bg-[#E096C8]'
                                }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                title={isFirstMessage && !isSocketReady ? 'Conectando al chat...' : 'Enviar mensaje'}
                            >
                                {isWaitingForSocket ? (
                                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Modal de confirmación para eliminar mensaje */}
                    {showDeleteModal && (
                        <DeleteMessageModal
                            isOpen={showDeleteModal}
                            message={messageToDelete}
                            onClose={closeDeleteModal}
                            onConfirm={confirmDeleteMessage}
                            isDeleting={isDeleting}
                            formatTime={formatTime}
                            compact={true}
                        />
                    )}

                    {/* Modal de error mejorado */}
                    {error && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="bg-white rounded-lg p-4 max-w-xs mx-4">
                                <h3 className="text-lg font-semibold text-red-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {error.includes('cuenta ha sido eliminada') ? 'Cuenta Eliminada' : 
                                     error.includes('Conectando') ? 'Conectando' : 'Error'}
                                </h3>
                                <p className="text-gray-700 mb-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {error}
                                </p>
                                <button
                                    onClick={() => {
                                        clearError();
                                        if (error.includes('cuenta ha sido eliminada')) {
                                            onClose();
                                        }
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg transition-colors text-sm ${
                                        error.includes('Conectando') 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {error.includes('cuenta ha sido eliminada') ? 'Entendido' : 
                                     error.includes('Conectando') ? 'Esperar' : 'Cerrar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ChatErrorBoundary>
    );
};

export default ChatClient;
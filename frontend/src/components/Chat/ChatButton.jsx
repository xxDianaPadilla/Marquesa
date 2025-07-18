import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatClient from './ChatClient';
import iconchat from '../../assets/iconchat.png';

const ChatButton = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showClientChat, setShowClientChat] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const handleChatClick = () => {
        // Si es cliente autenticado, abrir chat real
        if (isAuthenticated && user?.userType === 'Customer') {
            setShowClientChat(true);
        } else {
            // Si no está autenticado o no es cliente, mostrar chat demo
            setShowDemoModal(true);
        }
    };

    return (
        <>
            {/* Botón de Chat Flotante */}
            {!showDemoModal && !showClientChat && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={handleChatClick}
                        className="bg-[#E8ACD2] hover:bg-[#E096C8] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                        title="Abrir chat"
                    >
                        <img
                            src={iconchat}
                            alt="Chat"
                            className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                        />
                    </button>
                </div>
            )}

            {/* Chat Demo Modal - Solo para usuarios no autenticados */}
            {showDemoModal && (
                <div className="fixed bottom-6 right-6 z-40">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[80vh] overflow-hidden">
                        {/* Header del chat */}
                        <div className="bg-white p-4 flex items-center justify-between border-b border-gray-300">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900" style={{ fontFamily: "Poppins" }}>
                                        Atención al cliente
                                    </h3>
                                    <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins" }}>
                                        Demo - Inicia sesión para chat real
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDemoModal(false)}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Área de mensajes demo */}
                        <div className="p-4 h-80 overflow-y-auto bg-gray-50">
                            {/* Mensajes de demostración */}
                            <div className="mb-4">
                                <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                                    <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
                                        ¡Hola! Bienvenido a MARQUESA. ¿En qué podemos ayudarte hoy?
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 flex justify-end">
                                <div className="bg-pink-100 rounded-lg p-3 max-w-xs">
                                    <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
                                        Hola, estoy interesada en un arreglo floral para un cumpleaños
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                                    <p className="text-sm text-gray-800" style={{ fontFamily: "Poppins" }}>
                                        ¡Claro! Tenemos varias opciones de arreglos florales para cumpleaños. Para usar el chat en tiempo real, por favor inicia sesión.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón para iniciar sesión */}
                        <div className="p-4 bg-white border-t">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-[#E8ACD2] hover:bg-[#E096C8] text-white py-2 px-4 rounded-lg transition-colors"
                                style={{ fontFamily: "Poppins" }}
                            >
                                Iniciar sesión para chat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Real para Clientes */}
            <ChatClient 
                isOpen={showClientChat} 
                onClose={() => setShowClientChat(false)} 
            />
        </>
    );
};

export default ChatButton;
import React from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTools from "../components/AdminTools";
import ChatAdmin from "../components/Chat/ChatAdmin";

const ChatManager = () => {
    return (
        <AdminLayout>
            <div className="p-3 sm:p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
                        <div className="flex-1">
                            <h1
                                className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                                Gestión de Chat
                            </h1>
                            <p
                                className="text-gray-600 text-sm sm:text-base"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                                Administra las conversaciones con los clientes en tiempo real
                            </p>
                        </div>

                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <AdminTools />
                        </div>
                    </div>
                </div>

                {/* Componente principal de chat */}
                <ChatAdmin />
            </div>
        </AdminLayout>
    );
};

export default ChatManager;
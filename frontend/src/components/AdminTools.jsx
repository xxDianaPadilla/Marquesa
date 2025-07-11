import React from "react";
import chatIcon from "../assets/chatIcon.png";
import bellIcon from "../assets/bell.png";
import marquesaMiniLogo from "../assets/marquesaMiniLogo.png";

// Componente para las herramientas del administrador
// Muestra iconos de chat, notificaciones y perfil del administrador
const AdminTools = () => {
    return (
        <div className="flex items-center justify-end gap-4 mb-6">
            {/* Chat Icon */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                    style={{ cursor: 'pointer' }}
                    src={chatIcon}
                    alt="Chat"
                    className="w-6 h-6"
                />
            </button>

            {/* Bell/Notification Icon */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                    style={{ cursor: 'pointer' }}
                    src={bellIcon}
                    alt="Notifications"
                    className="w-6 h-6"
                />
            </button>

            {/* Profile Section */}
            <div className="flex items-center gap-3 ml-2">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Marquesa
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Administrador
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                        src={marquesaMiniLogo}
                        alt="Miguel Terezón"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminTools;
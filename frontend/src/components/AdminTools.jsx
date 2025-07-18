import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import chatIcon from "../assets/chatIcon.png";
import bellIcon from "../assets/bell.png";
import marquesaMiniLogo from "../assets/marquesaMiniLogo.png";

// Componente para las herramientas del administrador
// Muestra iconos de chat, notificaciones y perfil del administrador
const AdminTools = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // Obtener estadísticas de chat para mostrar badge
    const fetchChatStats = async () => {
        if (!user || user.userType !== 'admin') return;
        
        try {
            const response = await fetch('http://localhost:4000/api/chat/admin/stats', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.stats?.unreadMessages || 0);
            }
        } catch (error) {
            console.error('Error fetching chat stats:', error);
        }
    };

    // Actualizar estadísticas cada 30 segundos
    useEffect(() => {
        if (user?.userType === 'admin') {
            fetchChatStats();
            const interval = setInterval(fetchChatStats, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleChatClick = () => {
        navigate('/chat');
    };

    return (
        <div className="flex items-center justify-end gap-4 mb-6">
            {/* Chat Icon con badge de mensajes no leídos */}
            <button 
                onClick={handleChatClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
                <img
                    style={{ cursor: 'pointer' }}
                    src={chatIcon}
                    alt="Chat"
                    className="w-6 h-6"
                />
                {/* Badge de mensajes no leídos */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
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
/**
 * Componente UserInfo - Información personal del usuario
 * Muestra los datos personales del usuario logueado
 * 
 * - user: Objeto con los datos del usuario desde AuthContext
 */
import React from 'react';
import UserAvatar from './UserAvatar';
import SeparatorPerfil from '../SeparadorPerfil';

// Importar iconos existentes
import correo from '../../assets/CorreoMarqueza.png';
import telefono from '../../assets/TelefonoMarqueza.png';
import ubicacion from '../../assets/ubicacion.png';

const UserInfo = ({ user }) => {
    // DEBUG: Mostrar información del usuario recibida
    console.log('UserInfo - Usuario recibido:', user);
    console.log('UserInfo - Tipo de usuario:', typeof user);
    console.log('UserInfo - Propiedades:', user ? Object.keys(user) : 'Sin propiedades');

    /**
     * Función para formatear la fecha de registro - MEJORADA
     * @param {string|Date} createdAt - Fecha de creación de la cuenta
     * @returns {string} Año de registro formateado
     */
    const getRegistrationYear = (createdAt) => {
        console.log('📅 Procesando fecha de creación:', createdAt, typeof createdAt);
        
        if (!createdAt) {
            console.warn('⚠️ No hay fecha de creación, usando valor por defecto');
            return '2024'; // Valor por defecto
        }
        
        try {
            let date;
            
            // Si es una cadena, convertirla a Date
            if (typeof createdAt === 'string') {
                date = new Date(createdAt);
            } else if (createdAt instanceof Date) {
                date = createdAt;
            } else {
                console.warn('⚠️ Tipo de fecha no reconocido:', typeof createdAt);
                return '2024';
            }
            
            // Verificar que la fecha sea válida
            if (isNaN(date.getTime())) {
                console.error('❌ Fecha inválida:', createdAt);
                return '2024';
            }
            
            const year = date.getFullYear();
            console.log('✅ Año extraído exitosamente:', year);
            return year.toString();
            
        } catch (error) {
            console.error('❌ Error al formatear fecha de registro:', error);
            return '2024';
        }
    };

    /**
     * Función para obtener la fecha completa de registro - NUEVA
     * @param {string|Date} createdAt - Fecha de creación de la cuenta
     * @returns {string} Fecha formateada para mostrar
     */
    const getFormattedRegistrationDate = (createdAt) => {
        if (!createdAt) return 'Fecha no disponible';
        
        try {
            const date = new Date(createdAt);
            if (isNaN(date.getTime())) return 'Fecha no disponible';
            
            // Formatear la fecha en español
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            return date.toLocaleDateString('es-ES', options);
        } catch (error) {
            console.error('Error al formatear fecha completa:', error);
            return 'Fecha no disponible';
        }
    };

    /**
     * Función para formatear el teléfono
     * @param {string} phone - Número de teléfono
     * @returns {string} Teléfono formateado con prefijo salvadoreño
     */
    const formatPhone = (phone) => {
        if (!phone) return 'No especificado';
        
        // Si ya tiene el prefijo +503, devolverlo tal como está
        if (phone.startsWith('+503')) {
            return phone;
        }
        
        // Si no tiene prefijo, agregarlo
        return `+503 ${phone}`;
    };

    /**
     * Extraer el nombre para mostrar
     */
    const displayName = user?.name || user?.fullName || 'Usuario';
    const displayEmail = user?.email || 'No especificado';
    const displayPhone = user?.phone || null;
    const displayAddress = user?.address || 'Dirección no especificada';
    const displayProfilePicture = user?.profilePicture || null;

    console.log('🎭 UserInfo - Datos procesados:', {
        displayName,
        displayEmail,
        displayPhone,
        displayAddress,
        displayProfilePicture,
        createdAt: user?.createdAt
    });

    return (
        <div className="flex flex-col items-center text-center">
            {/* Avatar del usuario */}
            <UserAvatar 
                profilePicture={displayProfilePicture}
                fullName={displayName}
                size="xl"
            />
            
            {/* Nombre del usuario */}
            <p className="font-bold mt-3">
                {displayName}
            </p>
            
            {/* Información de membresía - MEJORADA */}
            <p className="text-xs text-gray-500 mb-1">
                Miembro desde {getRegistrationYear(user?.createdAt)}
            </p>
            
            {/* Fecha completa de registro - NUEVA */}
            <p className="text-xs text-gray-400 mb-3" title="Fecha de registro completa">
                Registrado el {getFormattedRegistrationDate(user?.createdAt)}
            </p>
            
            {/* Separador visual */}
            <SeparatorPerfil />
            
            {/* Información de contacto */}
            <div className="text-sm text-left w-full space-y-4 mt-4">
                {/* Email */}
                <div className="flex items-start gap-2">
                    <img src={correo} alt="correo" className="w-5 h-5 mt-1" />
                    <p className="break-all">
                        {displayEmail}
                    </p>
                </div>
                
                {/* Teléfono */}
                <div className="flex items-start gap-2">
                    <img src={telefono} alt="telefono" className="w-5 h-5 mt-1" />
                    <p>
                        {formatPhone(displayPhone)}
                    </p>
                </div>
                
                {/* Dirección */}
                <div className="flex items-start gap-2">
                    <img src={ubicacion} alt="ubicacion" className="w-5 h-5 mt-1" />
                    <p>
                        {displayAddress}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
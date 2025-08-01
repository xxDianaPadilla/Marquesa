/**
 * Componente UserAvatar - Avatar del usuario con imagen o iniciales
 * Muestra la foto de perfil del usuario o sus iniciales si no tiene foto
 * 
 * - profilePicture: URL de la imagen de perfil (opcional)
 * - fullName: Nombre completo del usuario
 * - size: Tamaño del avatar ('sm', 'md', 'lg', 'xl')
 */
import React from 'react';

const UserAvatar = ({ profilePicture, fullName, size = 'xl' }) => {
    /**
     * Función para obtener las iniciales del nombre completo
     * @param {string} name - Nombre completo del usuario
     * @returns {string} Iniciales (máximo 2 caracteres)
     */
    const getInitials = (name) => {
        if (!name) return 'U'; // Usuario por defecto
        
        const words = name.trim().split(' ');
        if (words.length === 1) {
            // Si solo hay una palabra, tomar las primeras 2 letras
            return words[0].substring(0, 2).toUpperCase();
        }
        
        // Si hay varias palabras, tomar la primera letra de las primeras 2 palabras
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    };

    /**
     * Configuración de tamaños para el avatar
     */
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-16 h-16 text-lg',
        lg: 'w-20 h-20 text-xl',
        xl: 'w-24 h-24 md:w-32 md:h-32 text-2xl md:text-3xl'
    };

    const avatarSize = sizeClasses[size] || sizeClasses.xl;

    return (
        <div className={`${avatarSize} rounded-full flex items-center justify-center overflow-hidden`}>
            {profilePicture ? (
                // Si tiene foto de perfil, mostrarla
                <img
                    src={profilePicture}
                    alt={`Foto de perfil de ${fullName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Si la imagen falla al cargar, mostrar las iniciales
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            
            {/* Fallback con iniciales - se muestra si no hay imagen o si falla */}
            <div 
                className={`${avatarSize} bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700 ${profilePicture ? 'hidden' : 'flex'}`}
                style={{ display: profilePicture ? 'none' : 'flex' }}
            >
                {getInitials(fullName)}
            </div>
        </div>
    );
};

export default UserAvatar;
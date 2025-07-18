import React from 'react';

const TypingIndicator = ({ users = [], compact = false }) => {
    if (!users || users.length === 0) return null;

    return (
        <div className={`flex items-center space-x-2 ${compact ? 'px-2 py-1' : 'px-4 py-2'}`}>
            <div className="flex items-center space-x-1">
                {/* Animación de puntos */}
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                {/* Texto indicador */}
                <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {users.length === 1 
                        ? 'escribiendo...' 
                        : `${users.length} personas escribiendo...`
                    }
                </span>
            </div>
        </div>
    );
};

export default TypingIndicator;
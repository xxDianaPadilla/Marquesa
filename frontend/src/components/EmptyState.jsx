import React from 'react';

const EmptyState = ({ 
    icon, 
    title, 
    description, 
    actionText, 
    onAction,
    className = '' 
}) => {
    // ========== FUNCIONES DE VALIDACIÓN DEFENSIVA ==========
    
    /**
     * Convierte cualquier valor a string de forma segura para renderizar
     */
    const safeToString = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
            // Si es un objeto con una propiedad 'name', usarla
            if (value.name) return safeToString(value.name);
            // Si es un objeto con una propiedad 'value', usarla
            if (value.value !== undefined) return safeToString(value.value);
            // En último caso, convertir a JSON
            try {
                return JSON.stringify(value);
            } catch (error) {
                return '[Objeto]';
            }
        }
        return String(value);
    };

    // ========== VALORES SEGUROS PARA RENDERIZAR ==========
    
    const safeTitle = safeToString(title) || 'Sin contenido disponible';
    const safeDescription = safeToString(description) || '';
    const safeActionText = safeToString(actionText) || '';
    const safeClassName = safeToString(className) || '';

    const defaultIcon = (
        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    );

    // Validar que onAction sea una función
    const handleAction = () => {
        try {
            if (typeof onAction === 'function') {
                onAction();
            } else {
                console.warn('onAction is not a function:', onAction);
            }
        } catch (error) {
            console.error('Error executing onAction:', error);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-[400px] ${safeClassName}`}>
            <div className="text-center max-w-md mx-auto p-6">
                <div className="mb-6">
                    {/* Validar que icon sea un elemento React válido */}
                    {React.isValidElement(icon) ? icon : defaultIcon}
                </div>
                <h3 
                    className="text-xl font-semibold text-gray-800 mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {safeTitle}
                </h3>
                {safeDescription && (
                    <p 
                        className="text-gray-600 mb-6"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {safeDescription}
                    </p>
                )}
                {safeActionText && onAction && (
                    <button
                        className="bg-[#FDB4B7] hover:bg-[#FCA5A9] text-white px-6 py-3 
                                 rounded-lg transition-colors duration-200 font-medium"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        onClick={handleAction}
                    >
                        {safeActionText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
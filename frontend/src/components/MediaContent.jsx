import React from 'react';
import MediaTable from './MediaTable';
import MediaList from './MediaList';
import LoadingState from './LoadingState';

// Componente para mostrar contenido multimedia
// Este componente maneja la visualización de elementos multimedia en diferentes formatos
const MediaContent = ({ 
    items, 
    loading, 
    totalItems,
    onEdit, 
    onDelete, 
    onCopyUrl 
}) => {
    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Vista Desktop - Tabla */}
            <MediaTable 
                items={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopyUrl={onCopyUrl}
            />

            {/* Vista Mobile y Tablet - Lista */}
            <MediaList 
                items={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopyUrl={onCopyUrl}
            />

            {/* Footer con información */}
            {items.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Mostrando {items.length} de {totalItems} elementos
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaContent;
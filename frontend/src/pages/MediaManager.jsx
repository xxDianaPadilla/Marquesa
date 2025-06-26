import React, { useState, useEffect } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import MediaUploadModal from "../components/MediaUploadModal";
import MediaEditModal from "../components/MediaEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

/**
 * Componente MediaManager
 * Ruta: frontend/src/pages/MediaManager.jsx
 * Interfaz principal para la administración de multimedia (imágenes, videos, blogs)
 */
const MediaManager = () => {
    // Estados para el manejo de datos
    const [mediaItems, setMediaItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("todos");
    const [isLoading, setIsLoading] = useState(true);

    // Estados para modales
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Datos de ejemplo (en producción vendrían de una API)
    const mockMediaData = [
        {
            id: 1,
            type: "imagen",
            title: "Ramo de rosas",
            url: "https://example.com/video/fjrj.jpg",
            description: "Hermoso ramo de rosas rojas frescas",
            category: "flores-naturales",
            createdAt: "2025-01-15",
            size: "2.5 MB"
        },
        {
            id: 2,
            type: "blog",
            title: "Cuidado de flores",
            url: "https://example.com/video/hjy.jpg",
            description: "Consejos para mantener flores frescas por más tiempo",
            category: "consejos",
            createdAt: "2025-01-14",
            size: "1.8 MB"
        },
        {
            id: 3,
            type: "imagen",
            title: "Arreglo floral",
            url: "https://example.com/video/abc.jpg",
            description: "Arreglo floral para eventos especiales",
            category: "eventos",
            createdAt: "2025-01-13",
            size: "3.1 MB"
        }
    ];

    // Cargar datos iniciales
    useEffect(() => {
        const timer = setTimeout(() => {
            setMediaItems(mockMediaData);
            setFilteredItems(mockMediaData);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Filtrar elementos según búsqueda y tipo
    useEffect(() => {
        let filtered = mediaItems;

        // Filtrar por tipo
        if (selectedType !== "todos") {
            filtered = filtered.filter(item => item.type === selectedType);
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [mediaItems, selectedType, searchTerm]);

    // Funciones para manejar modales
    const handleUpload = () => {
        setShowUploadModal(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        // Aquí podrías agregar una notificación
        console.log("URL copiada:", url);
    };

    // Funciones para confirmar acciones
    const confirmUpload = (newItem) => {
        const itemWithId = { ...newItem, id: Date.now() };
        setMediaItems(prev => [itemWithId, ...prev]);
        setShowUploadModal(false);
    };

    const confirmEdit = (editedItem) => {
        setMediaItems(prev =>
            prev.map(item => item.id === editedItem.id ? editedItem : item)
        );
        setShowEditModal(false);
        setSelectedItem(null);
    };

    const confirmDelete = () => {
        setMediaItems(prev =>
            prev.filter(item => item.id !== selectedItem.id)
        );
        setShowDeleteModal(false);
        setSelectedItem(null);
    };

    // Obtener icono según el tipo de archivo
    const getFileIcon = (type) => {
        switch (type) {
            case "imagen":
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                );
            case "video":
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                );
            case "blog":
                return (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const LoadingState = () => (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7260]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <NavbarAdmin />

            <div className="ml-16 p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Multimedia de Marquesa
                            </h1>
                            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Gestiona tus imágenes, videos y contenido de blog
                            </p>
                        </div>
                        <button
                            onClick={handleUpload}
                            className="bg-[#FF7260] hover:bg-[#FF6A54] text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Añadir Multimedia
                        </button>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filtro por tipo */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="imagen">Imágenes</option>
                            <option value="video">Videos</option>
                            <option value="blog">Blog</option>
                        </select>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header de la tabla */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <div className="col-span-1">Tipo</div>
                            <div className="col-span-3">Título</div>
                            <div className="col-span-4">URL</div>
                            <div className="col-span-2">Fecha</div>
                            <div className="col-span-2">Acciones</div>
                        </div>
                    </div>

                    {/* Lista de elementos */}
                    <div className="divide-y divide-gray-200">
                        {isLoading ? (
                            <LoadingState />
                        ) : filteredItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    No se encontraron elementos multimedia
                                </p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Tipo con icono */}
                                        <div className="col-span-1 flex items-center gap-2">
                                            {getFileIcon(item.type)}
                                            <span className="text-sm font-medium text-gray-700 capitalize" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {item.type}
                                            </span>
                                        </div>

                                        {/* Título */}
                                        <div className="col-span-3">
                                            <p className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {item.title}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* URL */}
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate" style={{ fontFamily: 'monospace' }}>
                                                    {item.url}
                                                </code>
                                                <button
                                                    onClick={() => handleCopy(item.url)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Copiar URL"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fecha */}
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>

                                        {/* Acciones */}
                                        <div className="col-span-2 flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                                title="Editar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                title="Eliminar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-6 text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Mostrando {filteredItems.length} de {mediaItems.length} elementos
                </div>
            </div>

            {/* Modales */}
            {showUploadModal && (
                <MediaUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onConfirm={confirmUpload}
                />
            )}

            {showEditModal && (
                <MediaEditModal
                    item={selectedItem}
                    onClose={() => setShowEditModal(false)}
                    onConfirm={confirmEdit}
                />
            )}

            {showDeleteModal && (
                <DeleteConfirmModal
                    item={selectedItem}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
};

export default MediaManager;
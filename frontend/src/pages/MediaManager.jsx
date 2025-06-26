import React, { useState, useEffect } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import MediaUploadModal from "../components/MediaUploadModal";
import MediaEditModal from "../components/MediaEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

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

    // Estado para mostrar notificaciones
    const [notification, setNotification] = useState(null);

    // Cargar datos desde la API
    const fetchMediaItems = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:4000/api/media?type=${selectedType}&search=${searchTerm}`);
            if (!response.ok) {
                throw new Error('Error al cargar multimedia');
            }
            const data = await response.json();
            setMediaItems(data);
            setFilteredItems(data);
        } catch (error) {
            console.error("Error al cargar multimedia:", error);
            showNotification("Error al cargar multimedia. Verifique la conexión con el servidor.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para mostrar notificaciones
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Cargar datos iniciales
    useEffect(() => {
        fetchMediaItems();
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
                (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

    const handleCopy = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            showNotification("URL copiada al portapapeles", "success");
        } catch (error) {
            console.error("Error al copiar URL:", error);
            showNotification("Error al copiar URL", "error");
        }
    };

    // Funciones para confirmar acciones
    const confirmUpload = async (newItem) => {
        await fetchMediaItems();
        setShowUploadModal(false);
        showNotification("Multimedia agregada exitosamente", "success");
    };

    const confirmEdit = async (editedItem) => {
        await fetchMediaItems();
        setShowEditModal(false);
        setSelectedItem(null);
        showNotification("Multimedia editada exitosamente", "success");
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/media/${selectedItem._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar multimedia');
            }

            await fetchMediaItems();
            setShowDeleteModal(false);
            setSelectedItem(null);
            showNotification("Multimedia eliminada exitosamente", "success");
        } catch (error) {
            console.error("Error al eliminar multimedia:", error);
            showNotification("Error al eliminar multimedia", "error");
        }
    };

    // Obtener icono según el tipo de archivo
    const getFileIcon = (item) => {
        const hasImage = item.imageURL && item.imageURL.trim() !== "";
        const hasVideo = item.videoURL && item.videoURL.trim() !== "";

        if (hasImage && hasVideo) {
            return (
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                </div>
            );
        } else if (hasImage) {
            return (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else if (hasVideo) {
            return (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    const LoadingState = () => (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7260] mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Cargando multimedia...
                </p>
            </div>
        </div>
    );

    const NotificationComponent = () => {
        if (!notification) return null;

        return (
            <div className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
                notification.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="flex items-center gap-2">
                    {notification.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span className="flex-1">{notification.message}</span>
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-2 hover:opacity-70 flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    // Determinar si hay modales abiertos para aplicar el overlay
    const hasModalOpen = showUploadModal || showEditModal || showDeleteModal;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar Admin - debe estar debajo del overlay */}
            <NavbarAdmin />
            
            {/* Componente de notificaciones - por encima del overlay */}
            <NotificationComponent />

            {/* Contenido principal */}
            <div className="ml-16 p-3 sm:p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Multimedia de Marquesa
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Gestiona tus imágenes, videos y contenido multimedia
                            </p>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={hasModalOpen}
                            className="w-full sm:w-auto bg-[#FF7260] hover:bg-[#FF6A54] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="hidden sm:inline">Añadir Multimedia</span>
                            <span className="sm:hidden">Añadir</span>
                        </button>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Buscador */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={hasModalOpen}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={hasModalOpen}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="Dato Curioso">Dato Curioso</option>
                            <option value="Tip">Tip</option>
                            <option value="Blog">Blog</option>
                        </select>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden lg:block">
                        {/* Header de la tabla */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <div className="col-span-1">Archivos</div>
                                <div className="col-span-2">Tipo</div>
                                <div className="col-span-3">Título</div>
                                <div className="col-span-3">URLs</div>
                                <div className="col-span-2">Fecha</div>
                                <div className="col-span-1">Acciones</div>
                            </div>
                        </div>

                        {/* Lista de elementos - Desktop */}
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
                                    <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* Archivos con icono */}
                                            <div className="col-span-1 flex items-center justify-center">
                                                {getFileIcon(item)}
                                            </div>

                                            {/* Tipo */}
                                            <div className="col-span-2">
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item.type}
                                                </span>
                                            </div>

                                            {/* Título */}
                                            <div className="col-span-3">
                                                <p className="font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item.title || 'Sin título'}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item.description || 'Sin descripción'}
                                                </p>
                                            </div>

                                            {/* URLs */}
                                            <div className="col-span-3 space-y-1">
                                                {item.imageURL && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-blue-600 font-medium">IMG:</span>
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate" style={{ fontFamily: 'monospace' }}>
                                                            {item.imageURL}
                                                        </code>
                                                        <button
                                                            onClick={() => handleCopy(item.imageURL)}
                                                            disabled={hasModalOpen}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Copiar URL imagen"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                                {item.videoURL && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-red-600 font-medium">VID:</span>
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate" style={{ fontFamily: 'monospace' }}>
                                                            {item.videoURL}
                                                        </code>
                                                        <button
                                                            onClick={() => handleCopy(item.videoURL)}
                                                            disabled={hasModalOpen}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Copiar URL video"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fecha */}
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="col-span-1 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    disabled={hasModalOpen}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    disabled={hasModalOpen}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Vista Mobile y Tablet - Tarjetas */}
                    <div className="lg:hidden">
                        {isLoading ? (
                            <LoadingState />
                        ) : filteredItems.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    No se encontraron elementos multimedia
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                {filteredItems.map((item) => (
                                    <div key={item._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        {/* Header de la tarjeta */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(item)}
                                                <div>
                                                    <h3 className="font-medium text-gray-900 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {item.title || 'Sin título'}
                                                    </h3>
                                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    disabled={hasModalOpen}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    disabled={hasModalOpen}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {item.description}
                                            </p>
                                        )}

                                        {/* URLs */}
                                        <div className="space-y-2 mb-3">
                                            {item.imageURL && (
                                                <div className="bg-white rounded p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-blue-600 font-medium">Imagen:</span>
                                                        <button
                                                            onClick={() => handleCopy(item.imageURL)}
                                                            disabled={hasModalOpen}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Copiar URL imagen"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <code className="text-xs text-gray-700 break-all" style={{ fontFamily: 'monospace' }}>
                                                        {item.imageURL}
                                                    </code>
                                                </div>
                                            )}
                                            {item.videoURL && (
                                                <div className="bg-white rounded p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-red-600 font-medium">Video:</span>
                                                        <button
                                                            onClick={() => handleCopy(item.videoURL)}
                                                            disabled={hasModalOpen}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Copiar URL video"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <code className="text-xs text-gray-700 break-all" style={{ fontFamily: 'monospace' }}>
                                                        {item.videoURL}
                                                    </code>
                                                </div>
                                            )}
                                        </div>

                                        {/* Fecha */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-6 text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Mostrando {filteredItems.length} de {mediaItems.length} elementos
                </div>
            </div>

            {/* Modales con overlay mejorado */}
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
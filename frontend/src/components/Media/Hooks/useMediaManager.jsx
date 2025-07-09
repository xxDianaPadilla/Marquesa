import { useState, useEffect, useCallback } from 'react';

export const useMediaManager = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('todos');

    // Estados para modales
    const [modals, setModals] = useState({
        upload: false,
        edit: false,
        delete: false
    });
    const [selectedItem, setSelectedItem] = useState(null);

    const API_BASE_URL = 'http://localhost:4000/api/media';

    // Fetch de elementos multimedia
    const fetchMediaItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (selectedType !== 'todos') params.append('type', selectedType);
            if (searchTerm.trim()) params.append('search', searchTerm);

            const response = await fetch(`${API_BASE_URL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setMediaItems(data);
            
        } catch (error) {
            console.error('Error al cargar multimedia:', error);
            setError(error.message);
            
            // Datos mock para desarrollo
            const mockData = [
                {
                    _id: "1",
                    type: "Dato Curioso",
                    title: "Dato curioso sobre flores",
                    description: "Las flores pueden comunicarse entre sí",
                    imageURL: "https://example.com/image1.jpg",
                    videoURL: "",
                    createdAt: new Date().toISOString()
                },
                {
                    _id: "2",
                    type: "Tip",
                    title: "Tip para cuidar flores",
                    description: "Cambia el agua cada 2 días",
                    imageURL: "",
                    videoURL: "https://example.com/video1.mp4",
                    createdAt: new Date().toISOString()
                }
            ];
            setMediaItems(mockData);
            
        } finally {
            setLoading(false);
        }
    }, [selectedType, searchTerm]);

    // Crear nuevo elemento multimedia
    const createMediaItem = async (formData) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear multimedia');
            }

            const result = await response.json();
            await fetchMediaItems(); // Refrescar lista
            return { success: true, data: result.media };
            
        } catch (error) {
            console.error('Error al crear multimedia:', error);
            return { success: false, error: error.message };
        }
    };

    // Actualizar elemento multimedia
    const updateMediaItem = async (itemId, formData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${itemId}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar multimedia');
            }

            const result = await response.json();
            await fetchMediaItems(); // Refrescar lista
            return { success: true, data: result.media };
            
        } catch (error) {
            console.error('Error al actualizar multimedia:', error);
            return { success: false, error: error.message };
        }
    };

    // Eliminar elemento multimedia
    const deleteMediaItem = async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${itemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar multimedia');
            }

            await fetchMediaItems(); // Refrescar lista
            return { success: true };
            
        } catch (error) {
            console.error('Error al eliminar multimedia:', error);
            return { success: false, error: error.message };
        }
    };

    // Filtrar elementos
    useEffect(() => {
        let filtered = mediaItems;

        // Filtrar por tipo
        if (selectedType !== 'todos') {
            filtered = filtered.filter(item => item.type === selectedType);
        }

        // Filtrar por término de búsqueda
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        }

        setFilteredItems(filtered);
    }, [mediaItems, selectedType, searchTerm]);

    // Cargar datos iniciales
    useEffect(() => {
        fetchMediaItems();
    }, [fetchMediaItems]);

    // Funciones para manejar modales
    const openModal = (modalType, item = null) => {
        setModals(prev => ({ ...prev, [modalType]: true }));
        if (item) setSelectedItem(item);
    };

    const closeModal = (modalType) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
        if (modalType !== 'upload') setSelectedItem(null);
    };

    const closeAllModals = () => {
        setModals({ upload: false, edit: false, delete: false });
        setSelectedItem(null);
    };

    return {
        // Estados
        mediaItems: filteredItems,
        loading,
        error,
        searchTerm,
        selectedType,
        modals,
        selectedItem,
        
        // Acciones de API
        createMediaItem,
        updateMediaItem,
        deleteMediaItem,
        refreshItems: fetchMediaItems,
        
        // Filtros
        setSearchTerm,
        setSelectedType,
        
        // Modales
        openModal,
        closeModal,
        closeAllModals,
        
        // Estadísticas
        stats: {
            total: mediaItems.length,
            datoCurioso: mediaItems.filter(item => item.type === 'Dato Curioso').length,
            tip: mediaItems.filter(item => item.type === 'Tip').length,
            blog: mediaItems.filter(item => item.type === 'Blog').length,
        }
    };
};
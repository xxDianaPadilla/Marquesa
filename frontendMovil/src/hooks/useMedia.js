import { useState, useEffect, useCallback, useMemo } from "react"; // Importamos React

// hook para funciones media
const useMedia = () => {
    const [allMediaItems, setAllMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [visibleItems, setVisibleItems] = useState(6);

    // Funciones auxiliares - estas no cambian, así que las sacamos del useCallback
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return new Date().toLocaleDateString('es-ES');
        }
    };

    // Obtenemos el label según la categoría
    const getCategoryLabel = (type) => {
        const categoryMap = {
            'Blog': 'Blog',
            'Tip': 'Tips',
            'Dato Curioso': 'Datos Curiosos',
            'video': 'Video',
            'tutorial': 'Tutorial',
            'general': 'General'
        };
        return categoryMap[type] || 'General';
    };

    // Programamos una imagen por defecto
    const getDefaultImage = (type) => {
        return 'https://via.placeholder.com/400x250/f3f4f6/6b7280?text=Media';
    };

    // Función principal de fetch - SIN dependencias en useCallback
    const fetchMediaData = useCallback(async (type = null, search = null) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (type && type !== 'all') {
                params.append('type', type);
            }
            if (search && search.trim()) {
                params.append('search', search.trim());
            }
            
            const queryString = params.toString();
            const url = `https://marquesa.onrender.com/api/media${queryString ? `?${queryString}` : ''}`;
            
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transformar datos - usando las funciones directamente
            const transformedData = data.map(item => {
                const itemId = item._id.toString();
                const hasVideoUrl = !!(item.videoURL || item.videoUrl || item.video_url);
                const isVideo = hasVideoUrl || item.type === 'video';
                
                return {
                    id: itemId,
                    _id: itemId,
                    title: item.title || 'Sin título',
                    date: formatDate(item.createdAt),
                    type: item.type || 'general',
                    category: getCategoryLabel(item.type),
                    image: item.imageURL || item.image || getDefaultImage(item.type),
                    isVideo: isVideo,
                    content: item.description || item.content || '',
                    videoUrl: item.videoURL || item.videoUrl || item.video_url || null,
                    author: item.author || 'Marquesa',
                    tags: item.tags || [],
                    likes: item.likes || 0,
                    views: item.views || 0,
                    duration: item.duration || null,
                    thumbnail: item.thumbnail || item.imageURL || item.image
                };
            });

            setAllMediaItems(transformedData);
            
        } catch (err) {
            console.error('Error fetching media data:', err);
            setError(err.message);
            setAllMediaItems([]);
        } finally {
            setLoading(false);
        }
    }, []); // Array vacío - la función no depende de ningún estado

    // Inicializar datos al montar el componente - solo se ejecuta una vez
    useEffect(() => {
        fetchMediaData();
    }, [fetchMediaData]);

    // Elementos filtrados
    const filteredItems = useMemo(() => {
        if (activeFilter === "all") {
            return allMediaItems;
        }
        return allMediaItems.filter((item) => item.type === activeFilter);
    }, [allMediaItems, activeFilter]);

    // Elementos mostrados con paginación
    const displayedItems = useMemo(() => {
        return filteredItems.slice(0, visibleItems);
    }, [filteredItems, visibleItems]);

    // Verificar si hay más elementos para mostrar
    const hasMoreItems = filteredItems.length > visibleItems;

    // Función para cargar más elementos
    const loadMoreItems = useCallback(() => {
        setVisibleItems((prev) => prev + 6);
    }, []);

    // Función para cambiar filtro - CORREGIDA
    const handleFilterChange = useCallback(async (newFilter) => {
        setActiveFilter(newFilter);
        setVisibleItems(6);
        
        const filterType = newFilter === 'all' ? null : newFilter;
        await fetchMediaData(filterType);
    }, [fetchMediaData]);

    // Función para refrescar datos - CORREGIDA
    const refreshData = useCallback(async () => {
        const filterType = activeFilter === 'all' ? null : activeFilter;
        await fetchMediaData(filterType);
    }, [fetchMediaData, activeFilter]); // Incluimos activeFilter como dependencia

    // Estadísticas computadas
    const stats = useMemo(() => {
        return {
            total: allMediaItems.length,
            totalViews: allMediaItems.reduce((sum, item) => sum + (item.views || 0), 0),
            videos: allMediaItems.filter(item => item.isVideo).length,
            articles: allMediaItems.filter(item => !item.isVideo).length
        };
    }, [allMediaItems]);

    // Función de búsqueda - CORREGIDA
    const searchMedia = useCallback(async (searchTerm) => {
        const filterType = activeFilter === 'all' ? null : activeFilter;
        await fetchMediaData(filterType, searchTerm);
    }, [fetchMediaData, activeFilter]); // Incluimos activeFilter como dependencia

    return {
        // Estados principales
        displayedItems,
        allMediaItems,
        activeFilter,
        loading,
        error,
        
        // Estados de paginación
        hasMoreItems,
        totalItems: filteredItems.length,
        visibleItems,
        
        // Funciones de control
        loadMoreItems,
        handleFilterChange,
        refreshData,
        searchMedia,
        
        // Estadísticas
        stats,
        
        // Funciones auxiliares 
        formatDate,
        getCategoryLabel,
        getDefaultImage
    };
};

export default useMedia;
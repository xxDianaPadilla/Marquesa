// frontend/src/components/Media/Hooks/useMedia.jsx
import { useState, useMemo, useEffect, useCallback } from "react";

// Hook para manejar las acciones de multimedia
const useMedia = () => {
  const [allMediaItems, setAllMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleItems, setVisibleItems] = useState(6);
  
  // Función para obtener todos los elemento de multimedia
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
      
      console.log('=== DEBUG useMedia ===');
      console.log('Datos recibidos de la API:', data);
      console.log('Cantidad de items:', data.length);
      if (data.length > 0) {
        console.log('Primer elemento completo:', data[0]);
        console.log('Estructura del primer elemento:');
        console.log('- _id:', data[0]._id);
        console.log('- title:', data[0].title);
        console.log('- type:', data[0].type);
        console.log('- videoURL:', data[0].videoURL);
        console.log('- imageURL:', data[0].imageURL);
      }
      
      // Transformar datos con mejor manejo de IDs
      const transformedData = data.map(item => {
        // SOLUCIÓN: Usar el _id de MongoDB como string
        const itemId = item._id.toString(); // Asegurar que sea string
        
        // Determinar si es un video
        const hasVideoUrl = !!(item.videoURL || item.videoUrl || item.video_url);
        const isVideoType = item.type === 'video' || item.category === 'video';
        const isVideo = hasVideoUrl || isVideoType;
        
        // Obtener la URL del video
        const videoUrl = item.videoURL || item.videoUrl || item.video_url || null;
        const cleanVideoUrl = videoUrl ? validateAndCleanVideoUrl(videoUrl) : null;
        
        const transformedItem = {
          id: itemId, // Usar _id como string
          _id: itemId, // Mantener también _id para compatibilidad
          title: item.title || 'Sin título',
          date: formatDate(item.createdAt),
          type: item.type || 'general',
          category: getCategoryLabel(item.type),
          image: item.imageURL || item.image || getDefaultImage(item.type),
          isVideo: isVideo,
          content: item.description || item.content || '',
          videoUrl: cleanVideoUrl,
          author: item.author || 'Marquesa',
          tags: item.tags || [],
          likes: item.likes || 0,
          views: item.views || 0,
          featured: item.featured || false,
          duration: item.duration || null,
          thumbnail: item.thumbnail || item.imageURL || item.image
        };

        console.log(`Transformado item ${itemId}:`, {
          id: transformedItem.id,
          title: transformedItem.title,
          isVideo: transformedItem.isVideo,
          videoUrl: transformedItem.videoUrl
        });

        return transformedItem;
      });

      console.log('Datos transformados finales:', transformedData);
      console.log('IDs finales:', transformedData.map(item => item.id));

      setAllMediaItems(transformedData);
      
    } catch (err) {
      console.error('Error fetching media data:', err);
      setError(err.message);
      setAllMediaItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para validar y limpiar URLs de video
  const validateAndCleanVideoUrl = (url) => {
    if (!url) return null;
    
    try {
      // Si es una URL de YouTube, convertir a formato embed si es necesario
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return convertYouTubeUrl(url);
      }
      
      // Si es una URL de Vimeo, convertir a formato embed si es necesario
      if (url.includes('vimeo.com')) {
        return convertVimeoUrl(url);
      }
      
      // Para URLs directas de video (mp4, webm, etc.)
      if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
        return url;
      }
      
      // Para otras URLs, asumir que son válidas
      return url;
      
    } catch (error) {
      console.warn('Error validating video URL:', url, error);
      return url;
    }
  };

  // Función para convertir URLs de YouTube a formato embed
  const convertYouTubeUrl = (url) => {
    try {
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        return url; // Ya está en formato embed
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      console.warn('Error converting YouTube URL:', error);
    }
    
    return url;
  };

  // Función para convertir URLs de Vimeo a formato embed
  const convertVimeoUrl = (url) => {
    try {
      const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    } catch (error) {
      console.warn('Error converting Vimeo URL:', error);
    }
    
    return url;
  };

  // Función auxiliar para formatear fechas
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

  // Función auxiliar para obtener etiquetas de categoría
  const getCategoryLabel = (type) => {
    const categoryMap = {
      'blog': 'Blog',
      'tips': 'Tips',
      'datos-curiosos': 'Datos Curiosos',
      'dato-curioso': 'Datos Curiosos',
      'video': 'Video',
      'tutorial': 'Tutorial',
      'guia': 'Guía',
      'general': 'General'
    };
    return categoryMap[type] || 'General';
  };

  // Función auxiliar para obtener imagen por defecto
  const getDefaultImage = (type) => {
    const defaultImages = {
      'blog': 'https://via.placeholder.com/400x250/f3f4f6/6b7280?text=Blog',
      'tips': 'https://via.placeholder.com/400x250/fef3c7/d97706?text=Tips',
      'datos-curiosos': 'https://via.placeholder.com/400x250/ddd6fe/7c3aed?text=Datos+Curiosos',
      'video': 'https://via.placeholder.com/400x250/fecaca/dc2626?text=Video',
      'general': 'https://via.placeholder.com/400x250/f3f4f6/6b7280?text=General'
    };
    return defaultImages[type] || defaultImages['general'];
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchMediaData();
  }, [fetchMediaData]);

  // useMemo memoriza los elementos filtrados
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return allMediaItems;
    }
    return allMediaItems.filter((item) => item.type === activeFilter);
  }, [allMediaItems, activeFilter]);

  // useMemo memoriza los elementos que se mostrarán
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleItems);
  }, [filteredItems, visibleItems]);

  // Variable booleana que indica si hay más elementos para cargar
  const hasMoreItems = filteredItems.length > visibleItems;

  // Función para cargar más elementos
  const loadMoreItems = useCallback(() => {
    setVisibleItems((prev) => prev + 6);
  }, []);

  // Función para reiniciar la vista
  const resetItems = useCallback(() => {
    setVisibleItems(6);
  }, []);

  // Manejador para cambiar el filtro activo
  const handleFilterChange = useCallback(async (newFilter) => {
    setActiveFilter(newFilter);
    setVisibleItems(6);
    
    const filterType = newFilter === 'all' ? null : newFilter;
    await fetchMediaData(filterType);
  }, [fetchMediaData]);

  // Función para buscar contenido
  const searchMedia = useCallback(async (searchTerm) => {
    const filterType = activeFilter === 'all' ? null : activeFilter;
    await fetchMediaData(filterType, searchTerm);
    setVisibleItems(6);
  }, [activeFilter, fetchMediaData]);

  // SOLUCIÓN: Función mejorada para obtener un elemento específico por su ID
  const getItemById = useCallback((id) => {
    if (!id || !allMediaItems || allMediaItems.length === 0) {
      console.log('getItemById: No hay ID o no hay items');
      return null;
    }

    console.log('=== getItemById DEBUG ===');
    console.log('Buscando ID:', id, 'tipo:', typeof id);
    console.log('Total items disponibles:', allMediaItems.length);
    console.log('IDs disponibles:', allMediaItems.map(item => ({ id: item.id, type: typeof item.id })));
    
    // SOLUCIÓN: Normalizar ambos IDs a string para comparación
    const searchId = String(id).trim();
    const found = allMediaItems.find((item) => {
      const itemId = String(item.id).trim();
      const match = itemId === searchId;
      console.log(`Comparando: "${itemId}" === "${searchId}" = ${match}`);
      return match;
    });
    
    console.log('Item encontrado:', found ? found.title : 'No encontrado');
    return found || null;
  }, [allMediaItems]);

  // Función para obtener elementos relacionados
  const getRelatedItems = useCallback((currentId, currentType, limit = 2) => {
    if (!allMediaItems || allMediaItems.length === 0) return [];
    
    const searchId = String(currentId).trim();
    return allMediaItems
      .filter(item => String(item.id).trim() !== searchId && item.type === currentType)
      .slice(0, limit);
  }, [allMediaItems]);

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    const filterType = activeFilter === 'all' ? null : activeFilter;
    await fetchMediaData(filterType);
  }, [activeFilter, fetchMediaData]);

  // Función para obtener estadísticas
  const getStats = useMemo(() => {
    const stats = {
      total: allMediaItems.length,
      byType: {},
      totalViews: 0,
      totalLikes: 0,
      videos: 0,
      articles: 0
    };

    allMediaItems.forEach(item => {
      // Contar por tipo
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      
      // Sumar vistas y likes
      stats.totalViews += item.views || 0;
      stats.totalLikes += item.likes || 0;
      
      // Contar videos y artículos
      if (item.isVideo) {
        stats.videos++;
      } else {
        stats.articles++;
      }
    });

    return stats;
  }, [allMediaItems]);

  // El hook retorna un objeto con los datos y funciones
  return {
    // Datos principales
    displayedItems,
    allMediaItems,
    activeFilter,
    
    // Estados de carga y error
    loading,
    error,
    
    // Funcionalidad de paginación
    hasMoreItems,
    visibleItems,
    totalItems: filteredItems.length,
    
    // Funciones principales
    loadMoreItems,
    resetItems,
    handleFilterChange,
    
    // Funciones de búsqueda y datos  
    searchMedia,
    refreshData,
    getItemById,
    getRelatedItems,
    
    // Estadísticas
    stats: getStats,
    
    // Función de utilidad para recargar datos
    refetch: fetchMediaData
  };
};

export default useMedia;
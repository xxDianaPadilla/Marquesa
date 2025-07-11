// frontend/src/pages/ReviewsManager.jsx
import React, { useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import ReviewsHeader from "../components/Reviews/ReviewsHeader";
import ReviewsFilters from "../components/Reviews/ReviewsFilters";
import ReviewsContent from "../components/Reviews/ReviewsContent";
import ReviewsPagination from "../components/Reviews/ReviewsPagination";
import { useReviews } from "../components/Reviews/Hooks/useReviews";

const ReviewsManager = () => {
  // Usar el hook useReviews actualizado
  const { 
    reviews, 
    loading: reviewsLoading, 
    error: reviewsError, 
    moderateReview, 
    deleteReview,
    replyToReview, 
    updateReview, 
    getReviewStats,
    filterReviews,
    sortReviews,
    getUniqueProducts
  } = useReviews();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: 'todos',
    status: 'todos',
    product: 'todos',
    dateFrom: '',
    dateTo: '',
    verified: false,
    hasImages: false
  });

  // Obtener productos únicos para el filtro
  const availableProducts = useMemo(() => {
    return getUniqueProducts();
  }, [reviews]);

  // Obtener reseñas filtradas y ordenadas usando el hook
  const filteredAndSortedReviews = useMemo(() => {
    // Combinar filtros de búsqueda con otros filtros
    const allFilters = {
      ...filters,
      searchTerm: searchTerm.trim()
    };

    // Aplicar filtros
    const filtered = filterReviews(allFilters);
    
    // Aplicar ordenamiento
    const sorted = sortReviews(filtered, sortBy, sortOrder);
    
    return sorted;
  }, [reviews, filters, searchTerm, sortBy, sortOrder, filterReviews, sortReviews]);

  // Obtener estadísticas actualizadas
  const stats = useMemo(() => {
    return getReviewStats();
  }, [reviews, getReviewStats]);

  // Paginación
  const totalItems = filteredAndSortedReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredAndSortedReviews.slice(startIndex, endIndex);

  const paginationInfo = {
    startItem: totalItems > 0 ? startIndex + 1 : 0,
    endItem: Math.min(endIndex, totalItems),
    totalItems,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };

  // Handlers de eventos
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('fecha');
    setSortOrder('desc');
    setFilters({
      rating: 'todos',
      status: 'todos',
      product: 'todos',
      dateFrom: '',
      dateTo: '',
      verified: false,
      hasImages: false
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (paginationInfo.hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  };

  const getPageNumbers = (maxVisible = 5) => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Funciones para responder y moderar reseñas
  const handleReplyReview = async (reviewId, reply) => {
    try {
      console.log('=== ReviewsManager: Respondiendo reseña ===');
      console.log('Review ID:', reviewId);
      console.log('Reply:', reply);
      
      await replyToReview(reviewId, reply);
      console.log('Respuesta enviada exitosamente');
      
      // Mostrar notificación de éxito (opcional)
      showNotification('Respuesta enviada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al responder reseña:', error);
      showNotification('Error al enviar la respuesta: ' + error.message, 'error');
    }
  };

  const handleModerateReview = async (reviewId, action) => {
    try {
      console.log('=== ReviewsManager: Moderando reseña ===');
      console.log('Review ID:', reviewId);
      console.log('Action:', action);
      
      await moderateReview(reviewId, action);
      console.log('Reseña moderada exitosamente');
      
      const actionText = action === 'approve' ? 'aprobada' : 'rechazada';
      showNotification(`Reseña ${actionText} exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error al moderar reseña:', error);
      showNotification('Error al moderar la reseña: ' + error.message, 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      console.log('=== ReviewsManager: Eliminando reseña ===');
      console.log('Review ID:', reviewId);
      
      await deleteReview(reviewId);
      console.log('Reseña eliminada exitosamente');
      
      showNotification('Reseña eliminada exitosamente', 'success');
      
      // Si estamos en la última página y se elimina el último elemento, volver a la página anterior
      if (currentReviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      showNotification('Error al eliminar la reseña: ' + error.message, 'error');
    }
  };

  // Función para mostrar notificaciones (simplificada, podrías usar react-toast o similar)
  const showNotification = (message, type) => {
    // Por ahora solo console.log, pero podrías implementar un sistema de notificaciones real
    console.log(`[${type.toUpperCase()}]: ${message}`);
    
    // Implementación básica con alert (reemplazar por un sistema de toast mejor)
    if (type === 'error') {
      alert(`Error: ${message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header con búsqueda y estadísticas */}
        <ReviewsHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          stats={stats}
          loading={reviewsLoading}
          error={reviewsError}
        />

        {/* Panel de filtros avanzados */}
        <ReviewsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isVisible={showFilters}
          onToggleVisibility={() => setShowFilters(!showFilters)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          availableProducts={availableProducts}
        />

        {/* Contenido principal con reseñas */}
        <ReviewsContent
          reviews={currentReviews}
          loading={reviewsLoading}
          error={reviewsError}
          totalItems={totalItems}
          onReply={handleReplyReview}
          onModerate={handleModerateReview}
          onDelete={handleDeleteReview}
          onReviewUpdate={updateReview}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <ReviewsPagination
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            getPageNumbers={getPageNumbers}
          />
        )}

        {/* Información adicional si no hay reseñas */}
        {!reviewsLoading && !reviewsError && totalItems === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {searchTerm || Object.values(filters).some(f => f && f !== 'todos' && f !== false)
                ? 'No se encontraron reseñas'
                : 'Aún no hay reseñas'
              }
            </h3>
            <p className="text-gray-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {searchTerm || Object.values(filters).some(f => f && f !== 'todos' && f !== false)
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
                : 'Las reseñas de tus clientes aparecerán aquí cuando las recibas.'
              }
            </p>
            {(searchTerm || Object.values(filters).some(f => f && f !== 'todos' && f !== false)) && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF7260] hover:bg-[#FF6250] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7260]"
                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsManager;
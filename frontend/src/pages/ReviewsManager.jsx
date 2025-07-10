import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ReviewsHeader from "../components/Reviews/ReviewsHeader";
import ReviewsFilters from "../components/Reviews/ReviewsFilters";
import ReviewsContent from "../components/Reviews/ReviewsContent";
import ReviewsPagination from "../components/Reviews/ReviewsPagination";
import { useReviews } from "../components/Reviews/Hooks/useReviews";
import { useReviewStats } from "../components/Reviews/Hooks/useReviewStats";

const ReviewsManager = () => {
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews();
  const { stats, loading: statsLoading, error: statsError } = useReviewStats();

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('todos');
  const [selectedProduct, setSelectedProduct] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('desc');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    verified: false,
    hasImages: false,
    sortBy: 'fecha',
    sortOrder: 'desc'
  });

  // Función para filtrar y ordenar reseñas
  const getFilteredReviews = () => {
    if (!reviews || reviews.length === 0) return [];

    let filtered = [...reviews];

    if (searchTerm.trim()) {
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRating !== 'todos') {
      filtered = filtered.filter(review => review.rating === parseInt(selectedRating));
    }

    if (selectedProduct !== 'todos') {
      filtered = filtered.filter(review => review.productId === selectedProduct);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(review => new Date(review.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(review => new Date(review.createdAt) <= new Date(filters.dateTo));
    }

    if (filters.verified) {
      filtered = filtered.filter(review => review.verified === true);
    }

    if (filters.hasImages) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'fecha':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'calificacion':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'producto':
          aValue = a.productName?.toLowerCase() || '';
          bValue = b.productName?.toLowerCase() || '';
          break;
        case 'cliente':
          aValue = a.customerName?.toLowerCase() || '';
          bValue = b.customerName?.toLowerCase() || '';
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  // Paginación
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  const paginationInfo = {
    startItem: totalItems > 0 ? startIndex + 1 : 0,
    endItem: Math.min(endIndex, totalItems),
    totalItems,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };

  // Handlers de eventos (búsqueda, filtros, paginación)
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setCurrentPage(1);
  };

  const handleProductChange = (product) => {
    setSelectedProduct(product);
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
    setSelectedRating('todos');
    setSelectedProduct('todos');
    setSortBy('fecha');
    setSortOrder('desc');
    setFilters({
      dateFrom: '',
      dateTo: '',
      verified: false,
      hasImages: false,
      sortBy: 'fecha',
      sortOrder: 'desc'
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

  // Funciones para responder y moderar reseñas (a implementar)
  const handleReplyReview = (reviewId, reply) => {
    console.log('Responder a reseña:', reviewId, reply);
  };

  const handleModerateReview = (reviewId, action) => {
    console.log('Moderar reseña:', reviewId, action);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <ReviewsHeader
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedRating={selectedRating}
          onRatingChange={handleRatingChange}
          selectedProduct={selectedProduct}
          onProductChange={handleProductChange}
          stats={stats}
          loading={statsLoading}
          error={statsError}
        />

        <ReviewsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isVisible={showFilters}
          onToggleVisibility={() => setShowFilters(!showFilters)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        <ReviewsContent
          reviews={currentReviews}
          loading={reviewsLoading}
          error={reviewsError}
          totalItems={totalItems}
          onReply={handleReplyReview}
          onModerate={handleModerateReview}
        />

        {totalPages > 1 && (
          <ReviewsPagination
            paginationInfo={paginationInfo}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            getPageNumbers={getPageNumbers}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsManager;
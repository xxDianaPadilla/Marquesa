import React from 'react';
// Importación de componentes
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
// Importar el hook personalizado para manejar reseñas
import useReviewsUsers from '../Reviews/Hooks/useReviewsUsers';

// Componente principal que muestra las reseñas de un producto
// Incluye:
// 1. Encabezado con calificación promedio y cantidad de opiniones
// 2. Formulario para que el usuario agregue una nueva reseña
// 3. Lista de comentarios existentes de otros usuarios
const ProductReviews = ({ productId, user, isAuthenticated }) => {
  // Usar el hook personalizado para manejar reseñas
  const { reviews, loading, submitting, submitReview } = useReviewsUsers(productId);
  
  // Debug: verificar qué datos está recibiendo el componente
  console.log('ProductReviews - reviews state:', reviews);
  console.log('ProductReviews - loading:', loading);

  // Función para manejar el envío de nuevas reseñas
  const handleReviewSubmit = async (reviewData) => {
    return await submitReview(reviewData);
  };

  // Función para renderizar las estrellas del promedio
  const renderAverageStars = (average) => {
    const fullStars = Math.floor(average);
    const hasHalfStar = average % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {/* Estrellas llenas */}
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
        ))}
        
        {/* Media estrella si es necesario */}
        {hasHalfStar && (
          <span className="text-yellow-400 text-lg">☆</span>
        )}
        
        {/* Estrellas vacías */}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      {/* Encabezado con resumen de reseñas */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Opiniones de clientes</h3>
        
        {loading ? (
          // Skeleton para el encabezado mientras carga
          <div className="flex items-center mt-1 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-8 mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24 mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        ) : (
          <div className="flex items-center mt-1 text-gray-600 text-sm">
            {/* Estrellas del promedio */}
            {renderAverageStars(reviews.average)}
            
            {/* Calificación numérica */}
            <span className="font-medium text-gray-800 ml-2">
              {reviews.average > 0 ? reviews.average.toFixed(1) : '0.0'}
            </span>
            
            {/* Cantidad de opiniones */}
            <span className="ml-2">
              Basado en {reviews.count} {reviews.count === 1 ? 'opinión' : 'opiniones'}
            </span>
          </div>
        )}
      </div>

      {/* Formulario para dejar una nueva opinión */}
      <ReviewForm 
        productId={productId}
        user={user}
        isAuthenticated={isAuthenticated}
        onReviewSubmit={handleReviewSubmit}
        submitting={submitting}
      />

      {/* Lista de comentarios existentes */}
      <ReviewList 
        reviews={reviews.comments} 
        loading={loading}
      />
    </div>
  );
};

export default ProductReviews;
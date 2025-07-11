import React from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

// Componente para mostrar las reseñas de un producto
// Incluye un formulario para dejar una reseña y una lista de reseñas existentes
const ProductReviews = ({ reviews }) => (
  <div className="mt-12">
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900">Opiniones de clientes</h3>
      <div className="flex items-center mt-1 text-gray-600 text-sm">
        <span className="text-yellow-400 mr-1 text-lg">★</span>
        <span className="font-medium text-gray-800">{reviews.average}</span>
        <span className="ml-2">Basado en {reviews.count} opiniones</span>
      </div>
    </div>
    <ReviewForm />
    <ReviewList reviews={reviews.comments} />
  </div>
);

export default ProductReviews;

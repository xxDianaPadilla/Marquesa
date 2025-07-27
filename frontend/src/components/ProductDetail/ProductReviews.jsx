import React from 'react';
//Importación de componentes 
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

// Componente principal que muestra las reseñas de un producto
// Incluye:
// 1. Encabezado con calificación promedio y cantidad de opiniones
// 2. Formulario para que el usuario agregue una nueva reseña
// 3. Lista de comentarios existentes de otros usuarios
const ProductReviews = ({ reviews }) => (
  <div className="mt-12">
    {/* Encabezado con resumen de reseñas */}
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-900">Opiniones de clientes</h3>
      <div className="flex items-center mt-1 text-gray-600 text-sm">
        <span className="text-yellow-400 mr-1 text-lg">★</span>
        <span className="font-medium text-gray-800">{reviews.average}</span>
        <span className="ml-2">Basado en {reviews.count} opiniones</span>
      </div>
    </div>

    {/* Formulario para dejar una nueva opinión */}
    <ReviewForm />

    {/* Lista de comentarios existentes */}
    <ReviewList reviews={reviews.comments} />
  </div>
);

export default ProductReviews;

// frontend/src/components/ReviewList.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente ReviewList - Lista de opiniones y reseñas de clientes
 * 
 * Componente que muestra las reseñas de productos incluyendo:
 * - Promedio de calificaciones
 * - Número total de opiniones
 * - Lista detallada de comentarios individuales
 * - Sistema de estrellas visual
 * 
 * @param {Object} reviews - Objeto con la información de las reseñas
 * @param {number} reviews.average - Promedio de calificación (ej: 4.5)
 * @param {number} reviews.count - Número total de reseñas
 * @param {Array} reviews.comments - Array de comentarios individuales
 * @param {string} reviews.comments[].name - Nombre del revisor
 * @param {string} reviews.comments[].year - Año de la reseña
 * @param {string} reviews.comments[].comment - Texto del comentario
 */
const ReviewList = ({ reviews }) => {
  return (
    <div className="mt-6">
      {/* Título de la sección */}
      <h3 className="font-semibold text-lg text-gray-800">Opiniones de clientes</h3>
      
      {/* Resumen de calificaciones con estrellas y estadísticas */}
      <p className="text-yellow-500 text-sm">
        ⭐ {reviews.average} basado en {reviews.count} opiniones
      </p>
      
      {/* Lista de comentarios individuales */}
      <div className="space-y-4 mt-4">
        {reviews.comments.map((rev, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white">
            {/* Header del comentario con nombre y año */}
            <p className="font-semibold text-gray-800">
              {rev.name} 
              <span className="text-sm text-gray-400">({rev.year})</span>
            </p>
            
            {/* Calificación visual con estrellas (actualmente hardcodeada a 5 estrellas) */}
            <p className="text-yellow-500 text-sm mt-1">⭐⭐⭐⭐⭐</p>
            
            {/* Texto del comentario/reseña */}
            <p className="text-sm text-gray-600 mt-2">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
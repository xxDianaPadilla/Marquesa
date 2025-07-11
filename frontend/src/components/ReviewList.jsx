import React from 'react';

// Componente para mostrar la lista de opiniones de clientes
// Recibe un objeto reviews con las propiedades average, count y comments
const ReviewList = ({ reviews }) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg text-gray-800">Opiniones de clientes</h3>
      <p className="text-yellow-500 text-sm">
        ⭐ {reviews.average} basado en {reviews.count} opiniones
      </p>
      <div className="space-y-4 mt-4">
        {reviews.comments.map((rev, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 shadow-sm bg-white">
            <p className="font-semibold text-gray-800">{rev.name} <span className="text-sm text-gray-400">({rev.year})</span></p>
            <p className="text-yellow-500 text-sm mt-1">⭐⭐⭐⭐⭐</p>
            <p className="text-sm text-gray-600 mt-2">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

import React from 'react';
import perfilUsuario from '../../assets/perfilUsuario.png';
import { FaStar } from 'react-icons/fa';

// Componente para mostrar la lista de reseñas de productos
// Recibe un objeto reviews con las propiedades average, count y comments
const ReviewList = ({ reviews }) => (
  <div className="space-y-6">
    <h4 className="text-sm font-semibold text-gray-800 mb-1">{reviews.length} opiniones</h4>
    {reviews.map((rev, i) => (
      <div key={i} className="border-t border-gray-200 pt-6 flex gap-4">
        <img src={perfilUsuario} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-sm text-gray-800">{rev.name}</p>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} />)}
            </div>
            <span className="text-xs text-gray-400">Publicado en {rev.year}</span>
          </div>
          <p className="text-sm text-gray-700 mt-2">{rev.comment}</p>
        </div>
      </div>
    ))}
  </div>
);

export default ReviewList;

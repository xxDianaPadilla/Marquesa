import React, { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

// Componente para el formulario de reseñas
// Permite a los usuarios dejar una calificación y un comentario sobre un producto
const ReviewForm = () => {
  const [rating, setRating] = useState(0); // Estado para la calificación

  return (
    <div className="bg-gray-50 border border-gray-200 p-5 rounded-md mb-10">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">Deja tu opinión</h4>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Calificación</p>
        <div className="flex gap-1 text-yellow-400 text-xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className="cursor-pointer transition-transform duration-150 hover:scale-110"
            >
              {star <= rating ? <FaStar /> : <FaRegStar />}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Comentario</p>
        <textarea
          className="w-full bg-white rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-pink-200"
          rows={3}
          placeholder="Comparte tu opinión con este producto..."
        />
      </div>

      <button className="mt-1 bg-[#E8ACD2] text-white px-5 py-2 rounded-md text-sm hover:bg-pink-300 cursor-pointer transition-all cursor-pointer">
        Enviar opinión
      </button>
    </div>
  );
};

export default ReviewForm;

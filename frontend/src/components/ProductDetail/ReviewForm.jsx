import React from 'react';
import { FaRegStar } from 'react-icons/fa';

const ReviewForm = () => (
  <div className="bg-gray-50 border border-gray-200 p-5 rounded-md mb-10">
    <h4 className="text-sm font-semibold text-gray-800 mb-4">Deja tu opinión</h4>

    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-700 mb-1">Calificación</p>
      <div className="flex gap-1 text-yellow-400 text-xl cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaRegStar key={star} />
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

    <button className="mt-1 bg-[#E8ACD2] text-white px-5 py-2 rounded-md text-sm hover:bg-pink-300">
      Enviar opinión
    </button>
  </div>
);

export default ReviewForm;

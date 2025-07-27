import React from 'react';
import perfilUsuario from '../../assets/perfilUsuario.png';
import { FaStar } from 'react-icons/fa';

// Componente ReviewList: muestra una lista de reseñas de productos.
// Recibe un prop llamado "reviews" que es un array de objetos con las reseñas.
const ReviewList = ({ reviews }) => (
  <div className="space-y-6">
    {/* Muestra el número total de opiniones */}
    <h4 className="text-sm font-semibold text-gray-800 mb-1">{reviews.length} opiniones</h4>

    {/* Itera sobre cada reseña para renderizar su contenido */}
    {reviews.map((rev, i) => (
      <div key={i} className="border-t border-gray-200 pt-6 flex gap-4">
        {/* Imagen de perfil del usuario */}
        <img src={perfilUsuario} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />

        <div>
          {/* Nombre del usuario que hizo la reseña */}
          <p className="font-semibold text-sm text-gray-800">{rev.name}</p>

          <div className="flex items-center gap-3 mt-1 text-sm">
            {/* Renderiza 5 estrellas estáticas en color amarillo */}
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} />)}
            </div>

            {/* Año de publicación de la reseña */}
            <span className="text-xs text-gray-400">Publicado en {rev.year}</span>
          </div>

          {/* Comentario del usuario */}
          <p className="text-sm text-gray-700 mt-2">{rev.comment}</p>
        </div>
      </div>
    ))}
  </div>
);

export default ReviewList;

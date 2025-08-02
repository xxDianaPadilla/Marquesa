import React from 'react';
import perfilUsuario from '../../assets/perfilUsuario.png';
import { FaStar, FaRegStar } from 'react-icons/fa';

// Componente ReviewList: muestra una lista de reseñas de productos.
// Recibe un prop llamado "reviews" que es un array de objetos con las reseñas.
const ReviewList = ({ reviews, loading }) => {
  // Debug: verificar qué datos están llegando
  console.log('ReviewList recibió reviews:', reviews);
  
  // Función para renderizar las estrellas basadas en la calificación
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          {i <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return stars;
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-1">Cargando opiniones...</h4>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-t border-gray-200 pt-6 flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Muestra el número total de opiniones */}
      <h4 className="text-sm font-semibold text-gray-800 mb-1">
        {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'}
      </h4>

      {/* Si no hay reseñas, mostrar mensaje */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">Aún no hay opiniones para este producto.</p>
          <p className="text-xs text-gray-400 mt-1">¡Sé el primero en dejar tu reseña!</p>
        </div>
      ) : (
        /* Itera sobre cada reseña para renderizar su contenido */
        reviews.map((rev, i) => {
          console.log(`Review ${i}:`, rev);
          console.log(`Nombre: "${rev.name}"`);
          console.log(`ProfilePicture: "${rev.profilePicture}"`);
          
          return (
            <div key={i} className="border-t border-gray-200 pt-6 flex gap-4">
              {/* Imagen de perfil del usuario */}
              <img 
                src={rev.profilePicture || perfilUsuario} 
                alt="Usuario" 
                className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                onError={(e) => {
                  console.log('Error cargando imagen:', rev.profilePicture);
                  e.target.src = perfilUsuario; // Fallback si la imagen no carga
                }}
              />

              <div className="flex-1">
                {/* Nombre del usuario que hizo la reseña */}
                <p className="font-semibold text-sm text-gray-800">{rev.name}</p>

                <div className="flex items-center gap-3 mt-1 text-sm">
                  {/* Renderiza estrellas basadas en la calificación real */}
                  <div className="flex">
                    {renderStars(rev.rating)}
                  </div>

                  {/* Fecha de publicación de la reseña */}
                  <span className="text-xs text-gray-400">
                    {rev.date ? formatDate(rev.date) : `Publicado en ${rev.year}`}
                  </span>

                  {/* Mostrar calificación numérica */}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {rev.rating}/5
                  </span>
                </div>

                {/* Comentario del usuario */}
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Respuesta del negocio si existe */}
                {rev.response && (
                  <div className="mt-3 bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-800">
                        Respuesta del vendedor
                      </span>
                      <span className="text-xs text-blue-600">
                        {rev.status === 'replied' ? '✓' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-blue-900">{rev.response}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReviewList;
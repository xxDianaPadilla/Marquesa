import React, { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Componente para el formulario de reseñas
// Permite a los usuarios dejar una calificación y un comentario sobre un producto
const ReviewForm = ({ productId, user, isAuthenticated, onReviewSubmit, submitting }) => {
  const [rating, setRating] = useState(0); // Estado para la calificación seleccionada por el usuario
  const [comment, setComment] = useState(''); // Estado para el comentario del usuario
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== DEBUG USUARIO ===');
    console.log('user completo:', user);
    console.log('user.id:', user?.id);
    console.log('isAuthenticated:', isAuthenticated);

    // Validaciones
    if (!isAuthenticated || !user?.id) {
      toast.error('Debes iniciar sesión para dejar una reseña', {
        duration: 4000,
        position: 'top-center',
        icon: '🔐'
      });
      return;
    }

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación', {
        duration: 3000,
        position: 'top-center',
        icon: '⭐'
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres', {
        duration: 3000,
        position: 'top-center',
        icon: '📝'
      });
      return;
    }

    if (!productId) {
      toast.error('Error: ID del producto no válido', {
        duration: 3000,
        position: 'top-center',
        icon: '⚠️'
      });
      return;
    }

    try {
      setLocalSubmitting(true);

      // Preparar datos de la reseña
      const reviewData = {
        clientId: user.id,
        products: [
          {
            itemType: "product",
            itemId: productId,
            itemTypeRef: "products"
          }
        ],
        rating: rating,
        message: comment.trim()
      };

      console.log('=== DATOS DE RESEÑA A ENVIAR ===');
      console.log('reviewData:', reviewData);
      console.log('clientId enviado:', reviewData.clientId);
      console.log('Tipo de clientId:', typeof reviewData.clientId);

      // Llamar a la función del componente padre para enviar la reseña
      const result = await onReviewSubmit(reviewData);

      if (result && result.success) {
        // Limpiar el formulario
        setRating(0);
        setComment('');
      }

    } catch (error) {
      console.error('Error al enviar reseña:', error);
      toast.error('Error inesperado al enviar la reseña', {
        duration: 4000,
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setLocalSubmitting(false);
    }
  };

  const isSubmittingState = submitting || localSubmitting;

  return (
    <div className="bg-gray-50 border border-gray-200 p-5 rounded-md mb-10">
      {/* Título del formulario */}
      <h4 className="text-sm font-semibold text-gray-800 mb-4">Deja tu opinión</h4>

      {/* Mensaje informativo si no está autenticado */}
      {!isAuthenticated && (
        <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200 mb-4">
          📝 Inicia sesión para dejar tu reseña sobre este producto
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Sección para seleccionar la calificación */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Calificación *</p>

          {/* Renderiza 5 estrellas interactivas */}
          <div className="flex gap-1 text-yellow-400 text-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => !isSubmittingState && setRating(star)} // Al hacer clic, se actualiza la calificación
                className={`transition-transform duration-150 hover:scale-110 ${isSubmittingState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
              >
                {/* Muestra estrella llena si está seleccionada, si no, una vacía */}
                {star <= rating ? <FaStar /> : <FaRegStar />}
              </span>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {rating === 1 ? 'Muy malo' :
                rating === 2 ? 'Malo' :
                  rating === 3 ? 'Regular' :
                    rating === 4 ? 'Bueno' : 'Excelente'}
            </p>
          )}
        </div>

        {/* Área de texto para dejar un comentario */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Comentario *
            <span className="text-xs text-gray-500 font-normal">
              (mínimo 10 caracteres)
            </span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmittingState || !isAuthenticated}
            className="w-full bg-white rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            placeholder={isAuthenticated ? "Comparte tu opinión sobre este producto..." : "Inicia sesión para dejar tu comentario"}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {comment.length}/500 caracteres
            </span>
            {comment.length > 0 && comment.length < 10 && (
              <span className="text-xs text-red-500">
                Faltan {10 - comment.length} caracteres
              </span>
            )}
          </div>
        </div>

        {/* Botón para enviar la opinión */}
        <button
          type="submit"
          disabled={isSubmittingState || !isAuthenticated || rating === 0 || comment.trim().length < 10}
          className="mt-1 bg-[#E8ACD2] text-white px-5 py-2 rounded-md text-sm hover:bg-pink-300 
                     transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:transform-none"
        >
          {isSubmittingState ? 'Enviando...' : 'Enviar opinión'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
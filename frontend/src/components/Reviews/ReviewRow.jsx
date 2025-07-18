// frontend/src/components/Reviews/Components/ReviewRow.jsx
import React, { useState } from 'react';

/**
 * Componente ReviewRow - Fila de reseña para vista de tabla (desktop)
 * 
 * Renderiza una fila de la tabla de reseñas con toda la información necesaria:
 * cliente, producto, calificación, comentario, estado, fecha y acciones.
 * Optimizado para pantallas grandes con layout de tabla.
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.review - Objeto con los datos de la reseña
 * @param {Function} props.onReply - Función callback para responder a la reseña
 * @param {Function} props.onModerate - Función callback para moderar la reseña
 * @param {Function} props.onDelete - Función callback para eliminar la reseña
 * @param {Set} props.expandedReviews - Set con IDs de reseñas expandidas
 * @param {Function} props.onToggleExpand - Función para expandir/contraer reseñas
 */
const ReviewRow = ({ 
    review, 
    onReply, 
    onModerate, 
    onDelete, 
    expandedReviews, 
    onToggleExpand 
}) => {
    /**
     * Formatea una fecha para mostrarla en formato legible
     * Convierte timestamp a formato local español con hora
     * 
     * @param {string} dateString - String con la fecha en formato ISO
     * @returns {string} Fecha formateada en español
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Renderiza las estrellas de calificación
     * Crea íconos de estrella llenos o vacíos según la calificación
     * 
     * @param {number} rating - Calificación de 1 a 5 estrellas
     * @returns {Array} Array de elementos JSX con las estrellas
     */
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            );
        }
        return stars;
    };

    /**
     * Genera el badge de estado de la reseña
     * Determina el color, texto e ícono según el estado
     * 
     * @param {string} status - Estado de la reseña
     * @param {boolean} hasResponse - Si la reseña tiene respuesta
     * @returns {JSX.Element} Badge con el estado de la reseña
     */
    const getStatusBadge = (status, hasResponse) => {
        // Si tiene respuesta pero el estado no es 'replied', cambiar estado
        if (hasResponse && status !== 'replied') {
            status = 'replied';
        }

        // Configuración de estilos para cada estado
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pendiente', icon: '⏳' },
            'approved': { color: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobada', icon: '✅' },
            'rejected': { color: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazada', icon: '❌' },
            'replied': { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Respondida', icon: '💬' }
        };

        const config = statusConfig[status] || statusConfig['pending'];

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1 ${config.color}`}>
                <span>{config.icon}</span>
                <span>{config.text}</span>
            </span>
        );
    };

    /**
     * Verifica si la reseña tiene respuesta
     * Comprueba que existe el campo response y no está vacío
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {boolean} True si tiene respuesta, false si no
     */
    const isReviewReplied = (review) => {
        return review.response && review.response.trim() !== '';
    };

    /**
     * Obtiene información del producto asociado a la reseña
     * Maneja productos estándar y personalizados
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {Object} Objeto con name e image del producto
     */
    const getProductInfo = (review) => {
        if (!review.products || review.products.length === 0) {
            return { name: 'Sin producto', image: null };
        }

        const firstProduct = review.products[0];

        if (firstProduct.itemType === 'custom') {
            return {
                name: 'Producto personalizado',
                image: firstProduct.itemId?.referenceImage || null
            };
        } else {
            return {
                name: firstProduct.itemId?.name || 'Producto',
                image: firstProduct.itemId?.images?.[0]?.image || null
            };
        }
    };

    /**
     * Obtiene información del cliente que dejó la reseña
     * Extrae nombre y foto de perfil con valores por defecto
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {Object} Objeto con name y profilePicture del cliente
     */
    const getClientInfo = (review) => {
        return {
            name: review.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review.clientId?.profilePicture || null
        };
    };

    /**
     * Trunca el texto para mostrar vista previa
     * Limita la longitud del texto y añade "..." si es necesario
     * 
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima (default: 100)
     * @returns {string} Texto truncado con "..." si excede la longitud
     */
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Extraer información necesaria para el renderizado
    const productInfo = getProductInfo(review);
    const clientInfo = getClientInfo(review);
    const isReplied = isReviewReplied(review);
    const isExpanded = expandedReviews.has(review._id);
    const messageToShow = isExpanded ? review.message : truncateText(review.message, 80);

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            
            {/* Columna: Cliente */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    {/* Avatar del cliente */}
                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                        {clientInfo.profilePicture ? (
                            <img
                                src={clientInfo.profilePicture}
                                alt="Cliente"
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        {/* Avatar por defecto con inicial */}
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                            <span className="text-sm font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                    <div>
                        {/* Nombre del cliente con badges */}
                        <div className="text-sm font-medium text-gray-900 flex items-center mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {clientInfo.name}
                            {/* Badge de verificado */}
                            {review.verified && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Verificado
                                </span>
                            )}
                            {/* Badge de respondida */}
                            {isReplied && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    💬 Respondida
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {/* Columna: Producto */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 h-12 w-12 mr-3">
                        {productInfo.image ? (
                            <img
                                src={productInfo.image}
                                alt="Producto"
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        {/* Ícono por defecto para producto sin imagen */}
                        <div className={`h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 ${productInfo.image ? 'hidden' : ''}`}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        {/* Nombre y tipo del producto */}
                        <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {productInfo.name}
                        </div>
                        <div className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {review.products?.[0]?.itemType === 'custom' ? 'Personalizado' : 'Producto estándar'}
                        </div>
                    </div>
                </div>
            </td>

            {/* Columna: Calificación */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {review.rating}/5
                    </span>
                </div>
            </td>

            {/* Columna: Comentario */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {/* Mensaje principal */}
                    <p className={`${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {messageToShow}
                    </p>
                    
                    {/* Botón para expandir/contraer texto largo */}
                    {review.message && review.message.length > 80 && (
                        <button
                            onClick={() => onToggleExpand(review._id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            style={{ cursor: 'pointer' }}
                        >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                    )}
                    
                    {/* Mostrar respuesta si existe */}
                    {review.response && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                            <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                <span>💬</span>
                                Tu respuesta:
                            </p>
                            <p className="text-xs text-blue-600 mt-1">{review.response}</p>
                        </div>
                    )}

                    {/* Galería de imágenes en miniatura */}
                    {review.images && review.images.length > 0 && (
                        <div className="mt-2 flex gap-1">
                            {/* Mostrar máximo 3 imágenes */}
                            {review.images.slice(0, 3).map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Imagen ${index + 1}`}
                                    className="h-8 w-8 object-cover rounded border"
                                />
                            ))}
                            {/* Indicador de imágenes adicionales */}
                            {review.images.length > 3 && (
                                <div className="h-8 w-8 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-xs text-gray-600">
                                        +{review.images.length - 3}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </td>

            {/* Columna: Estado */}
            <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(review.status || 'pending', isReplied)}
            </td>

            {/* Columna: Fecha */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="flex flex-col">
                    {/* Fecha de creación */}
                    <span>{formatDate(review.createdAt)}</span>
                    {/* Fecha de respuesta si existe */}
                    {review.responseDate && (
                        <span className="text-xs text-blue-600">
                            Resp: {formatDate(review.responseDate)}
                        </span>
                    )}
                </div>
            </td>

            {/* Columna: Acciones */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-1">
                    {/* Botón de responder - Cambia color si ya está respondida */}
                    <button
                        onClick={() => onReply(review)}
                        className={`transition-colors p-2 rounded-full ${isReplied
                            ? 'text-blue-800 hover:text-blue-900 hover:bg-blue-200'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                            }`}
                        title={isReplied ? 'Editar respuesta' : 'Responder'}
                        style={{ cursor: 'pointer' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>

                    {/* Botón de eliminar */}
                    <button
                        onClick={() => onDelete(review)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                        title="Eliminar reseña"
                        style={{ cursor: 'pointer' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ReviewRow;
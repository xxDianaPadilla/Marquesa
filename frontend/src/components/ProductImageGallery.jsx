// frontend/src/components/ProductImageGallery.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente ProductImageGallery - Galería de imágenes interactiva para productos
 * 
 * Componente que muestra una imagen principal grande y una fila de miniaturas
 * clickeables para navegar entre diferentes vistas del producto. Incluye
 * estados visuales para la imagen seleccionada.
 * 
 * @param {Array} images - Array de URLs de las imágenes del producto
 * @param {string} selectedImage - URL de la imagen actualmente seleccionada/mostrada
 * @param {function} onSelect - Función callback que se ejecuta cuando se selecciona una imagen
 */
const ProductImageGallery = ({ images, selectedImage, onSelect }) => {
  return (
    <div>
      {/* Imagen principal del producto */}
      <img
        src={selectedImage}
        alt="Producto principal"
        className="w-full rounded-xl shadow-md border"
      />
      
      {/* Contenedor de miniaturas navegables */}
      <div className="flex gap-3 mt-3">
        {/* Mapeo de todas las imágenes disponibles para crear miniaturas */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Vista ${index + 1}`} // Alt text descriptivo con número de vista
            onClick={() => onSelect(img)} // Ejecuta callback con la imagen seleccionada
            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition duration-200 hover:border-pink-500 ${
              selectedImage === img ? 'border-pink-400' : 'border-gray-300'
            }`}
            style={{ cursor: 'pointer' }} // Cursor pointer para indicar interactividad
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
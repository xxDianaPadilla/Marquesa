import React from 'react';

/**
 * Componente ProductImageGallery - Galería de imágenes del producto
 * Muestra una imagen principal y miniaturas para navegación
 * @param {Array} images - Array de URLs de las imágenes del producto
 * @param {string} selectedImage - URL de la imagen actualmente seleccionada
 * @param {function} onSelect - Callback que se ejecuta cuando se selecciona una imagen
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
      
      {/* Contenedor de miniaturas */}
      <div className="flex gap-3 mt-3">
        {/* Mapeo de todas las imágenes disponibles */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Vista ${index}`}
            onClick={() => onSelect(img)}
            className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition duration-200 hover:border-pink-500 ${
              selectedImage === img ? 'border-pink-400' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
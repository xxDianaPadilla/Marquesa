import React from 'react';

const ProductImageGallery = ({ images, selectedImage, onSelect }) => {
  return (
    <div>
      <img
        src={selectedImage}
        alt="Producto principal"
        className="w-full rounded-xl shadow-md border"
      />
      <div className="flex gap-3 mt-3">
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

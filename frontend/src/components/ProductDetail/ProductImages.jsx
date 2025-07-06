import React from 'react';

const ProductImages = ({ sampleImages, selectedImage, setSelectedImage }) => (
  <div>
    <img src={selectedImage} alt="Producto" className="rounded-md w-full" />
    <div className="flex gap-13 mt-4 justify-center items-center">
      {sampleImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Miniatura ${i}`}
          onClick={() => setSelectedImage(img)}
          className="object-contain rounded-md cursor-pointer"
          style={{ width: '110px', height: '110px' }}
        />
      ))}
    </div>
  </div>
);

export default ProductImages;

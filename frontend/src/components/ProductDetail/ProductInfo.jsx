import React from 'react';
import carrito from '../../assets/carritoP.png';
import guardar from '../../assets/guardarP.png';
import editar from '../../assets/editarP.png';

const ProductInfo = ({ product, quantity, setQuantity, handleCustomProductClick }) => (
  <div className="space-y-4">
    <span className="inline-block bg-[#F7E8F2] text-[#CD5277] text-xs font-medium italic px-2 py-1 rounded">
      {product.category}
    </span>
    <h1 className="text-2xl font-bold">{product.name}</h1>
    <p className="text-lg font-semibold">{product.price}</p>
    <p className="text-sm text-gray-700">
      Hermoso ramo de rosas frescas en tonos amarillos y blancos, perfecto para regalar en ocasiones especiales.
    </p>

    <div>
      <label className="text-sm font-medium text-gray-700">Cantidad</label>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm w-fit mt-1">
        <button
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100  cursor-pointer"
        >
          -
        </button>
        <span className="px-3 py-1 bg-white border-x border-gray-300">{quantity}</span>
        <button
          onClick={() => setQuantity(q => q + 1)}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100  cursor-pointer"
        >
          +
        </button>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        className="bg-[#E8ACD2] hover:bg-pink-300 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2
                   transition-transform duration-200 ease-in-out hover:scale-105  cursor-pointer"
      >
        <img src={carrito} alt="Carrito" className="w-5 h-5" />
        Añadir al carrito
      </button>
      <button
        className="border border-[#c1c1c1] hover:bg-pink-200 text-[#000000] px-4 py-2 rounded-md text-sm flex items-center gap-2
                   transition-transform duration-200 ease-in-out hover:scale-105  cursor-pointer"
      >
        <img src={guardar} alt="Guardar" className="w-5 h-5" />
        Añadir a favoritos
      </button>
      <button
        className="bg-[#BEF7FF] hover:bg-cyan-200 text-black px-4 py-2 rounded-md text-sm flex items-center gap-2
                   transition-transform duration-200 ease-in-out hover:scale-105  cursor-pointer"
        onClick={handleCustomProductClick}
      >
        <img src={editar} alt="Editar" className="w-5 h-5" />
        Personalizar
      </button>
    </div>
  </div>
);

export default ProductInfo;

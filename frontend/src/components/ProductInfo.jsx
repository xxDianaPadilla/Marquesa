import React from 'react';
import { Button } from './ButtonRosa';

const ProductInfo = ({ product }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-pink-400 font-medium">Arreglos con flores naturales</p>
      <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
      <p className="text-xl font-semibold text-gray-700">{product.price}₡</p>
      <p className="text-sm text-gray-600">{product.description}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button>Añadir al carrito</Button>
        <Button variant="ghost">Añadir a favoritos</Button>
        <Button className="bg-blue-300 hover:bg-blue-400 text-white">Personalizar</Button>
      </div>
<div className="flex items-center gap-2 mt-2">
  <span className="text-sm">Cantidad:</span>
  <button className="px-2 py-1 border rounded">-</button>
  <span>1</span>
  <button className="px-2 py-1 border rounded">+</button>
</div>
    </div>
  );
};

export default ProductInfo;

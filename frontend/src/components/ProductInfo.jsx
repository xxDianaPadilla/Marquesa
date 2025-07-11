import React from 'react';
import { Button } from './ButtonRosa';

/**
 * Componente ProductInfo - Información detallada del producto
 * Muestra nombre, precio, descripción y acciones disponibles para el producto
 * @param {Object} product - Objeto con los datos del producto
 * @param {string} product.name - Nombre del producto
 * @param {string} product.price - Precio del producto
 * @param {string} product.description - Descripción del producto
 */
const ProductInfo = ({ product }) => {
  return (
    <div className="space-y-3">
      {/* Categoría del producto */}
      <p className="text-sm text-pink-400 font-medium">Arreglos con flores naturales</p>
      
      {/* Título/nombre del producto */}
      <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
      
      {/* Precio del producto */}
      <p className="text-xl font-semibold text-gray-700">{product.price}₡</p>
      
      {/* Descripción del producto */}
      <p className="text-sm text-gray-600">{product.description}</p>

      {/* Sección de botones de acción */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Botón para añadir al carrito */}
        <Button>Añadir al carrito</Button>
        
        {/* Botón para añadir a favoritos (variante ghost) */}
        <Button variant="ghost">Añadir a favoritos</Button>
        
        {/* Botón para personalizar producto */}
        <Button className="bg-blue-300 hover:bg-blue-400 text-white">Personalizar</Button>
      </div>

      {/* Selector de cantidad */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm">Cantidad:</span>
        
        {/* Botón para decrementar cantidad */}
        <button className="px-2 py-1 border rounded">-</button>
        
        {/* Cantidad actual (hardcodeada) */}
        <span>1</span>
        
        {/* Botón para incrementar cantidad */}
        <button className="px-2 py-1 border rounded">+</button>
      </div>
    </div>
  );
};

export default ProductInfo;
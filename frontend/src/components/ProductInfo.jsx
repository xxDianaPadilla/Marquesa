// frontend/src/components/ProductInfo.jsx

// Importa React y el componente Button desde ButtonRosa
import React from 'react';
import { Button } from './ButtonRosa';

/**
 * Componente ProductInfo - Panel de información detallada del producto
 * 
 * Componente que muestra toda la información relevante del producto incluyendo
 * nombre, precio, descripción, categoría y acciones disponibles como añadir
 * al carrito, favoritos y personalización.
 * 
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
      
      {/* Precio del producto con símbolo de moneda */}
      <p className="text-xl font-semibold text-gray-700">{product.price}₡</p>
      
      {/* Descripción detallada del producto */}
      <p className="text-sm text-gray-600">{product.description}</p>

      {/* Sección de botones de acción */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Botón principal para añadir al carrito */}
        <Button>Añadir al carrito</Button>
        
        {/* Botón secundario para añadir a favoritos (variante ghost) */}
        <Button variant="ghost">Añadir a favoritos</Button>
        
        {/* Botón de personalización con estilo custom */}
        <Button className="bg-blue-300 hover:bg-blue-400 text-white">Personalizar</Button>
      </div>

      {/* Selector de cantidad del producto */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm">Cantidad:</span>
        
        {/* Botón para decrementar cantidad */}
        <button className="px-2 py-1 border rounded">-</button>
        
        {/* Cantidad actual (hardcodeada a 1) */}
        <span>1</span>
        
        {/* Botón para incrementar cantidad */}
        <button className="px-2 py-1 border rounded">+</button>
      </div>
    </div>
  );
};

export default ProductInfo;
// frontend/src/components/ProductInfo.jsx
// Importa React, useState y el componente Button desde ButtonRosa
import React, { useState } from 'react';
import { Button } from './ButtonRosa';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

/**
 * Componente ProductInfo - Panel de información detallada del producto
 * 
 * Componente que muestra toda la información relevante del producto incluyendo
 * nombre, precio, descripción, categoría y acciones disponibles como añadir
 * al carrito, favoritos y personalización.
 * 
 * @param {Object} product - Objeto con los datos del producto
 * @param {string} product.id - ID único del producto
 * @param {string} product.name - Nombre del producto
 * @param {string} product.price - Precio del producto
 * @param {string} product.description - Descripción del producto
 */
const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  
  // Verificar si el producto está en favoritos
  const productIsFavorite = product?.id ? isFavorite(product.id) : false;

  // Función para manejar la adición/eliminación de favoritos
  const handleToggleFavorite = () => {
    if (!product?.id) {
      console.error('Producto sin ID válido');
      return;
    }

    // Si no está autenticado, podrías mostrar un modal de login
    // o permitir favoritos como invitado según tu lógica de negocio
    if (!isAuthenticated) {
      // Aquí podrías mostrar un toast o modal pidiendo login
      console.log('Usuario no autenticado. Guardando como invitado...');
    }

    const wasAdded = toggleFavorite(product);
    
    // Feedback opcional
    if (wasAdded) {
      console.log('Producto añadido a favoritos');
      // Aquí podrías mostrar un toast de éxito
    } else {
      console.log('Producto removido de favoritos');
      // Aquí podrías mostrar un toast de confirmación
    }
  };

  // Función para incrementar cantidad
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Función para decrementar cantidad
  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Función para añadir al carrito
  const addToCart = () => {
    if (!product?.id) {
      console.error('Producto sin ID válido');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      quantity: quantity,
      dateAdded: new Date().toISOString()
    };

    // Aquí puedes implementar la lógica para añadir al carrito
    console.log('Añadido al carrito:', cartItem);
    
    // Si tienes un contexto de carrito similar, úsalo aquí
    // Por ejemplo: addToCart(cartItem);
    
    // Ejemplo de como podrías guardarlo en localStorage también
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Reset quantity después de añadir al carrito
      setQuantity(1);
      
      // Aquí podrías mostrar un toast de éxito
      console.log('Producto añadido al carrito exitosamente');
      
    } catch (error) {
      console.error('Error al guardar en carrito:', error);
    }
  };

  // Función para personalizar producto
  const handlePersonalize = () => {
    // Aquí podrías navegar a una página de personalización
    // o abrir un modal de personalización
    console.log('Abrir personalización para producto:', product?.id);
  };

  return (
    <div className="space-y-3">
      {/* Categoría del producto */}
      <p className="text-sm text-pink-400 font-medium">Arreglos con flores naturales</p>
      
      {/* Título/nombre del producto */}
      <h1 className="text-2xl font-bold text-gray-800">{product?.name || 'Producto sin nombre'}</h1>
      
      {/* Precio del producto con símbolo de moneda */}
      <p className="text-xl font-semibold text-gray-700">{product?.price || '0'}₡</p>
      
      {/* Descripción detallada del producto */}
      <p className="text-sm text-gray-600">{product?.description || 'Sin descripción disponible'}</p>

      {/* Sección de botones de acción */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Botón principal para añadir al carrito */}
        <Button onClick={addToCart}>
          Añadir al carrito ({quantity})
        </Button>
        
        {/* Botón para añadir/quitar de favoritos con estado dinámico */}
        <Button 
          variant="ghost" 
          onClick={handleToggleFavorite}
          className={productIsFavorite ? 'bg-pink-100 text-pink-600 border-pink-300 hover:bg-pink-200' : 'hover:bg-gray-100'}
        >
          {productIsFavorite ? (
            <>
              <span className="mr-1">❤️</span>
              En favoritos
            </>
          ) : (
            <>
              <span className="mr-1">🤍</span>
              Añadir a favoritos
            </>
          )}
        </Button>
        
        {/* Botón de personalización con estilo custom */}
        <Button 
          className="bg-blue-300 hover:bg-blue-400 text-white"
          onClick={handlePersonalize}
        >
          Personalizar
        </Button>
      </div>

      {/* Selector de cantidad del producto */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-700">Cantidad:</span>
        
        {/* Botón para decrementar cantidad */}
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        
        {/* Cantidad actual */}
        <span className="mx-2 min-w-[2rem] text-center font-medium">{quantity}</span>
        
        {/* Botón para incrementar cantidad */}
        <button 
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          onClick={incrementQuantity}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      {/* Información adicional del estado de favoritos (opcional) */}
      {!isAuthenticated && (
        <div className="text-xs text-gray-500 mt-2">
          💡 Inicia sesión para sincronizar tus favoritos en todos tus dispositivos
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
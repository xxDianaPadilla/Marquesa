// frontend/src/components/ProductInfo.jsx
// Importa React, useState y el componente Button desde ButtonRosa
import React, { useState, useCallback, useEffect } from 'react';
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
 * @param {string} product._id - ID alternativo del producto (MongoDB)
 * @param {string} product.name - Nombre del producto
 * @param {string} product.price - Precio del producto
 * @param {string} product.description - Descripción del producto
 * @param {string} product.category - Categoría del producto
 * @param {string|Array} product.image - Imagen(es) del producto
 * @param {number} product.stock - Stock disponible del producto
 */
const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isToggling, setIsToggling] = useState(false);
  const { toggleFavorite, isFavorite, getFavoriteProduct } = useFavorites();
  const { isAuthenticated } = useAuth();

  // Obtener ID del producto de manera segura (maneja tanto _id como id)
  const getProductId = useCallback((prod) => {
    if (!prod) return null;
    return prod._id || prod.id || null;
  }, []);

  // Validar que el producto tenga los datos mínimos necesarios
  const isValidProduct = useCallback((prod) => {
    const productId = getProductId(prod);
    return productId && prod.name;
  }, [getProductId]);

  // Obtener ID del producto actual
  const productId = getProductId(product);
  
  // Verificar si el producto está en favoritos
  const productIsFavorite = productId ? isFavorite(productId) : false;

  // Debug: Verificar datos del producto al montar/actualizar
  useEffect(() => {
    if (product) {
      console.log('ProductInfo - Product data:', {
        originalProduct: product,
        productId,
        isValid: isValidProduct(product),
        isFavorite: productIsFavorite
      });

      // Verificar si está en favoritos y cómo se ve
      if (productId && productIsFavorite) {
        const favoriteData = getFavoriteProduct(productId);
        console.log('Product in favorites:', favoriteData);
      }
    }
  }, [product, productId, isValidProduct, productIsFavorite, getFavoriteProduct]);

  // Función para manejar la adición/eliminación de favoritos
  const handleToggleFavorite = useCallback(async () => {
    // Validaciones previas
    if (!product) {
      console.error('No hay producto disponible');
      return;
    }

    if (!isValidProduct(product)) {
      console.error('Producto inválido:', {
        product,
        hasId: !!getProductId(product),
        hasName: !!product.name
      });
      return;
    }

    // Evitar clicks múltiples
    if (isToggling) {
      console.log('Toggle ya en progreso, ignorando...');
      return;
    }

    setIsToggling(true);

    try {
      // Si no está autenticado, podrías mostrar un modal de login
      // o permitir favoritos como invitado según tu lógica de negocio
      if (!isAuthenticated) {
        console.log('Usuario no autenticado. Guardando como invitado...');
      }

      console.log('Toggling favorite for product:', {
        id: productId,
        name: product.name,
        currentStatus: productIsFavorite,
        fullProduct: product
      });

      // Crear un objeto completo del producto para asegurar que se guarde toda la info
      const completeProduct = {
        // IDs
        id: productId,
        _id: productId,
        
        // Información básica
        name: product.name || 'Producto sin nombre',
        description: product.description || '',
        category: product.category || 'Sin categoría',
        
        // Precio
        price: product.price || 0,
        
        // Stock (si está disponible)
        ...(product.stock !== undefined && { stock: product.stock }),
        
        // Imágenes
        ...(product.image && { image: product.image }),
        ...(product.images && { images: product.images }),
        
        // Cualquier otro campo que pueda ser importante
        ...Object.keys(product).reduce((acc, key) => {
          if (!['id', '_id', 'name', 'description', 'category', 'price', 'stock', 'image', 'images'].includes(key)) {
            acc[key] = product[key];
          }
          return acc;
        }, {})
      };

      console.log('Complete product for favorites:', completeProduct);

      const wasAdded = toggleFavorite(completeProduct);
      
      // Feedback y logging
      if (wasAdded) {
        console.log('✅ Producto añadido a favoritos exitosamente');
        // Aquí podrías mostrar un toast de éxito
        // showToast('Producto añadido a favoritos', 'success');
      } else {
        console.log('❌ Producto removido de favoritos');
        // Aquí podrías mostrar un toast de confirmación
        // showToast('Producto removido de favoritos', 'info');
      }

      // Verificar que se guardó correctamente
      setTimeout(() => {
        const savedProduct = getFavoriteProduct(productId);
        console.log('Verification - Product after toggle:', {
          expected: wasAdded,
          inFavorites: !!savedProduct,
          savedData: savedProduct
        });
      }, 100);

    } catch (error) {
      console.error('Error al toggle favorite:', error);
      // showToast('Error al modificar favoritos', 'error');
    } finally {
      setIsToggling(false);
    }
  }, [product, isValidProduct, getProductId, productId, productIsFavorite, isAuthenticated, isToggling, toggleFavorite, getFavoriteProduct]);

  // Función para incrementar cantidad
  const incrementQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  // Función para decrementar cantidad
  const decrementQuantity = useCallback(() => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  }, []);

  // Función para añadir al carrito
  const addToCart = useCallback(() => {
    if (!isValidProduct(product)) {
      console.error('Producto inválido para carrito');
      return;
    }

    const cartItem = {
      id: productId,
      _id: productId,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
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
      const existingItemIndex = cart.findIndex(item => (item.id || item._id) === productId);
      
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Reset quantity después de añadir al carrito
      setQuantity(1);
      
      // Aquí podrías mostrar un toast de éxito
      console.log('✅ Producto añadido al carrito exitosamente');
      
    } catch (error) {
      console.error('Error al guardar en carrito:', error);
    }
  }, [product, isValidProduct, productId, quantity]);

  // Función para personalizar producto
  const handlePersonalize = useCallback(() => {
    if (!productId) {
      console.error('No se puede personalizar: producto sin ID');
      return;
    }
    
    // Aquí podrías navegar a una página de personalización
    // o abrir un modal de personalización
    console.log('Abrir personalización para producto:', productId);
  }, [productId]);

  // Si no hay producto, mostrar estado de error
  if (!product) {
    return (
      <div className="space-y-3">
        <div className="text-red-500">Error: No se pudo cargar la información del producto</div>
      </div>
    );
  }

  // Si el producto no es válido, mostrar advertencia
  if (!isValidProduct(product)) {
    return (
      <div className="space-y-3">
        <div className="text-yellow-600">Advertencia: El producto no tiene información completa</div>
        <pre className="text-xs text-gray-500">{JSON.stringify(product, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Categoría del producto */}
      <p className="text-sm text-pink-400 font-medium">
        {product.category || 'Arreglos con flores naturales'}
      </p>
      
      {/* Título/nombre del producto */}
      <h1 className="text-2xl font-bold text-gray-800">
        {product.name || 'Producto sin nombre'}
      </h1>
      
      {/* Precio del producto con símbolo de moneda */}
      <p className="text-xl font-semibold text-gray-700">
        {product.price || '0'}₡
      </p>
      
      {/* Descripción detallada del producto */}
      <p className="text-sm text-gray-600">
        {product.description || 'Sin descripción disponible'}
      </p>

      {/* Stock información */}
      {product.stock !== undefined && (
        <div className="text-sm text-gray-600">
          {product.stock > 0 ? (
            <span className="text-green-600">✅ {product.stock} disponibles</span>
          ) : (
            <span className="text-red-600">❌ Sin stock</span>
          )}
        </div>
      )}

      {/* Sección de botones de acción */}
      <div className="flex flex-wrap gap-2 mt-4">
        {/* Botón principal para añadir al carrito */}
        <Button 
          onClick={addToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Sin stock' : `Añadir al carrito (${quantity})`}
        </Button>
        
        {/* Botón para añadir/quitar de favoritos con estado dinámico */}
        <Button 
          variant="ghost" 
          onClick={handleToggleFavorite}
          disabled={isToggling}
          className={`transition-all duration-200 ${
            productIsFavorite 
              ? 'bg-pink-100 text-pink-600 border-pink-300 hover:bg-pink-200' 
              : 'hover:bg-gray-100'
          } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isToggling ? (
            <>
              <span className="mr-1">⏳</span>
              Procesando...
            </>
          ) : productIsFavorite ? (
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
          disabled={!productId}
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
          disabled={product.stock !== undefined && quantity >= product.stock}
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

      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-400 mt-4">
          <summary>Debug Info (Solo en desarrollo)</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({
              productId,
              isValidProduct: isValidProduct(product),
              productIsFavorite,
              product: product
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ProductInfo;
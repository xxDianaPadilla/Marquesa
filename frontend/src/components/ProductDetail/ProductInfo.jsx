import React, { useState } from 'react';
import toast from 'react-hot-toast';
import carrito from '../../assets/carritoP.png';
import guardar from '../../assets/guardarP.png';
import useCustomization from '../CustomProducts/Hooks/useCustomization'; 
import { useFavorites } from '../../context/FavoritesContext'; // Importar el contexto de favoritos

const ProductInfo = ({ product, quantity, setQuantity, handleCustomProductClick, user, userInfo, isAuthenticated }) => {
  const { addItemToCart, isLoading } = useCustomization();
  const { addToFavorites, removeFromFavorites, isFavorite, toggleFavorite } = useFavorites(); // Usar el contexto de favoritos
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  // Función para manejar la adición al carrito
  const handleAddToCart = async () => {
    try {
      // Validar que el usuario esté autenticado
      if (!isAuthenticated || !user || !user.id) {
        toast.error('Debes iniciar sesión para agregar productos al carrito', {
          duration: 4000,
          position: 'top-center',
          icon: '🔐'
        });
        return;
      }

      // Validar que el producto tenga la información necesaria
      if (!product || !product._id) {
        toast.error('Error: Información del producto incompleta', {
          duration: 4000,
          position: 'top-center',
          icon: '⚠️'
        });
        return;
      }

      setAddingToCart(true);

      // Mostrar toast de carga
      const loadingToast = toast.loading('Agregando producto al carrito...', {
        position: 'top-center'
      });

      // Calcular el subtotal
      // Extraer el precio numérico del string (ej: "$25.00" -> 25)
      const priceMatch = product.price.match(/[\d,.]+/);
      const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : 0;
      
      if (numericPrice <= 0) {
        toast.dismiss(loadingToast);
        toast.error('Error: Precio del producto inválido', {
          duration: 4000,
          position: 'top-center',
          icon: '💰'
        });
        return;
      }

      const subtotal = numericPrice * quantity;

      // Preparar datos del item para el carrito
      const cartItemData = {
        itemType: "product", // Tipo de producto regular
        itemId: product._id, // ID del producto
        itemTypeRef: "products", // Referencia a la colección de productos
        quantity: quantity, // Cantidad seleccionada
        subtotal: subtotal // Subtotal calculado
      };

      console.log('Agregando producto al carrito:', {
        product: product.name,
        quantity,
        price: numericPrice,
        subtotal,
        cartItemData,
        user: { id: user.id, isAuthenticated }
      });

      // Llamar a la función para agregar al carrito
      const updatedCart = await addItemToCart(user.id, cartItemData);

      console.log('Producto agregado exitosamente al carrito:', updatedCart);
      
      // Dismissar el toast de carga y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success(`¡${product.name} agregado al carrito exitosamente!`, {
        duration: 3000,
        position: 'top-center',
        icon: '🛒',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Opcional: Resetear la cantidad a 1 después de agregar
      setQuantity(1);

    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      
      // Mostrar mensaje de error específico
      const errorMessage = error.message || 'Error al agregar el producto al carrito';
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Función para manejar la adición/eliminación de favoritos
  const handleToggleFavorites = async () => {
    try {
      setAddingToFavorites(true);

      // Preparar el objeto del producto para favoritos
      const productForFavorites = {
        _id: product._id,
        id: product._id, // Para consistencia
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.images && product.images.length > 0 ? product.images[0].image : '/placeholder-image.jpg',
        images: product.images
      };

      const wasAdded = toggleFavorite(productForFavorites);

      if (wasAdded) {
        toast.success(`¡${product.name} agregado a favoritos!`, {
          duration: 3000,
          position: 'top-center',
          icon: '❤️',
          style: {
            background: '#EC4899',
            color: '#fff',
          },
        });
      } else {
        toast.success(`${product.name} eliminado de favoritos`, {
          duration: 3000,
          position: 'top-center',
          icon: '💔',
          style: {
            background: '#6B7280',
            color: '#fff',
          },
        });
      }

    } catch (error) {
      console.error('Error al manejar favoritos:', error);
      toast.error('Error al actualizar favoritos', {
        duration: 3000,
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setAddingToFavorites(false);
    }
  };

  // Verificar si el producto está en favoritos
  const isProductFavorite = product && product._id ? isFavorite(product._id) : false;

  return (
    <div className="space-y-4">
      <span className="inline-block bg-[#F7E8F2] text-[#CD5277] text-xs font-medium italic px-2 py-1 rounded">
        {product.category}
      </span>
      
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-lg font-semibold">{product.price}</p>
      
      <div>
        <label className="text-sm font-medium text-gray-700">Cantidad</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm w-fit mt-1">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={addingToCart || isLoading}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="px-3 py-1 bg-white border-x border-gray-300">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            disabled={addingToCart || isLoading}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || isLoading || !isAuthenticated}
          className="bg-[#E8ACD2] hover:bg-pink-300 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2
                     transition-transform duration-200 ease-in-out hover:scale-105 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <img src={carrito} alt="Carrito" className="w-5 h-5" />
          {addingToCart ? 'Agregando...' : 'Añadir al carrito'}
        </button>
        
        <button
          onClick={handleToggleFavorites}
          disabled={addingToFavorites}
          className={`border px-4 py-2 rounded-md text-sm flex items-center gap-2
                     transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     ${isProductFavorite 
                       ? 'border-pink-400 bg-pink-50 text-pink-600 hover:bg-pink-100' 
                       : 'border-[#c1c1c1] hover:bg-pink-200 text-[#000000]'
                     }`}
        >
          <img src={guardar} alt="Guardar" className="w-5 h-5" />
          {addingToFavorites 
            ? 'Procesando...' 
            : isProductFavorite 
              ? 'En favoritos' 
              : 'Añadir a favoritos'
          }
        </button>
      </div>

      {/* Mostrar mensaje informativo si no está autenticado */}
      {!isAuthenticated && (
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
          📝 Inicia sesión para agregar productos al carrito
        </div>
      )}

      {/* Mostrar estado de carga si está agregando productos personalizados */}
      {isLoading && (
        <div className="text-sm text-gray-500 italic">
          Procesando...
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
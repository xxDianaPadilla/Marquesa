import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import carrito from '../../assets/carritoP.png';
import guardar from '../../assets/guardarP.png';
import useCustomization from '../CustomProducts/Hooks/useCustomization';
import { useFavorites } from '../../context/FavoritesContext';
import useShoppingCart from '../ShoppingCart/hooks/useShoppingCart'; // Importar el hook del carrito

const ProductInfo = ({
  product,
  quantity,
  setQuantity,
  handleCustomProductClick,
  user,
  userInfo,
  isAuthenticated
}) => {
  const { addItemToCart, isLoading } = useCustomization();

  // Hook del carrito para verificar si el producto ya está agregado
  const { cartItems, refreshCart } = useShoppingCart();

  // Usar todas las funciones disponibles del contexto de favoritos
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isLoading: favoritesLoading,
    favoritesCount
  } = useFavorites();

  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  // Validar si el producto es válido - memoizado para optimización
  const isValidProduct = useMemo(() => {
    return product && (product._id || product.id) && product.name && product.price;
  }, [product]);

  // Extraer precio numérico - memoizado para evitar recálculos
  const numericPrice = useMemo(() => {
    if (!product?.price) return 0;

    // Manejar diferentes formatos de precio
    let priceString = product.price.toString();

    // Remover símbolos de moneda y espacios
    priceString = priceString.replace(/[$€£¥₹₽\s]/g, '');

    // Extraer números y puntos/comas
    const priceMatch = priceString.match(/[\d.,]+/);

    if (!priceMatch) return 0;

    // Convertir a número (manejar tanto punto como coma decimal)
    const cleanPrice = priceMatch[0].replace(',', '.');
    const price = parseFloat(cleanPrice);

    return isNaN(price) ? 0 : price;
  }, [product?.price]);

  // Calcular subtotal - memoizado
  const subtotal = useMemo(() => {
    return numericPrice * quantity;
  }, [numericPrice, quantity]);

  // Preparar producto normalizado para favoritos - memoizado
  const normalizedProduct = useMemo(() => {
    if (!isValidProduct) return null;

    // Extraer la mejor imagen disponible
    let productImage = '/placeholder-image.jpg';

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      if (product.images[0].image) {
        productImage = product.images[0].image;
      } else if (typeof product.images[0] === 'string') {
        productImage = product.images[0];
      }
    } else if (product.image) {
      productImage = product.image;
    }

    return {
      // IDs normalizados
      _id: product._id || product.id,
      id: product._id || product.id,

      // Información básica
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',

      // Imágenes normalizadas
      image: productImage,
      images: product.images || [],

      // Stock si está disponible
      stock: product.stock,

      // Personalizable
      isPersonalizable: product.isPersonalizable || false,

      // Preservar otros campos que puedan ser importantes
      ...Object.keys(product).reduce((acc, key) => {
        if (!['_id', 'id', 'name', 'description', 'price', 'category', 'image', 'images', 'stock', 'isPersonalizable'].includes(key)) {
          acc[key] = product[key];
        }
        return acc;
      }, {})
    };
  }, [product, isValidProduct]);

  // Verificar si el producto está en favoritos - optimizado
  const isProductFavorite = useMemo(() => {
    if (!normalizedProduct || !isAuthenticated) return false;
    return isFavorite(normalizedProduct._id);
  }, [normalizedProduct, isFavorite, isAuthenticated]);

  // NUEVO: Verificar si el producto está en el carrito
  const isProductInCart = useMemo(() => {
    if (!normalizedProduct || !cartItems || cartItems.length === 0) return false;

    return cartItems.some(item => {
      // Comparar por ID del producto
      const itemId = item.id || item._originalItem?.itemId;
      return itemId === normalizedProduct._id;
    });
  }, [normalizedProduct, cartItems]);

  // NUEVO: Obtener la cantidad del producto en el carrito
  const productQuantityInCart = useMemo(() => {
    if (!normalizedProduct || !cartItems || cartItems.length === 0) return 0;

    const cartItem = cartItems.find(item => {
      const itemId = item.id || item._originalItem?.itemId;
      return itemId === normalizedProduct._id;
    });

    return cartItem ? cartItem.quantity : 0;
  }, [normalizedProduct, cartItems]);

  // Función optimizada para manejar la adición al carrito
  const handleAddToCart = useCallback(async () => {
    try {
      // Validaciones iniciales
      if (!isAuthenticated || !user?.id) {
        toast.error('Debes iniciar sesión para agregar productos al carrito', {
          duration: 4000,
          position: 'top-center',
          icon: '🔐',
          style: {
            background: '#F59E0B',
            color: '#fff',
          }
        });
        return;
      }

      if (!isValidProduct) {
        toast.error('Error: Información del producto incompleta', {
          duration: 4000,
          position: 'top-center',
          icon: '⚠️'
        });
        return;
      }

      if (numericPrice <= 0) {
        toast.error('Error: Precio del producto inválido', {
          duration: 4000,
          position: 'top-center',
          icon: '💰'
        });
        return;
      }

      if (quantity <= 0) {
        toast.error('Error: Cantidad inválida', {
          duration: 3000,
          position: 'top-center',
          icon: '📊'
        });
        return;
      }

      setAddingToCart(true);

      // Toast de carga mejorado
      const loadingToast = toast.loading(
        `Agregando ${quantity} ${product.name}${quantity > 1 ? 's' : ''} al carrito...`, {
        position: 'top-center'
      }
      );

      // Preparar datos del item para el carrito
      const cartItemData = {
        itemType: "product",
        itemId: normalizedProduct._id,
        itemTypeRef: "products",
        quantity: quantity,
        subtotal: subtotal
      };

      console.log('🛒 Agregando producto al carrito:', {
        product: product.name,
        quantity,
        price: numericPrice,
        subtotal,
        cartItemData,
        user: { id: user.id, isAuthenticated }
      });

      // Llamar a la función para agregar al carrito
      const updatedCart = await addItemToCart(user.id, cartItemData);

      console.log('✅ Producto agregado exitosamente al carrito:', updatedCart);

      // Dismissar el toast de carga y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success(
        `¡${quantity} ${product.name}${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''} al carrito!`, {
        duration: 3000,
        position: 'top-center',
        icon: '🛒',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      }
      );

      // NUEVO: Refrescar el carrito para actualizar el estado visual
      await refreshCart();

      // Opcional: Resetear la cantidad a 1 después de agregar
      setQuantity(1);

    } catch (error) {
      console.error('❌ Error al agregar producto al carrito:', error);

      // Manejo de errores específicos
      let errorMessage = 'Error inesperado al agregar el producto al carrito';

      if (error.message?.includes('stock')) {
        errorMessage = 'No hay suficiente stock disponible';
      } else if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo';
      } else if (error.message) {
        errorMessage = error.message;
      }

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
  }, [isAuthenticated, user?.id, isValidProduct, numericPrice, quantity, subtotal, normalizedProduct, product.name, addItemToCart, setQuantity, refreshCart]);

  // ✅ FUNCIÓN ACTUALIZADA: Manejar favoritos con validación de autenticación
  const handleToggleFavorites = useCallback(async () => {
    try {
      // ✅ NUEVA VALIDACIÓN: Verificar autenticación PRIMERO
      if (!isAuthenticated || !user?.id) {
        toast.error('Debes iniciar sesión para gestionar favoritos', {
          duration: 4000,
          position: 'top-center',
          icon: '🔐',
          style: {
            background: '#F59E0B',
            color: '#fff',
          }
        });
        return;
      }

      if (!normalizedProduct) {
        toast.error('Error: Producto inválido', {
          duration: 3000,
          position: 'top-center',
          icon: '⚠️'
        });
        return;
      }

      setAddingToFavorites(true);

      console.log('❤️ Toggle favorite for product:', {
        id: normalizedProduct._id,
        name: normalizedProduct.name,
        wasCurrentlyFavorite: isProductFavorite
      });

      const wasAdded = toggleFavorite(normalizedProduct);

      // Feedback basado en la acción realizada
      if (isProductFavorite) {
        // Se removió de favoritos
        toast.success(`${product.name} eliminado de favoritos`, {
          duration: 3000,
          position: 'top-center',
          icon: '💔',
          style: {
            background: '#6B7280',
            color: '#fff',
          },
        });
        console.log('❌ Producto removido de favoritos');
      } else {
        // Se agregó a favoritos
        toast.success(`¡${product.name} agregado a favoritos!`, {
          duration: 3000,
          position: 'top-center',
          icon: '❤️',
          style: {
            background: '#EC4899',
            color: '#fff',
          },
        });
        console.log('✅ Producto agregado a favoritos');
      }

      // Log del estado actual
      console.log(`📊 Total favoritos: ${favoritesCount + (isProductFavorite ? -1 : 1)}`);

    } catch (error) {
      console.error('❌ Error al manejar favoritos:', error);

      let errorMessage = 'Error al actualizar favoritos';
      if (error.message?.includes('storage')) {
        errorMessage = 'Error de almacenamiento. Verifica el espacio disponible';
      } else if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
        icon: '❌'
      });
    } finally {
      setAddingToFavorites(false);
    }
  }, [isAuthenticated, user?.id, normalizedProduct, isProductFavorite, toggleFavorite, product.name, favoritesCount]);

  // Función para manejar cambios en la cantidad
  const handleQuantityChange = useCallback((change) => {
    if (addingToCart || isLoading) return;

    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity + change;

      // Validar límites
      if (newQuantity < 1) return 1;
      if (product.stock && newQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`, {
          duration: 2000,
          position: 'top-center',
          icon: '📦'
        });
        return product.stock;
      }

      return newQuantity;
    });
  }, [addingToCart, isLoading, setQuantity, product.stock]);

  // Validar si se puede agregar al carrito
  const canAddToCart = useMemo(() => {
    return isValidProduct &&
      numericPrice > 0 &&
      quantity > 0 &&
      !addingToCart &&
      !isLoading &&
      isAuthenticated &&
      (!product.stock || quantity <= product.stock);
  }, [isValidProduct, numericPrice, quantity, addingToCart, isLoading, isAuthenticated, product.stock]);

  // ✅ NUEVA VALIDACIÓN: Verificar si se puede gestionar favoritos
  const canManageFavorites = useMemo(() => {
    return isValidProduct &&
      isAuthenticated &&
      !addingToFavorites &&
      !favoritesLoading;
  }, [isValidProduct, isAuthenticated, addingToFavorites, favoritesLoading]);

  // Si el producto no es válido, mostrar error
  if (!isValidProduct) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">
          ⚠️ Error: Información del producto incompleta o inválida
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Categoría del producto */}
      {product.category && (
        <span className="inline-block bg-[#F7E8F2] text-[#CD5277] text-xs font-medium italic px-2 py-1 rounded">
          {product.category}
        </span>
      )}

      {/* Información básica del producto */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-green-600">{product.price}</p>
          {subtotal !== numericPrice && (
            <p className="text-sm text-gray-500">
              (Subtotal: ${subtotal.toFixed(2)})
            </p>
          )}
        </div>

        {/* Stock information */}
        {product.stock !== undefined && (
          <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3">
        {/* Botón de agregar al carrito - ACTUALIZADO con estado visual */}
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className={`px-4 py-2 rounded-md text-sm flex items-center gap-2
                     transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     ${isProductInCart
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg border-2 border-green-600'
              : canAddToCart
                ? 'bg-[#E8ACD2] hover:bg-pink-300 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500'
            }`}
          aria-label={`Agregar ${quantity} ${product.name}${quantity > 1 ? 's' : ''} al carrito`}
        >
          <img
            src={carrito}
            alt="Carrito"
            className={`w-5 h-5 ${isProductInCart ? 'filter brightness-0 invert' : ''}`}
          />
          {addingToCart
            ? 'Agregando...'
            : isProductInCart
              ? `En carrito (${productQuantityInCart})`
              : `Añadir al carrito${quantity > 1 ? ` (${quantity})` : ''}`
          }
        </button>

        {/* ✅ BOTÓN DE FAVORITOS ACTUALIZADO - Bloqueado sin autenticación */}
        <button
          onClick={handleToggleFavorites}
          disabled={!canManageFavorites}
          className={`border px-4 py-2 rounded-md text-sm flex items-center gap-2
                     transition-all duration-200 ease-in-out
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     ${!isAuthenticated
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : canManageFavorites
                ? `hover:scale-105 cursor-pointer ${isProductFavorite
                  ? 'border-pink-400 bg-pink-50 text-pink-600 hover:bg-pink-100 shadow-md'
                  : 'border-[#c1c1c1] hover:bg-pink-50 hover:border-pink-300 text-[#000000]'
                }`
                : 'border-gray-300 bg-gray-100 text-gray-400'
            }`}
          aria-label={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <img
            src={guardar}
            alt={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className={`w-5 h-5 transition-opacity ${!isAuthenticated
              ? 'opacity-50 grayscale'
              : isProductFavorite
                ? 'opacity-100'
                : 'opacity-70'
              }`}
          />
          {!isAuthenticated
            ? 'Inicia sesión para favoritos'
            : addingToFavorites
              ? 'Procesando...'
              : isProductFavorite
                ? '❤️ En favoritos'
                : 'Añadir a favoritos'
          }
        </button>
      </div>

      {/* Mensajes informativos */}
      <div className="space-y-2">
        {/* NUEVO: Mensaje cuando el producto está en el carrito */}
        {isProductInCart && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
            <span>
              Este producto está en tu carrito
              {productQuantityInCart > 1 && ` (${productQuantityInCart} unidades)`}
            </span>
          </div>
        )}

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200 flex items-center gap-2">
            <span>Inicia sesión para agregar productos al carrito y gestionar favoritos</span>
          </div>
        )}

        {/* Mensaje de stock bajo */}
        {product.stock && product.stock <= 5 && product.stock > 0 && (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200 flex items-center gap-2">
            <span>¡Últimas {product.stock} unidades disponibles!</span>
          </div>
        )}

        {/* Mensaje sin stock */}
        {product.stock === 0 && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 flex items-center gap-2">
            <span>Producto sin stock disponible</span>
          </div>
        )}

        {/* ✅ INDICADOR ACTUALIZADO: Solo mostrar si está autenticado */}
        {isAuthenticated && favoritesCount > 0 && isProductFavorite && (
          <div className="text-sm text-pink-600 bg-pink-50 p-2 rounded border border-pink-200 flex items-center gap-2">
            <span>Tienes {favoritesCount} producto{favoritesCount === 1 ? '' : 's'} en favoritos</span>
          </div>
        )}

        {/* Estado de carga para customización */}
        {isLoading && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 flex items-center gap-2">
            <span>⏳</span>
            <span>Procesando personalización...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
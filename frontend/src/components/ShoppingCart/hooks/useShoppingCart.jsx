import { useState, useEffect, useCallback } from "react";
import { useAuth } from '../../../context/AuthContext';

const useShoppingCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const { user, isAuthenticated, userInfo } = useAuth();

    const fetchShoppingCart = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await fetch(`http://localhost:4000/api/shoppingCart/client/${user.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos del backend:', data); // Para debug
                console.log('ShoppingCart dentro de data:', data.shoppingCart); // Debug específico

                // CORRECCIÓN: Acceder correctamente a la estructura
                if (data.success && data.shoppingCart) {
                    const cart = data.shoppingCart;
                    console.log('Carrito extraído:', cart); // Debug del carrito
                    console.log('Items del carrito:', cart.items); // Debug de los items
                    console.log('Tipo de items:', typeof cart.items, Array.isArray(cart.items)); // Debug del tipo

                    if (cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
                        const transformedItems = cart.items.map(item => {
                            console.log('Item original:', item); // Para debug
                            console.log('itemId:', item.itemId); // Debug del itemId
                            console.log('itemType:', item.itemType); // Debug del tipo de item

                            // Manejar diferentes tipos de productos
                            let transformedItem = {
                                id: item.itemId?._id || item.itemId,
                                quantity: item.quantity || 1,
                                itemType: item.itemType,
                                subtotal: item.subtotal,
                                _originalItem: item
                            };

                            if (item.itemType === 'product') {
                                // Producto normal
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.name || 'Producto sin nombre',
                                    description: item.itemId?.description || '',
                                    price: item.itemId?.price || 0,
                                    // Manejar imágenes de productos normales
                                    image: item.itemId?.images?.[0]?.image || item.itemId?.image || ''
                                };
                            } else if (item.itemType === 'custom') {
                                // Producto personalizado
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.productToPersonalize || 'Producto personalizado',
                                    description: item.itemId?.extraComments || 'Producto personalizado',
                                    price: item.itemId?.totalPrice || 0,
                                    // Para productos personalizados, usar emoji o imagen de referencia
                                    image: item.itemId?.referenceImage || '🎨' // Emoji como fallback
                                };
                            } else {
                                // Fallback para otros tipos
                                transformedItem = {
                                    ...transformedItem,
                                    name: item.itemId?.name || item.itemId?.productToPersonalize || 'Producto',
                                    description: item.itemId?.description || item.itemId?.extraComments || '',
                                    price: item.itemId?.price || item.itemId?.totalPrice || 0,
                                    image: item.itemId?.images?.[0]?.image || item.itemId?.referenceImage || '📦'
                                };
                            }

                            console.log('Item transformado:', transformedItem); // Debug del item transformado
                            return transformedItem;
                        });

                        console.log('Items transformados:', transformedItems); // Para debug

                        setCartItems(transformedItems);
                        setCartTotal(cart.total || 0);
                    } else {
                        console.log('El carrito existe pero no tiene items o está vacío');
                        console.log('cart.items:', cart.items);
                        setCartItems([]);
                        setCartTotal(0);
                    }
                } else {
                    console.log('No se encontró shoppingCart en la respuesta o success es false');
                    console.log('data.success:', data.success);
                    console.log('data.shoppingCart existe:', !!data.shoppingCart);
                    setCartItems([]);
                    setCartTotal(0);
                }
            } else if (response.status === 404) {
                console.log('Carrito no encontrado (404)');
                setCartItems([]);
                setCartTotal(0);
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al obtener el carrito: ', error);
            setError('Error al cargar el carrito de compras');
            setCartItems([]);
            setCartTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    const updateQuantity = useCallback(async (itemId, newQuantity) => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        if (newQuantity < 1 || newQuantity > 99) {
            setError('La cantidad debe estar entre 1 y 99');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/update-quantity`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId,
                    quantity: newQuantity
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCartItems(prevItems =>
                        prevItems.map(item => {
                            if (item.id === itemId || item._originalItem?.itemId === itemId) {
                                const updatedPrice = item.price * newQuantity;
                                return {
                                    ...item,
                                    quantity: newQuantity,
                                    subtotal: updatedPrice
                                };
                            }
                            return item;
                        })
                    );

                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al actualizar cantidad');
                }
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al actualizar cantidad: ', error);
            setError(error.message || 'Error al actualizar la cantidad');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const removeItem = useCallback(async (itemId) => {
        if (!isAuthenticated || !user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/remove-item`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: itemId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCartItems(prevItems =>
                        prevItems.filter(item =>
                            item.id !== itemId && item._originalItem?.itemId !== itemId
                        )
                    );

                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al eliminar producto');
                }
            } else {
                throw new Error('Error al eliminar item: ', error);
            }
        } catch (error) {
            console.error('Error al eliminar item: ', error);
            setError(error.message || 'Error al eliminar el producto');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const addToCart = useCallback(async (productId, quantity = 1, itemType = 'product') => {
        if (!isAuthenticated || user?.id) {
            setError('Usuario no autenticado');
            return false;
        }

        try {
            setUpdating(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/shoppingCart/add-item`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: user.id,
                    itemId: productId,
                    quantity: quantity,
                    itemType: itemType
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await fetchShoppingCart();
                    return true;
                } else {
                    throw new Error(data.message || 'Error al agregar producto');
                }
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al agregar al carrito: ', error);
            setError(error.message || 'Error al agregar el producto al carrito');
            return false;
        } finally {
            setUpdating(false);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        await fetchShoppingCart();
    }, [fetchShoppingCart]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchShoppingCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
            setLoading(false);
            setError(null);
        }
    }, [isAuthenticated, user?.id, fetchShoppingCart]);

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    return {
        cartItems,
        cartTotal,
        subtotal,
        loading,
        error,
        updating,

        isAuthenticated,
        user,
        userInfo,

        updateQuantity,
        removeItem,
        addToCart,
        clearError,
        refreshCart,

        itemCount: cartItems.length,
        isEmpty: cartItems.length === 0
    };
};

export default useShoppingCart;
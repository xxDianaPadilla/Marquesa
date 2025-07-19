/**
 * Componente ShoppingCart - Página del carrito de compras
 * ACTUALIZADO: Agregadas validaciones básicas manteniendo funcionalidad original
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import "../styles/ShoppingCart.css";

// Imágenes de ejemplo
import Flower1 from "../assets/savesFlower1.png";
import Flower2 from "../assets/savesFlower2.png";
import Flower3 from "../assets/savesFlower3.png";

/**
 * Validaciones básicas para el carrito
 */
const validateCartItem = (item) => {
    if (!item || typeof item !== 'object') return false;
    
    // Verificar campos requeridos
    if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return false;
    }
    
    // Validar valores
    if (item.price < 0 || item.quantity < 1 || item.quantity > 99) {
        return false;
    }
    
    return true;
};

const validateDiscountCode = (code) => {
    if (!code || typeof code !== 'string') return false;
    const trimmedCode = code.trim();
    return trimmedCode.length >= 3 && trimmedCode.length <= 20;
};

const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim().slice(0, 50);
};

const ShoppingCart = () => {
    const navigate = useNavigate();
    const [cartError, setCartError] = useState(null);

    const handlePaymentProcessClick = (e) => {
        e.preventDefault();
        
        // Validar que hay items en el carrito antes de proceder
        if (cartItems.length === 0) {
            setCartError('Tu carrito está vacío. Agrega algunos productos antes de continuar.');
            return;
        }
        
        // Validar que todos los items son válidos
        const invalidItems = cartItems.filter(item => !validateCartItem(item));
        if (invalidItems.length > 0) {
            setCartError('Hay productos inválidos en tu carrito. Por favor revísalos.');
            return;
        }
        
        setCartError(null);
        navigate('/paymentProcess');
    };

    // Estado del carrito con validación inicial
    const [cartItems, setCartItems] = useState(() => {
        const initialItems = [
            {
                id: 1,
                name: "Ramo de flores secas lavanda",
                description: "Arreglos con flores secas",
                price: 10.00,
                quantity: 1,
                image: Flower1
            },
            {
                id: 2,
                name: "Cuadro sencillo de hogar",
                description: "Cuadros decorativos",
                price: 34.00,
                quantity: 1,
                image: Flower2
            },
            {
                id: 3,
                name: "Ramo de rosas frescas",
                description: "Arreglos con flores naturales",
                price: 23.00,
                quantity: 1,
                image: Flower3
            }
        ];
        
        // Validar items iniciales
        return initialItems.filter(item => validateCartItem(item));
    });

    // Estados adicionales
    const [isLoading, setIsLoading] = useState(false);
    const [discountError, setDiscountError] = useState(null);

    // Calcular subtotal con validación
    const subtotal = React.useMemo(() => {
        try {
            return cartItems.reduce((sum, item) => {
                if (!validateCartItem(item)) return sum;
                return sum + (item.price * item.quantity);
            }, 0);
        } catch (error) {
            console.error('Error calculando subtotal:', error);
            return 0;
        }
    }, [cartItems]);

    // Validar carrito al cargar
    useEffect(() => {
        const validItems = cartItems.filter(item => validateCartItem(item));
        if (validItems.length !== cartItems.length) {
            console.warn('Se encontraron items inválidos en el carrito');
            setCartItems(validItems);
            setCartError('Se removieron algunos productos inválidos del carrito.');
        }
    }, []);

    /**
     * Función para actualizar cantidad con validación
     */
    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        try {
            // Validar entrada
            if (!itemId || typeof newQuantity !== 'number') {
                setCartError('Error al actualizar cantidad del producto.');
                return;
            }
            
            // Validar rango de cantidad
            if (newQuantity < 1) {
                setCartError('La cantidad debe ser al menos 1.');
                return;
            }
            
            if (newQuantity > 99) {
                setCartError('La cantidad máxima es 99 unidades.');
                return;
            }
            
            setCartError(null);
            setCartItems(prevItems =>
                prevItems.map(item => {
                    if (item.id === itemId) {
                        const updatedItem = { ...item, quantity: newQuantity };
                        if (!validateCartItem(updatedItem)) {
                            console.error('Item actualizado es inválido:', updatedItem);
                            return item; // Mantener item original si la actualización es inválida
                        }
                        return updatedItem;
                    }
                    return item;
                })
            );
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            setCartError('Error inesperado al actualizar la cantidad.');
        }
    }, []);

    /**
     * Función para eliminar producto con validación
     */
    const handleRemoveItem = useCallback((itemId) => {
        try {
            if (!itemId) {
                setCartError('Error al identificar el producto a eliminar.');
                return;
            }
            
            setCartError(null);
            setCartItems(prevItems => {
                const filteredItems = prevItems.filter(item => item.id !== itemId);
                
                // Si se eliminó el último item, mostrar mensaje informativo
                if (filteredItems.length === 0) {
                    setTimeout(() => {
                        setCartError(null); // Limpiar cualquier error cuando el carrito esté vacío
                    }, 100);
                }
                
                return filteredItems;
            });
        } catch (error) {
            console.error('Error al eliminar item:', error);
            setCartError('Error inesperado al eliminar el producto.');
        }
    }, []);

    /**
     * Función para aplicar descuento con validación
     */
    const handleApplyDiscount = useCallback(async (code, amount) => {
        try {
            setIsLoading(true);
            setDiscountError(null);
            
            const sanitizedCode = sanitizeInput(code);
            
            if (!validateDiscountCode(sanitizedCode)) {
                setDiscountError('Código de descuento inválido. Debe tener entre 3 y 20 caracteres.');
                return;
            }
            
            if (typeof amount !== 'number' || amount < 0) {
                setDiscountError('Monto de descuento inválido.');
                return;
            }
            
            // Simular validación del código con el servidor
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Aquí iría la lógica real de validación del descuento
            console.log(`Descuento aplicado: ${sanitizedCode} - Monto: ${amount}$`);
            
            // Por ahora solo mostramos mensaje de éxito
            setDiscountError(null);
            
        } catch (error) {
            console.error('Error al aplicar descuento:', error);
            setDiscountError('Error al aplicar el descuento. Inténtalo nuevamente.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Función para continuar comprando
     */
    const handleContinueShopping = useCallback(() => {
        try {
            navigate('/');
        } catch (error) {
            console.error('Error al navegar:', error);
            setCartError('Error al navegar. Inténtalo nuevamente.');
        }
    }, [navigate]);

    /**
     * Limpiar errores cuando el usuario interactúa
     */
    const clearErrors = useCallback(() => {
        setCartError(null);
        setDiscountError(null);
    }, []);

    // Limpiar errores después de un tiempo
    useEffect(() => {
        if (cartError) {
            const timer = setTimeout(() => {
                setCartError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [cartError]);

    /**
     * Componente para carrito vacío
     */
    const EmptyCart = () => (
        <div className="empty-cart">
            <div className="mb-6">
                <svg
                    className="w-20 h-20 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-2 0V9a3 3 0 00-3-3H9a3 3 0 00-3 3v4"
                    />
                </svg>
            </div>
            <h3>Tu carrito está vacío</h3>
            <p>Agrega algunos productos para comenzar</p>
            <button
                className="pay-btn"
                onClick={handleContinueShopping}
                style={{ maxWidth: '300px', margin: '0 auto', cursor: 'pointer' }}
                disabled={isLoading}
            >
                {isLoading ? 'Cargando...' : 'Explorar productos'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white-50">
            <Header />
            <br />
            <br />

            <div className="text-center mb-8">
                <h1
                    className="text-3xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Mi carrito
                </h1>
            </div>

            {/* NUEVO - Mostrar errores del carrito */}
            {cartError && (
                <div className="max-w-4xl mx-auto px-4 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {cartError}
                            </span>
                            <button 
                                onClick={clearErrors}
                                className="ml-auto text-red-500 hover:text-red-700"
                                style={{ cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="shopping-cart-container">
                {cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        <section
                            className="cart-items-section"
                            aria-label="Lista de productos en el carrito"
                        >
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                />
                            ))}
                        </section>

                        <OrderSummary
                            subtotal={subtotal}
                            shipping={10.00}
                            onApplyDiscount={handleApplyDiscount}
                            onProceedToPay={handlePaymentProcessClick}
                            onContinueShopping={handleContinueShopping}
                            discountError={discountError}
                            isLoading={isLoading}
                        />
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ShoppingCart;
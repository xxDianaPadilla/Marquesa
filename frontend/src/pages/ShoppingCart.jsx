/**
 * Componente ShoppingCart - Página del carrito de compras
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import useShoppingCart from "../components/ShoppingCart/hooks/useShoppingCart";
import "../styles/ShoppingCart.css";

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

    // Estados locales para UI
    const [cartError, setCartError] = useState(null);
    const [discountError, setDiscountError] = useState(null);
    const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);

    // Usar el hook personalizado del carrito
    const {
        cartItems,
        cartTotal,
        subtotal: calculatedSubtotal,
        loading,
        error: hookError,
        updating,
        isAuthenticated,
        user,
        updateQuantity,
        removeItem,
        clearError,
        refreshCart,
        isEmpty
    } = useShoppingCart();

    // Manejar errores del hook
    useEffect(() => {
        if (hookError) {
            setCartError(hookError);
        }
    }, [hookError]);

    /**
     * Función para proceder al pago
     */
    const handlePaymentProcessClick = (e) => {
        e.preventDefault();

        // Validar autenticación
        if (!isAuthenticated) {
            setCartError('Debes iniciar sesión para continuar con la compra.');
            return;
        }

        // Validar que hay items en el carrito
        if (isEmpty) {
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

    /**
     * Función para actualizar cantidad con validación mejorada
     */
    const handleUpdateQuantity = useCallback(async (itemId, newQuantity) => {
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

            // Usar la función del hook
            const success = await updateQuantity(itemId, newQuantity);

            if (!success) {
                setCartError('Error al actualizar la cantidad. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            setCartError('Error inesperado al actualizar la cantidad.');
        }
    }, [updateQuantity]);

    /**
     * Función para eliminar producto con validación mejorada
     */
    const handleRemoveItem = useCallback(async (itemId) => {
        try {
            if (!itemId) {
                setCartError('Error al identificar el producto a eliminar.');
                return;
            }

            setCartError(null);

            // Usar la función del hook
            const success = await removeItem(itemId);

            if (!success) {
                setCartError('Error al eliminar el producto. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al eliminar item:', error);
            setCartError('Error inesperado al eliminar el producto.');
        }
    }, [removeItem]);

    /**
     * Función para aplicar descuento con validación
     */
    const handleApplyDiscount = useCallback(async (code, amount) => {
        try {
            setIsLoadingDiscount(true);
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
            setIsLoadingDiscount(false);
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
        clearError(); // Limpiar errores del hook también
    }, [clearError]);

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
            <br />
            <button
                className="pay-btn"
                onClick={handleContinueShopping}
                style={{ maxWidth: '300px', margin: '0 auto', cursor: 'pointer' }}
                disabled={loading}
            >
                {loading ? 'Cargando...' : 'Explorar productos'}
            </button>
        </div>
    );

    /**
     * Componente de carga
     */
    const LoadingCart = () => (
        <div className="loading-cart text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p style={{ fontFamily: 'Poppins, sans-serif' }}>Cargando tu carrito...</p>
        </div>
    );

    /**
     * Componente para usuario no autenticado
     */
    const UnauthenticatedCart = () => (
        <div className="unauthenticated-cart text-center py-12">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif' }}>Inicia sesión para ver tu carrito</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif' }}>Debes iniciar sesión para acceder a tu carrito de compras</p>
            <button
                className="pay-btn"
                onClick={() => navigate('/login')}
                style={{ maxWidth: '300px', margin: '0 auto', cursor: 'pointer' }}
            >
                Iniciar sesión
            </button>
        </div>
    );

    // Mostrar loading mientras se cargan los datos
    if (loading) {
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
                <div className="shopping-cart-container">
                    <LoadingCart />
                </div>
                <Footer />
            </div>
        );
    }

    // Mostrar mensaje para usuarios no autenticados
    if (!isAuthenticated) {
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
                <div className="shopping-cart-container">
                    <UnauthenticatedCart />
                </div>
                <Footer />
            </div>
        );
    }

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

            {/* Mostrar errores del carrito */}
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

            {/* Botón de refrescar si hay error */}
            {hookError && (
                <div className="max-w-4xl mx-auto px-4 mb-4">
                    <div className="text-center">
                        <button
                            onClick={refreshCart}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            disabled={loading}
                        >
                            {loading ? 'Cargando...' : 'Reintentar'}
                        </button>
                    </div>
                </div>
            )}

            <div className="shopping-cart-container">
                {isEmpty ? (
                    <EmptyCart />
                ) : (
                    <>
                        <section
                            className="cart-items-section"
                            aria-label="Lista de productos en el carrito"
                        >
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id || item._originalItem?.itemId}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                    updating={updating}
                                />
                            ))}
                        </section>

                        <OrderSummary
                            subtotal={calculatedSubtotal}
                            shipping={10.00}
                            total={cartTotal}
                            onApplyDiscount={handleApplyDiscount}
                            onProceedToPay={handlePaymentProcessClick}
                            onContinueShopping={handleContinueShopping}
                            discountError={discountError}
                            isLoading={isLoadingDiscount}
                            updating={updating}
                        />
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ShoppingCart;
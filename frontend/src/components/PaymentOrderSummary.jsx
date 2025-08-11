/**
 * Componente PaymentOrderSummary - Resumen del pedido en la página de pago
 * 
 * Componente que muestra el desglose final de precios y productos
 * en la página de pago para confirmación del usuario. Incluye subtotales, 
 * descuentos aplicados, total final y resumen de productos seleccionados.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PaymentOrderSummary = ({ 
    subtotal = 0, 
    total = 0, 
    discountApplied = false, 
    discountAmount = 0, 
    discountInfo = null,
    cartItems = []
}) => {
    const { user, isAuthenticated } = useAuth();
    const [currentCartItems, setCurrentCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener items del carrito si no se pasaron como props
    useEffect(() => {
        const fetchCartItems = async () => {
            if (cartItems && cartItems.length > 0) {
                setCurrentCartItems(cartItems);
                setLoading(false);
                return;
            }

            if (!isAuthenticated || !user?.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`https://test-9gs3.onrender.com/api/shoppingCart/client/${user.id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.shoppingCart && data.shoppingCart.items) {
                        // Transformar items del carrito para mostrar
                        const transformedItems = data.shoppingCart.items.map(item => ({
                            id: item.itemId?._id || item.itemId,
                            name: item.itemType === 'product' 
                                ? (item.itemId?.name || 'Producto sin nombre')
                                : (item.itemId?.productToPersonalize || 'Producto personalizado'),
                            quantity: item.quantity || 1,
                            price: item.itemType === 'product' 
                                ? (item.itemId?.price || 0)
                                : (item.itemId?.totalPrice || 0),
                            subtotal: item.subtotal || 0,
                            itemType: item.itemType
                        }));
                        
                        setCurrentCartItems(transformedItems);
                    }
                } else {
                    setError('Error al cargar items del carrito');
                }
            } catch (err) {
                console.error('Error fetching cart items:', err);
                setError('Error al cargar el resumen del pedido');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [cartItems, isAuthenticated, user?.id]);

    // Calcular subtotal si no se proporciona
    const calculatedSubtotal = subtotal || currentCartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    // Calcular total con descuentos
    const finalTotal = Math.max(0, calculatedSubtotal - (discountAmount || 0));

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Título del resumen */}
            <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Resumen del pedido
            </h3>

            {/* Sección de desglose de precios */}
            <div className="space-y-3 mb-6">
                {/* Subtotal de productos */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Subtotal
                    </span>
                    <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ${calculatedSubtotal.toFixed(2)}
                    </span>
                </div>

                {/* Mostrar descuento si está aplicado */}
                {discountApplied && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Descuento {discountInfo?.name ? `(${discountInfo.name})` : ''}
                        </span>
                        <span className="font-medium text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            -${discountAmount.toFixed(2)}
                        </span>
                    </div>
                )}

                {/* Línea divisoria y total final */}
                <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>Total</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ${(total || finalTotal).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sección de resumen de productos */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-3 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Resumen de productos ({currentCartItems.length} {currentCartItems.length === 1 ? 'artículo' : 'artículos'})
                </p>

                {/* Lista de productos con cantidades y precios */}
                <div className="space-y-2 text-sm">
                    {currentCartItems.length > 0 ? (
                        currentCartItems.map((item, index) => (
                            <div key={item.id || index} className="flex justify-between items-start">
                                <div className="flex-1 pr-2">
                                    <span className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.name} x {item.quantity}
                                    </span>
                                    {item.itemType === 'custom' && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Producto personalizado
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium text-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                                No hay productos en el carrito
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Información adicional de descuento */}
            {discountApplied && discountInfo && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-green-700 text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¡Descuento aplicado!
                            </p>
                            <p className="text-green-600 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {discountInfo.name} - Código: {discountInfo.code}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Información de seguridad */}
            <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>Pago seguro</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>SSL protegido</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentOrderSummary;
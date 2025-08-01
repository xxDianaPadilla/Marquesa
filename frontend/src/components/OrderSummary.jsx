/**
 * Componente OrderSummary - Resumen del pedido
 * ACTUALIZADO: Adaptado para trabajar con datos de la API del carrito
 */

import React, { useState } from 'react';

const OrderSummary = ({ 
    subtotal, 
    shipping = 10.00, 
    total, 
    onApplyDiscount, 
    onProceedToPay, 
    onContinueShopping,
    discountError = null,
    isLoading = false,
    updating = false
}) => {
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    /**
     * Maneja la aplicación del código de descuento
     */
    const handleApplyDiscount = async (e) => {
        e.preventDefault();
        
        if (!discountCode.trim() || isApplyingDiscount || updating) {
            return;
        }

        setIsApplyingDiscount(true);
        
        try {
            // Simular descuento por ahora - aquí iría la lógica real
            let discountAmount = 0;
            const code = discountCode.trim().toUpperCase();
            
            // Códigos de ejemplo
            switch (code) {
                case 'DESCUENTO10':
                    discountAmount = subtotal * 0.10;
                    break;
                case 'DESCUENTO20':
                    discountAmount = subtotal * 0.20;
                    break;
                case 'ENVIOGRATIS':
                    discountAmount = shipping;
                    break;
                default:
                    discountAmount = 0;
            }
            
            await onApplyDiscount(discountCode, discountAmount);
            
            if (discountAmount > 0) {
                setAppliedDiscount(discountAmount);
            }
        } catch (error) {
            console.error('Error aplicando descuento:', error);
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    /**
     * Calcula el total final considerando descuentos
     */
    const finalTotal = Math.max(0, (total || (subtotal + shipping)) - appliedDiscount);

    return (
        <div className="order-summary">
            <div className="summary-header">
                <h3 style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Resumen del pedido
                </h3>
            </div>

            <div className="summary-content">
                {/* Subtotal */}
                <div className="summary-line">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                {/* Descuento aplicado */}
                {appliedDiscount > 0 && (
                    <div className="summary-line discount-line">
                        <span style={{ color: '#10b981' }}>
                            Descuento aplicado:
                        </span>
                        <span style={{ color: '#10b981' }}>
                            -${appliedDiscount.toFixed(2)}
                        </span>
                    </div>
                )}

                {/* Total */}
                <div className="summary-line total-line">
                    <span><strong>Total:</strong></span>
                    <span><strong>${finalTotal.toFixed(2)}</strong></span>
                </div>
            </div>

            {/* Sección de código promocional */}
            <div className="discount-section">
                <form onSubmit={handleApplyDiscount} className="discount-form">
                    <div className="discount-input-group">
                        <input
                            type="text"
                            placeholder="Código promocional"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            disabled={isApplyingDiscount || updating}
                            maxLength={20}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        <button 
                            type="submit"
                            disabled={!discountCode.trim() || isApplyingDiscount || updating}
                            className="apply-discount-btn"
                        >
                            {isApplyingDiscount ? 'Aplicando...' : 'Aplicar'}
                        </button>
                    </div>
                </form>

                {/* Error de descuento */}
                {discountError && (
                    <div className="discount-error">
                        <span style={{ color: '#ef4444', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                            {discountError}
                        </span>
                    </div>
                )}

                {/* Códigos de ejemplo */}
                <div className="discount-hints">
                    <small style={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
                        Códigos de prueba: DESCUENTO10, DESCUENTO20, ENVIOGRATIS
                    </small>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="summary-actions">
                <button
                    onClick={onContinueShopping}
                    disabled={updating || isLoading}
                    className="continue-shopping-btn"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Continuar comprando
                </button>

                <button
                    onClick={onProceedToPay}
                    disabled={updating || isLoading || finalTotal <= 0}
                    className="pay-btn"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {updating || isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </span>
                    ) : (
                        `Proceder al pago - $${finalTotal.toFixed(2)}`
                    )}
                </button>
            </div>

            {/* Información adicional */}
            <div className="payment-info">
                <div className="security-badges">
                    <small style={{ color: '#6b7280', fontFamily: 'Poppins, sans-serif' }}>
                        🔒 Pago seguro SSL 
                    </small>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
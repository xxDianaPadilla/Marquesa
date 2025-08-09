/**
 * Componente OrderSummary - Resumen del pedido
 * ACTUALIZADO: Implementa validación real de códigos promocionales desde ruletaCodes
 */

import React, { useState } from 'react';

const OrderSummary = ({
    subtotal,
    total,
    onApplyDiscount,
    onProceedToPay,
    onContinueShopping,
    discountError = null,
    isLoading = false,
    updating = false,
    userId = null // Agregado para obtener los códigos del cliente
}) => {
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); // Objeto completo del descuento
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [codeError, setCodeError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Función para validar el código promocional con el backend
     */
    const validatePromotionalCode = async (code) => {
        try {
            const response = await fetch(`http://localhost:4000/api/clients/${userId}/validate-code`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code.trim().toUpperCase() })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return {
                    valid: true,
                    discountData: data.discountData
                };
            } else {
                return {
                    valid: false,
                    message: data.message || 'Código promocional no válido'
                };
            }
        } catch (error) {
            console.error('Error validando código:', error);
            return {
                valid: false,
                message: 'Error al validar el código. Inténtalo nuevamente.'
            };
        }
    };

    /**
     * Calcula el monto de descuento basado en el porcentaje
     */
    const calculateDiscountAmount = (discountPercentage, subtotal) => {
        // Usar parseFloat en lugar de parseInt para manejar decimales
        const percentage = parseFloat(discountPercentage.replace(/[^0-9.]/g, ''));
        const discountAmount = (subtotal * percentage) / 100;

        console.log('Debug cálculo descuento:');
        console.log('- Percentage string:', discountPercentage);
        console.log('- Percentage number:', percentage);
        console.log('- Subtotal:', subtotal);
        console.log('- Discount amount:', discountAmount);

        return discountAmount;
    };

    const subtotalWithDiscount = subtotal - (appliedDiscount?.amount || 0);
    

    /**
     * Maneja la aplicación del código de descuento
     */
    const handleApplyDiscount = async (e) => {
        e.preventDefault();

        if (!discountCode.trim() || isApplyingDiscount || updating) {
            return;
        }

        if (!userId) {
            setCodeError('Error: Usuario no identificado');
            return;
        }

        setIsApplyingDiscount(true);
        setCodeError(null);
        setSuccessMessage('');

        try {
            // Validar el código con el backend
            const validation = await validatePromotionalCode(discountCode);

            if (validation.valid) {
                const { discountData } = validation;

                // Calcular el monto del descuento
                const discountAmount = calculateDiscountAmount(discountData.discount, subtotal);

                // Actualizar estado local
                setAppliedDiscount({
                    ...discountData,
                    amount: discountAmount
                });

                // Llamar a la función externa para aplicar descuento
                await onApplyDiscount(discountCode, discountAmount, discountData);

                setSuccessMessage(`¡Código aplicado! ${discountData.name} - ${discountData.discount}`);

                // Limpiar el input después de aplicar exitosamente
                setTimeout(() => {
                    setDiscountCode('');
                    setSuccessMessage('');
                }, 3000);

            } else {
                setCodeError(validation.message);
                setAppliedDiscount(null);
            }
        } catch (error) {
            console.error('Error aplicando descuento:', error);
            setCodeError('Error al aplicar el código. Inténtalo nuevamente.');
            setAppliedDiscount(null);
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    /**
     * Maneja la remoción del descuento aplicado
     */
    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setCodeError(null);
        setSuccessMessage('');

        // Llamar función externa para remover descuento si existe
        if (onApplyDiscount) {
            onApplyDiscount('', 0, null);
        }
    };

    /**
     * Calcula el total final considerando descuentos
     */
    const finalTotal = Math.max(0, subtotalWithDiscount);

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
                {appliedDiscount && appliedDiscount.amount > 0 && (
                    <div className="summary-line discount-line">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#10b981', fontSize: '14px' }}>
                                    {appliedDiscount.name}
                                </span>
                                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                                    Código: {appliedDiscount.code}
                                </small>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                    -${appliedDiscount.amount.toFixed(2)}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemoveDiscount}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        padding: '0',
                                        width: '20px',
                                        height: '20px'
                                    }}
                                    title="Remover descuento"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="summary-line total-line">
                    <span><strong>Total:</strong></span>
                    <span><strong>${finalTotal.toFixed(2)}</strong></span>
                </div>
            </div>

            {/* Sección de código promocional */}
            {!appliedDiscount && (
                <div className="discount-section">
                    <form onSubmit={handleApplyDiscount} className="discount-form">
                        <div className="discount-input-group">
                            <input
                                type="text"
                                placeholder="Código promocional"
                                value={discountCode}
                                onChange={(e) => {
                                    setDiscountCode(e.target.value);
                                    if (codeError) setCodeError(null);
                                }}
                                disabled={isApplyingDiscount || updating}
                                maxLength={20}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            <button
                                type="submit"
                                disabled={!discountCode.trim() || isApplyingDiscount || updating}
                                className="apply-discount-btn"
                            >
                                {isApplyingDiscount ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                                            <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Validando...
                                    </span>
                                ) : 'Aplicar'}
                            </button>
                        </div>
                    </form>

                    {/* Mensajes de error y éxito */}
                    {codeError && (
                        <div className="discount-error">
                            <span style={{ color: '#ef4444', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                                ⚠️ {codeError}
                            </span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="discount-success">
                            <span style={{ color: '#10b981', fontSize: '12px', fontFamily: 'Poppins, sans-serif' }}>
                                ✅ {successMessage}
                            </span>
                        </div>
                    )}

                    {/* Error externo pasado como prop */}
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
                            Usa los códigos que has ganado en la ruleta de descuentos
                        </small>
                    </div>
                </div>
            )}

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

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .discount-success {
                    margin-top: 8px;
                    padding: 8px;
                    background-color: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 6px;
                }
                
                .discount-error {
                    margin-top: 8px;
                    padding: 8px;
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
};

export default OrderSummary;
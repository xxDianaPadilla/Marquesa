// frontend/src/components/OrderSummary.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ 
    subtotal, 
    shipping = 10.00, 
    onApplyDiscount, 
    onProceedToPay, 
    onContinueShopping,
    onClick 
}) => {
    const [discountCode, setDiscountCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const navigate = useNavigate();

    const handlePaymentProcessClick = (e) => {
        e.preventDefault();
        navigate('/paymentProcess');
    };

    const total = subtotal + shipping - discount;

    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            // Simulamos validación de código de descuento
            let discountAmount = 0;
            switch (discountCode.toUpperCase()) {
                case "DESCUENTO10":
                    discountAmount = subtotal * 0.1;
                    break;
                case "MARQUESA20":
                    discountAmount = subtotal * 0.2;
                    break;
                case "FLORES15":
                    discountAmount = subtotal * 0.15;
                    break;
                default:
                    alert("Código de descuento no válido");
                    return;
            }
            
            setDiscount(discountAmount);
            if (onApplyDiscount) {
                onApplyDiscount(discountCode, discountAmount);
            }
            alert(`Descuento aplicado: ${discountAmount.toFixed(2)}$`);
        }
    };

    const handleProceedToPay = () => {
        if (onProceedToPay) {
            onProceedToPay({
                subtotal,
                shipping,
                discount,
                total
            });
        }
    };

    return (
        <aside className="summary" aria-label="Resumen del pedido">
            <h3>Resumen del pedido</h3>
            
            <div className="summary-row">
                <span>Sub Total</span>
                <span>{subtotal.toFixed(2)}$</span>
            </div>
            
            <div className="summary-row">
                <span>Envío</span>
                <span>{shipping.toFixed(2)}$</span>
            </div>
            
            {discount > 0 && (
                <div className="summary-row">
                    <span>Descuento</span>
                    <span style={{ color: '#28a745' }}>-{discount.toFixed(2)}$</span>
                </div>
            )}
            
            <hr />
            
            <div className="summary-row total">
                <span>Total</span>
                <span>{total.toFixed(2)}$</span>
            </div>
            
            <label htmlFor="discount-code" className="discount-label">
                Código de descuento
            </label>
            <div className="discount-container">
                <input 
                    id="discount-code"
                    className="discount-input"
                    type="text"
                    placeholder="Introducir código"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
                <button 
                    className="discount-btn"
                    type="button"
                    onClick={handleApplyDiscount}
                >
                    Aplicar
                </button>
            </div>
            
            <button 
                className="pay-btn"
                type="button"
                onClick={handlePaymentProcessClick}
            >
                Proceder al pago
            </button>
            
            <div 
                className="continue"
                role="button"
                tabIndex={0}
                onClick={onContinueShopping}
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onContinueShopping()}
            >
                Continuar comprando
            </div>
        </aside>
    );
};

export default OrderSummary;
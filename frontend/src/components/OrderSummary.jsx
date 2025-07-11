// frontend/src/components/OrderSummary.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente OrderSummary - Resumen del pedido con funcionalidad de descuentos
 * @param {number} subtotal - Precio subtotal de los productos
 * @param {number} shipping - Costo de envío (por defecto 10.00)
 * @param {function} onApplyDiscount - Callback cuando se aplica un descuento
 * @param {function} onProceedToPay - Callback para proceder al pago
 * @param {function} onContinueShopping - Callback para continuar comprando
 * @param {function} onClick - Callback adicional para clicks
 */
const OrderSummary = ({ 
    subtotal, 
    shipping = 10.00, 
    onApplyDiscount, 
    onProceedToPay, 
    onContinueShopping,
    onClick 
}) => {
    // Estado para almacenar el código de descuento ingresado
    const [discountCode, setDiscountCode] = useState("");
    
    // Estado para almacenar el monto del descuento aplicado
    const [discount, setDiscount] = useState(0);
    
    // Hook para navegación programática
    const navigate = useNavigate();

    /**
     * Maneja el click en el botón de "Proceder al pago"
     * Navega a la página de proceso de pago
     */
    const handlePaymentProcessClick = (e) => {
        e.preventDefault();
        navigate('/paymentProcess');
    };

    // Calcula el total final (subtotal + envío - descuento)
    const total = subtotal + shipping - discount;

    /**
     * Maneja la aplicación de códigos de descuento
     * Valida el código ingresado y aplica el descuento correspondiente
     */
    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            // Variable para almacenar el monto del descuento
            let discountAmount = 0;
            
            // Switch para validar códigos de descuento predefinidos
            switch (discountCode.toUpperCase()) {
                case "DESCUENTO10":
                    discountAmount = subtotal * 0.1; // 10% de descuento
                    break;
                case "MARQUESA20":
                    discountAmount = subtotal * 0.2; // 20% de descuento
                    break;
                case "FLORES15":
                    discountAmount = subtotal * 0.15; // 15% de descuento
                    break;
                default:
                    // Código no válido - mostrar alerta y salir
                    alert("Código de descuento no válido");
                    return;
            }
            
            // Actualizar el estado con el descuento aplicado
            setDiscount(discountAmount);
            
            // Ejecutar callback si está definido
            if (onApplyDiscount) {
                onApplyDiscount(discountCode, discountAmount);
            }
            
            // Mostrar confirmación del descuento aplicado
            alert(`Descuento aplicado: ${discountAmount.toFixed(2)}$`);
        }
    };

    /**
     * Maneja la acción de proceder al pago
     * Ejecuta el callback con los datos del resumen
     */
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
            
            {/* Fila del subtotal */}
            <div className="summary-row">
                <span>Sub Total</span>
                <span>{subtotal.toFixed(2)}$</span>
            </div>
            
            {/* Fila del costo de envío */}
            <div className="summary-row">
                <span>Envío</span>
                <span>{shipping.toFixed(2)}$</span>
            </div>
            
            {/* Fila del descuento - solo se muestra si hay descuento aplicado */}
            {discount > 0 && (
                <div className="summary-row">
                    <span>Descuento</span>
                    <span style={{ color: '#28a745' }}>-{discount.toFixed(2)}$</span>
                </div>
            )}
            
            {/* Separador visual */}
            <hr />
            
            {/* Fila del total final */}
            <div className="summary-row total">
                <span>Total</span>
                <span>{total.toFixed(2)}$</span>
            </div>
            
            {/* Etiqueta para el campo de código de descuento */}
            <label htmlFor="discount-code" className="discount-label">
                Código de descuento
            </label>
            
            {/* Contenedor para input y botón de descuento */}
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
            
            {/* Botón principal para proceder al pago */}
            <button 
                className="pay-btn"
                type="button"
                onClick={handlePaymentProcessClick}
            >
                Proceder al pago
            </button>
            
            {/* Enlace para continuar comprando - accesible con teclado */}
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
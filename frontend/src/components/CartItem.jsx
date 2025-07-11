// frontend/src/components/CartItem.jsx
import React from "react";

// Componente para un artículo del carrito
// Muestra la información del producto, cantidad y permite actualizar o eliminar el artículo
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        onUpdateQuantity(item.id, newQuantity);
    };
// Función para manejar el cambio de cantidad
// Esta función se utiliza para actualizar la cantidad del producto en el carrito
    const handleRemove = () => {
        onRemoveItem(item.id);
    };

    return (
        <article className="cart-item">
            <img 
                src={item.image} 
                alt={`${item.name} - ${item.description}`}
                width="100" 
                height="100"
            />
            <div className="item-info">
                <span className="item-title">
                    {item.name}
                </span>
                <span className="item-desc">
                    {item.description}
                </span>
                <div 
                    className="item-controls"
                    aria-label={`Cantidad del producto ${item.name}`}
                >
                    <button 
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        aria-label="Disminuir cantidad"
                        disabled={item.quantity <= 1}
                    >
                        −
                    </button>
                    <input 
                        type="text" 
                        value={item.quantity}
                        readOnly
                        aria-atomic="true"
                        aria-live="polite"
                        aria-relevant="additions removals"
                    />
                    <button 
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>
            </div>
            <span className="item-price">
                {(item.price * item.quantity).toFixed(2)}$
            </span>
            <button 
                className="trash-btn"
                onClick={handleRemove}
                aria-label={`Eliminar ${item.name} del carrito`}
            >
                🗑️
            </button>
        </article>
    );
};

export default CartItem;
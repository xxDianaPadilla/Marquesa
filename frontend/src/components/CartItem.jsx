/**
 * Componente CartItem - Item individual del carrito
 * ACTUALIZADO: Adaptado para trabajar con datos de la API
 */

import React, { useState } from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, updating = false }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Maneja el cambio de cantidad
     */
    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity === localQuantity || isUpdating || updating) return;
        
        setIsUpdating(true);
        setLocalQuantity(newQuantity);
        
        try {
            // Usar el ID correcto dependiendo de la estructura
            const itemId = item.id || item._originalItem?.itemId;
            await onUpdateQuantity(itemId, newQuantity);
        } catch (error) {
            // Revertir cambio local si falla
            setLocalQuantity(item.quantity);
            console.error('Error actualizando cantidad:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Maneja la eliminación del item
     */
    const handleRemove = async () => {
        if (isUpdating || updating) return;
        
        setIsUpdating(true);
        try {
            const itemId = item.id || item._originalItem?.itemId;
            await onRemoveItem(itemId);
        } catch (error) {
            console.error('Error eliminando item:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Sincronizar cantidad local con props cuando cambie
    React.useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    return (
        <div className={`cart-item ${isUpdating || updating ? 'updating' : ''}`}>
            <div className="item-image">
                <img 
                    src={item.image || '/placeholder-image.jpg'} 
                    alt={item.name}
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            </div>
            
            <div className="item-details">
                <h3>{item.name}</h3>
                {item.description && (
                    <p className="item-description">{item.description}</p>
                )}
                {item.itemType && (
                    <span className={`item-type ${item.itemType}`}>
                        {item.itemType === 'custom' ? 'Personalizado' : 'Producto'}
                    </span>
                )}
            </div>
            
            <div className="item-quantity">
                <button 
                    onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                    disabled={localQuantity <= 1 || isUpdating || updating}
                    className="quantity-btn"
                >
                    -
                </button>
                <span className="quantity-display">{localQuantity}</span>
                <button 
                    onClick={() => handleQuantityChange(Math.min(99, localQuantity + 1))}
                    disabled={localQuantity >= 99 || isUpdating || updating}
                    className="quantity-btn"
                >
                    +
                </button>
            </div>
            
            <div className="item-price">
                <span className="unit-price">${item.price.toFixed(2)}</span>
                <span className="subtotal">${(item.price * localQuantity).toFixed(2)}</span>
            </div>
            
            <div className="item-actions">
                <button 
                    onClick={handleRemove}
                    disabled={isUpdating || updating}
                    className="remove-btn"
                    title="Eliminar producto"
                >
                    {isUpdating || updating ? '...' : '🗑️'}
                </button>
            </div>
            
            {(isUpdating || updating) && (
                <div className="updating-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CartItem;
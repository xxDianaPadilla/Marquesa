/**
 * Componente CartItem - Item individual del carrito
 * ACTUALIZADO: Agregado toast de confirmación al eliminar producto
 */

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, updating = false }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    /**
     * Maneja el cambio de cantidad
     */
    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity === localQuantity || isUpdating || updating) return;
        
        setIsUpdating(true);
        setLocalQuantity(newQuantity);
        
        try {
            const itemId = item.id || item._originalItem?.itemId;
            const success = await onUpdateQuantity(itemId, newQuantity);
            
            if (success) {
                // Toast sutil para actualización de cantidad
                toast.success(`Cantidad actualizada a ${newQuantity}`, {
                    duration: 2000,
                    position: 'bottom-center',
                    style: {
                        fontSize: '14px',
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        border: '1px solid #bae6fd'
                    }
                });
            }
        } catch (error) {
            // Revertir cambio local si falla
            setLocalQuantity(item.quantity);
            console.error('Error actualizando cantidad:', error);
            
            toast.error('Error al actualizar cantidad', {
                duration: 3000,
                position: 'bottom-center'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Maneja la eliminación del item con toast de confirmación
     */
    const handleRemove = async () => {
        if (isUpdating || updating) return;
        
        setIsUpdating(true);
        
        try {
            const itemId = item.id || item._originalItem?.itemId;
            const success = await onRemoveItem(itemId);
            
            if (success) {
                // ✅ TOAST DE ÉXITO para eliminación
                toast.success(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🗑️</span>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                Producto eliminado
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                {item.name}
                            </div>
                        </div>
                    </div>,
                    {
                        duration: 3000,
                        position: 'bottom-center',
                        style: {
                            background: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            padding: '12px 16px',
                            minWidth: '280px'
                        },
                        iconTheme: {
                            primary: '#15803d',
                            secondary: '#f0fdf4'
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error eliminando item:', error);
            
            // Toast de error
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            Error al eliminar
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                            Inténtalo nuevamente
                        </div>
                    </div>
                </div>,
                {
                    duration: 4000,
                    position: 'bottom-center',
                    style: {
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        minWidth: '280px'
                    }
                }
            );
        } finally {
            setIsUpdating(false);
        }
    };

    /**
     * Función para determinar si mostrar imagen
     */
    const shouldShowImage = () => {
        if (!item.image || item.image === '🎨' || item.image === '📦' || item.image.length <= 2) {
            return false;
        }
        if (imageError) {
            return false;
        }
        return true;
    };

    /**
     * Función para manejar error de imagen
     */
    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    /**
     * Función para manejar carga exitosa de imagen
     */
    const handleImageLoad = () => {
        setImageError(false);
        setImageLoaded(true);
    };

    // Sincronizar cantidad local con props cuando cambie
    React.useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    // Reset estado de imagen cuando cambie el item
    React.useEffect(() => {
        setImageError(false);
        setImageLoaded(false);
    }, [item.image, item.id]);

    return (
        <div className={`cart-item ${isUpdating || updating ? 'updating' : ''}`}>
            <div className="item-image">
                {shouldShowImage() ? (
                    <img 
                        src={item.image} 
                        alt={item.name}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        style={{
                            display: imageError ? 'none' : 'block',
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    />
                ) : (
                    <div 
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa',
                            border: '1px dashed #dee2e6',
                            borderRadius: '4px',
                            color: '#6c757d',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}
                    >
                        {item.itemType === 'custom' ? 'Producto\nPersonalizado' : 'Sin imagen'}
                    </div>
                )}
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
                    style={{
                        opacity: (isUpdating || updating) ? 0.5 : 1,
                        cursor: (isUpdating || updating) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isUpdating || updating ? (
                        <span style={{ 
                            display: 'inline-block', 
                            animation: 'spin 1s linear infinite',
                            fontSize: '14px'
                        }}>
                            ⏳
                        </span>
                    ) : '🗑️'}
                </button>
            </div>
            
            {(isUpdating || updating) && (
                <div className="updating-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            {/* CSS para la animación de spin */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CartItem;
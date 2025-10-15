/**
 * Componente CartItem - Item individual del carrito
 * SOLUCIONADO: Problema de carga inconsistente de imágenes
 */

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import trashIcon from '../assets/trashIcon.png';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, updating = false }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);

    // ✅ ESTADOS MEJORADOS para manejo de imágenes
    const [imageState, setImageState] = useState({
        loading: true,
        error: false,
        loaded: false,
        attempts: 0,
        currentSrc: null
    });

    const imageRef = useRef(null);
    const retryTimeoutRef = useRef(null);

    /**
     * ✅ FUNCIÓN MEJORADA: Obtener URL de imagen válida
     */
    const getImageUrl = (item) => {
        let imageUrl = null;

        // Para productos normales
        if (item.itemType === 'product' || !item.itemType) {
            if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                imageUrl = item.image.trim();
            } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                // Buscar la primera imagen válida en el array
                const validImage = item.images.find(img => {
                    if (typeof img === 'string') return img.trim() !== '';
                    if (img && img.image && typeof img.image === 'string') return img.image.trim() !== '';
                    return false;
                });

                if (validImage) {
                    imageUrl = typeof validImage === 'string' ? validImage : validImage.image;
                }
            }
        }
        // Para productos personalizados
        else if (item.itemType === 'custom') {
            if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                imageUrl = item.image.trim();
            } else if (item.referenceImage && typeof item.referenceImage === 'string' && item.referenceImage.trim() !== '') {
                imageUrl = item.referenceImage.trim();
            }
        }

        // Verificar que la URL sea válida y no sea solo un emoji o texto corto
        if (imageUrl && imageUrl.length > 5 && !imageUrl.match(/^[\u{1F300}-\u{1F9FF}]$/u)) {
            // Si es una URL relativa, convertirla a absoluta
            if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
                // Asumiendo que las imágenes están en tu servidor backend
                imageUrl = `https://marquesa.onrender.com${imageUrl.startsWith('/') ? imageUrl : imageUrl.substring(1)}`;
            }
            return imageUrl;
        }

        return null;
    };

    /**
     * ✅ FUNCIÓN: Validar si una URL de imagen es válida
     */
    const isValidImageUrl = (url) => {
        if (!url || typeof url !== 'string') return false;

        // Verificar que no sea solo emoji o texto muy corto
        if (url.length <= 5) return false;
        if (url.match(/^[\u{1F300}-\u{1F9FF}]$/u)) return false;
        if (['🎨', '📦', 'Sin imagen', 'sin imagen'].includes(url)) return false;

        // Verificar que tenga formato de URL
        try {
            const testUrl = url.startsWith('http') ? url : `https://${url}`;
            new URL(testUrl);
            return true;
        } catch {
            return false;
        }
    };

    /**
     * ✅ FUNCIÓN: Manejar carga exitosa de imagen
     */
    const handleImageLoad = () => {
        console.log('✅ Imagen cargada exitosamente:', imageState.currentSrc);
        setImageState(prev => ({
            ...prev,
            loading: false,
            error: false,
            loaded: true
        }));
    };

    /**
     * ✅ FUNCIÓN: Manejar error de imagen con retry
     */
    const handleImageError = () => {
        console.log('❌ Error cargando imagen:', imageState.currentSrc, 'Intento:', imageState.attempts + 1);

        setImageState(prev => {
            const newAttempts = prev.attempts + 1;

            // Si hemos intentado menos de 3 veces, reintentar después de 2 segundos
            if (newAttempts < 3) {
                console.log('🔄 Reintentando cargar imagen en 2 segundos...');

                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                }

                retryTimeoutRef.current = setTimeout(() => {
                    if (imageRef.current && prev.currentSrc) {
                        imageRef.current.src = prev.currentSrc + `?retry=${newAttempts}`;
                    }
                }, 2000);

                return {
                    ...prev,
                    attempts: newAttempts,
                    loading: true,
                    error: false
                };
            } else {
                // Después de 3 intentos, marcar como error permanente
                console.log('❌ Error permanente en imagen después de 3 intentos');
                return {
                    ...prev,
                    loading: false,
                    error: true,
                    loaded: false,
                    attempts: newAttempts
                };
            }
        });
    };

    /**
     * ✅ FUNCIÓN: Inicializar carga de imagen
     */
    const initializeImage = () => {
        const imageUrl = getImageUrl(item);

        if (!imageUrl || !isValidImageUrl(imageUrl)) {
            console.log('🚫 No hay imagen válida para el producto:', item.name);
            setImageState({
                loading: false,
                error: true,
                loaded: false,
                attempts: 0,
                currentSrc: null
            });
            return;
        }

        console.log('🖼️ Inicializando carga de imagen:', imageUrl);
        setImageState({
            loading: true,
            error: false,
            loaded: false,
            attempts: 0,
            currentSrc: imageUrl
        });
    };

    /**
     * ✅ EFECTO: Reinicializar imagen cuando cambie el item
     */
    useEffect(() => {
        // Limpiar timeout previo
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        initializeImage();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [item.id, item.image, item.images, item.referenceImage]);

    /**
     * ✅ FUNCIÓN: Determinar si mostrar imagen o placeholder
     */
    const shouldShowImage = () => {
        return imageState.currentSrc && !imageState.error && isValidImageUrl(imageState.currentSrc);
    };

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
                toast.success(
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}></span>
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
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error eliminando item:', error);

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

    // Sincronizar cantidad local con props cuando cambie
    useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    return (
        <div className={`cart-item ${isUpdating || updating ? 'updating' : ''}`}>
            <div className="item-image">
                {shouldShowImage() ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* ✅ SPINNER de carga */}
                        {imageState.loading && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 2
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #f3f3f3',
                                    borderTop: '2px solid #3498db',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                            </div>
                        )}

                        {/* ✅ IMAGEN principal */}
                        <img
                            ref={imageRef}
                            src={imageState.currentSrc}
                            alt={item.name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: imageState.loaded ? 1 : 0,
                                transition: 'opacity 0.3s ease-in-out'
                            }}
                        />
                    </div>
                ) : (
                    // ✅ PLACEHOLDER mejorado
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        border: '1px dashed #dee2e6',
                        borderRadius: '4px',
                        color: '#6c757d',
                        fontSize: '12px',
                        textAlign: 'center',
                        padding: '8px'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                            {item.itemType === 'custom' ? '🎨' : '📦'}
                        </div>
                        <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
                            {item.itemType === 'custom' ? 'Producto\nPersonalizado' : 'Sin imagen'}
                        </div>
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
                    ) : (
                        <img 
                            src={trashIcon} 
                            alt="Eliminar" 
                            style={{
                                width: '16px',
                                height: '16px',
                                filter: 'none'
                            }}
                        />
                    )}
                </button>
            </div>

            {(isUpdating || updating) && (
                <div className="updating-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            {/* ✅ CSS para animaciones */}
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
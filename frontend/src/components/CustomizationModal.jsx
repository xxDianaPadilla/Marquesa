import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import useCustomization from './CustomProducts/Hooks/useCustomization';

const CustomizationModal = ({
    isOpen,
    onClose,
    selectedProducts,
    productType,
    onConfirmCustomization
}) => {
    const [referenceImage, setReferenceImage] = useState(null);
    const [comments, setComments] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const { user, userInfo } = useAuth();
    const navigate = useNavigate();

    const { isLoading, processCustomization } = useCustomization();

    const totalPrice = useMemo(() => {
        return selectedProducts.reduce((total, product) => {
            const quantity = product.quantity || 1;
            return total + (product.price * quantity);
        }, 0);
    }, [selectedProducts]);

    const totalItems = useMemo(() => {
        return selectedProducts.reduce((total, product) => {
            return total + (product.quantity || 1);
        }, 0);
    }, [selectedProducts]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 5MB', {
                    duration: 3000,
                    position: 'top-center'
                });
                return;
            }

            setReferenceImage(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setReferenceImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('reference-image-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleConfirm = async () => {
        try {
            const customizationParams = {
                user,
                selectedProducts,
                productType,
                referenceImage,
                comments,
                totalPrice
            };

            const customizationData = await processCustomization(customizationParams);

            if (onConfirmCustomization) {
                onConfirmCustomization(customizationData);
            }

            setReferenceImage(null);
            setImagePreview(null);
            setComments('');
            onClose();

            setTimeout(() => {
                navigate('/categoryProducts');
            }, 3500);

        } catch (error) {
            console.error('Error en el proceso de confirmación:', error);

            toast.error(`Error: ${error.message}`, {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                    maxWidth: '500px'
                },
                icon: '❌'
            });
        }
    };

    const handleCancel = () => {
        setReferenceImage(null);
        setImagePreview(null);
        setComments('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        // CORRECCIÓN: z-index aumentado de z-[9999] a z-[10000]
        <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                ¿Te gusta cómo luce tu {productType}?
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} único{selectedProducts.length !== 1 ? 's' : ''} • {totalItems} item{totalItems !== 1 ? 's' : ''} en total
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            Resumen de tu personalización
                        </h3>
                        <div className="space-y-2 mb-3">
                            {selectedProducts.map((product) => {
                                const quantity = product.quantity || 1;
                                const subtotal = product.price * quantity;
                                
                                return (
                                    <div key={product._id} className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center space-x-3 flex-1">
                                            {product.image && (
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-md object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-gray-800 font-medium">{product.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                    <span>${product.price.toFixed(2)} c/u</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-pink-600">x{quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="border-t border-pink-200 pt-3 mt-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Subtotal ({totalItems} items):</span>
                                <span className="text-sm font-medium text-gray-800">${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-gray-900">Total a pagar:</span>
                                <span className="text-xl font-bold text-pink-600">${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                ¿Ya tenías un diseño en mente?
                                <span className="ml-2 text-xs text-gray-400">(Opcional)</span>
                            </h3>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Imagen de referencia"
                                            className="max-w-full h-40 object-contain mx-auto rounded-lg"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={isLoading}
                                            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mx-auto w-12 h-12 text-gray-400 mb-3">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Subir imagen de referencia
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG hasta 5MB
                                        </p>
                                    </div>
                                )}

                                <input
                                    id="reference-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isLoading}
                                    className="hidden"
                                />

                                {!imagePreview && (
                                    <button
                                        onClick={() => document.getElementById('reference-image-input').click()}
                                        disabled={isLoading}
                                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                                        className="mt-3 px-4 py-2 bg-pink-100 text-pink-700 text-sm rounded-lg hover:bg-pink-200 transition-colors disabled:opacity-50"
                                    >
                                        Subir imagen
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Comentarios adicionales
                                <span className="ml-2 text-xs text-gray-400">(Opcional)</span>
                            </h3>
                            <div className="relative">
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Ej: Me gustaría que las flores estén más concentradas en el centro, o prefiero tonos más cálidos..."
                                    rows={6}
                                    disabled={isLoading}
                                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-100 text-sm"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                    {comments.length}/500
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Describe cualquier detalle específico que quieras para tu personalización
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !user}
                        style={{ cursor: (isLoading || !user) ? 'not-allowed' : 'pointer' }}
                        className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5a2 2 0 00-2 2v2a2 2 0 002 2h2" />
                                </svg>
                                <span>Agregar al carrito (${totalPrice.toFixed(2)})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useCustomization from './CustomProducts/Hooks/useCustomization';

// Componente Modal de Finalización de Personalización
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
    
    // Obtener datos de autenticación
    const { user, userInfo } = useAuth();

    // Usar el hook personalizado para manejar las operaciones de customización
    const { isLoading, processCustomization } = useCustomization();

    // Calcular precio total
    const totalPrice = selectedProducts.reduce((total, product) => total + product.price, 0);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setReferenceImage(file);
            
            // Crear preview de la imagen
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
        // Limpiar el input file
        const fileInput = document.getElementById('reference-image-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleConfirm = async () => {
        try {
            // Preparar parámetros para el hook
            const customizationParams = {
                user,
                selectedProducts,
                productType,
                referenceImage,
                comments,
                totalPrice
            };

            // Procesar la personalización usando el hook
            const customizationData = await processCustomization(customizationParams);

            // Paso 6: Llamar callback de confirmación si existe
            if (onConfirmCustomization) {
                onConfirmCustomization(customizationData);
            }

            // Mostrar mensaje de éxito
            alert('¡Producto personalizado agregado al carrito exitosamente!');
            
            // Limpiar formulario y cerrar modal
            setReferenceImage(null);
            setImagePreview(null);
            setComments('');
            onClose();

        } catch (error) {
            console.error('Error en el proceso de confirmación:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleCancel = () => {
        // Limpiar formulario
        setReferenceImage(null);
        setImagePreview(null);
        setComments('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            ¿Te gusta cómo luce tu {productType}?
                        </h2>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            style={{cursor: isLoading ? 'not-allowed' : 'pointer'}}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Resumen de productos seleccionados */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Resumen de tu personalización
                        </h3>
                        <div className="space-y-2">
                            {selectedProducts.map((product) => (
                                <div key={product._id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{product.name}</span>
                                    <span className="font-medium">${product.price.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex items-center justify-between font-semibold">
                                    <span>Total:</span>
                                    <span className="text-lg text-pink-600">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Imagen de referencia */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                ¿Ya tenías un diseño en mente?
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
                                            style={{cursor: isLoading ? 'not-allowed' : 'pointer'}}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
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
                                        style={{cursor: isLoading ? 'not-allowed' : 'pointer'}}
                                        className="mt-3 px-4 py-2 bg-pink-100 text-pink-700 text-sm rounded-lg hover:bg-pink-200 transition-colors disabled:opacity-50"
                                    >
                                        Subir imagen
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comentarios */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Comentarios adicionales
                            </h3>
                            <div className="relative">
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Comentarios extras"
                                    rows={6}
                                    disabled={isLoading}
                                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <button className="absolute bottom-3 right-3 text-gray-400 hover:text-pink-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-2">
                                Describe cualquier detalle específico que quieras para tu personalización
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        style={{cursor: isLoading ? 'not-allowed' : 'pointer'}}
                        className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !user}
                        style={{cursor: (isLoading || !user) ? 'not-allowed' : 'pointer'}}
                        className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <span>Agregar al carrito</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
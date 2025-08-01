import React from 'react';

const CustomizationPanel = ({ 
    selectedProducts = [], 
    onRemoveProduct, 
    onFinishCustomization,
    productType = ''
}) => {
    // Calcular precio total
    const totalPrice = selectedProducts.reduce((total, product) => total + product.price, 0);

    // Agrupar productos por categoría
    const productsByCategory = selectedProducts.reduce((acc, product) => {
        const category = product.category || 'Sin categoría';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    // Verificar si la personalización está completa (al menos un producto)
    const isCustomizationComplete = selectedProducts.length > 0;

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm sticky top-4">
            {/* Header del panel */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-t-lg border-b">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Tu Personalización
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    {productType}
                </p>
            </div>

            {/* Contenido del panel */}
            <div className="p-4">
                {selectedProducts.length === 0 ? (
                    // Estado vacío
                    <div className="text-center py-8">
                        <div className="text-gray-300 text-4xl mb-3">🎨</div>
                        <p className="text-gray-500 text-sm mb-2">
                            Aún no has seleccionado productos
                        </p>
                        <p className="text-gray-400 text-xs">
                            Haz clic en los productos para personalizarlos
                        </p>
                    </div>
                ) : (
                    // Lista de productos seleccionados
                    <div className="space-y-4">
                        {/* Resumen por categorías */}
                        <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Resumen de selección
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total productos:</span>
                                    <span className="font-medium">{selectedProducts.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Categorías:</span>
                                    <span className="font-medium">{Object.keys(productsByCategory).length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Lista detallada de productos */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {Object.entries(productsByCategory).map(([category, products]) => (
                                <div key={category} className="border-l-2 border-pink-200 pl-3">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                        {category}
                                    </h5>
                                    {products.map((product) => (
                                        <SelectedProductItem
                                            key={product._id}
                                            product={product}
                                            onRemove={() => onRemoveProduct(product._id)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Total de precio */}
                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                    Precio total:
                                </span>
                                <span className="text-lg font-bold text-pink-600">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="mt-6 space-y-2">
                    {selectedProducts.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que deseas limpiar toda la selección?')) {
                                    selectedProducts.forEach(product => onRemoveProduct(product._id));
                                }
                            }}
                            className="w-full py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            Limpiar selección
                        </button>
                    )}

                    <button
                        onClick={onFinishCustomization}
                        disabled={!isCustomizationComplete}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            isCustomizationComplete
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isCustomizationComplete ? (
                            <>
                                <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Finalizar personalización
                            </>
                        ) : (
                            'Selecciona productos para continuar'
                        )}
                    </button>
                </div>

                {/* Información adicional */}
                {selectedProducts.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-xs text-blue-700 font-medium">
                                    ¡Personalización en progreso!
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Puedes seguir agregando o quitando productos antes de finalizar.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente para mostrar cada producto seleccionado
const SelectedProductItem = ({ product, onRemove }) => {
    return (
        <div className="flex items-center space-x-3 bg-white rounded-lg p-2 border border-gray-100 hover:border-gray-200 transition-colors">
            {/* Imagen del producto */}
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            </div>

            {/* Información del producto */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                </p>
                <p className="text-xs text-gray-600">
                    ${product.price.toFixed(2)}
                </p>
            </div>

            {/* Botón de eliminar */}
            <button
                onClick={onRemove}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                title="Quitar producto"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export default CustomizationPanel;
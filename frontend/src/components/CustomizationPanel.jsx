import React from "react";

// Componente para el panel de personalización
// Permite a los usuarios ver y gestionar los productos seleccionados para personalizar
const CustomizationPanel = ({ 
    selectedProducts = [], 
    onRemoveProduct = () => {}, 
    onFinishCustomization = () => {} 
}) => {
    if (selectedProducts.length === 0) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-dashed border-gray-400 rounded"></div>
                </div>
                <p className="text-gray-600 mb-2">¿Te gusta cómo luce tu cuadro?</p>
                <p className="text-sm text-gray-500">Selecciona productos para personalizar</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Productos Seleccionados</h3>
            
            <div className="space-y-3 mb-6">
                {selectedProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">${product.price}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemoveProduct(product.id)}
                            className="text-red-500 hover:text-red-600 text-sm"
                        >
                            Quitar
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex gap-3">
                <button
                    onClick={onFinishCustomization}
                    className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                    Finalizar Personalización
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default CustomizationPanel;
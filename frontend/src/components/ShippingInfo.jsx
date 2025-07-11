// Importa React, necesario para crear componentes en React
import React from "react";

// Componente funcional ShippingInfo
// Recibe la función onNext como propiedad, que se ejecuta cuando se hace clic en el botón "Proceder al pago"
const ShippingInfo = ({ onNext }) => {
    return (
        // Contenedor principal con fondo blanco, bordes redondeados y sombra
        <div className="bg-white rounded-lg shadow-sm border p-6">
            
            {/* Título principal de la sección */}
            <h3 className="text-lg font-semibold mb-6">Información de envío</h3>
            
            <div className="space-y-4">
                {/* Sección para ingresar el nombre del cliente */}
                <div>
                    <label className="block text-sm font-medium mb-2">Cliente</label>
                    <input
                        type="text"
                        placeholder="Escriba su nombre completo"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                    />
                </div>

                {/* Sección para ingresar el correo electrónico y el teléfono del destinatario en una grilla */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="tu@ejemplo.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Teléfono del destinatario</label>
                        <input
                            type="tel"
                            placeholder="Teléfono"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                        />
                    </div>
                </div>

                {/* Sección para ingresar la dirección y el punto de referencia */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Dirección</label>
                        <input
                            type="text"
                            placeholder="Escribe tu dirección exacta"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Punto de referencia</label>
                        <input
                            type="text"
                            placeholder="Punto de referencia"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                        />
                    </div>
                </div>

                {/* Sección para ingresar el nombre del destinatario */}
                <div>
                    <label className="block text-sm font-medium mb-2">Destinatario</label>
                    <input
                        type="text"
                        placeholder="Escribe el nombre del destinatario"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                    />
                </div>
                
                {/* Botón para proceder al siguiente paso, ejecuta la función onNext */}
                <button
                    onClick={onNext}
                    className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                >
                    Proceder al pago
                </button>
            </div>
        </div>
    );
};

// Exporta el componente como default para que pueda ser utilizado en otras partes de la aplicación
export default ShippingInfo;

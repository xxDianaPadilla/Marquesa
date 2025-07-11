import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ConditionsPromotions = () => {
    return (
        <>
            <div className="min-h-screen bg-white-100">
                {/* Header de la página */}
                <Header />

                {/* Contenido principal */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Título de la página */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 px-4"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Condiciones de ofertas y promociones
                        </h1>
                        
                        {/* Descripción introductoria */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 leading-relaxed"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Las ofertas o promociones que se publiquen a través de nuestras redes sociales o sitio web están sujetas a los siguientes términos:
                            </p>
                        </div>

                        {/* Contenido de condiciones - ahora responsive */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg">
                                <ul className="text-left space-y-4 sm:space-y-5 lg:space-y-6">
                                    <li className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-pink-500 rounded-full flex items-center justify-center mt-1">
                                            <span className="text-white text-xs sm:text-sm font-bold">1</span>
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Aplican únicamente dentro del período de vigencia especificado.
                                        </p>
                                    </li>
                                    
                                    <li className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-pink-500 rounded-full flex items-center justify-center mt-1">
                                            <span className="text-white text-xs sm:text-sm font-bold">2</span>
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            No son acumulables con otras promociones.
                                        </p>
                                    </li>
                                    
                                    <li className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-pink-500 rounded-full flex items-center justify-center mt-1">
                                            <span className="text-white text-xs sm:text-sm font-bold">3</span>
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Están sujetas a disponibilidad de producto y zonas de cobertura.
                                        </p>
                                    </li>
                                    
                                    <li className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-pink-500 rounded-full flex items-center justify-center mt-1">
                                            <span className="text-white text-xs sm:text-sm font-bold">4</span>
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            No aplican para entregas fuera de área o en días feriados, salvo que se indique lo contrario.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Nota adicional */}
                            <div className="mt-8 p-4 sm:p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                                <p className="text-yellow-800 text-sm sm:text-base font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <strong>Nota importante:</strong> La MarquesaSV se reserva el derecho de modificar o cancelar promociones sin previo aviso.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ConditionsPromotions;
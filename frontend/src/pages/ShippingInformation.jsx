import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ShippingInformation = () => {
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
                            Información de envíos
                        </h1>
                        
                        {/* Descripción introductoria */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg mb-8 leading-relaxed"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                En La MarquesaSV ofrecemos servicio de entrega a domicilio en determinadas zonas de El Salvador. A continuación, los detalles clave:
                            </p>
                        </div>

                        {/* Contenido de información - ahora responsive */}
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="space-y-6 sm:space-y-8">
                                
                                {/* 1. Horarios de entrega */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">1</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Horarios de entrega
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16 space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <strong>Lunes a sábado:</strong> 9:00 a.m. – 5:00 p.m.
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                No se realizan entregas los domingos ni feriados (salvo fechas especiales anunciadas).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Tiempo de entrega */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">2</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Tiempo de entrega
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16 space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Se recomienda hacer el pedido con al menos <strong>24 a 48 horas</strong> de anticipación.
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Entregas urgentes pueden estar sujetas a disponibilidad con un cargo adicional.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Cobertura */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">3</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Cobertura
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Realizamos entregas en áreas seleccionadas dentro del <strong>área metropolitana de San Salvador</strong>. Consultar con antelación si la zona es cubierta.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Información requerida */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">4</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Información requerida
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            El cliente debe proporcionar:
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Dirección completa y exacta
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Nombre del destinatario
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Número de contacto activo
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nota importante */}
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded-r-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-red-800 text-sm sm:text-base font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <strong>Importante:</strong> La MarquesaSV no se hace responsable por retrasos o entregas fallidas debido a información incorrecta o ausencia del destinatario.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ShippingInformation;
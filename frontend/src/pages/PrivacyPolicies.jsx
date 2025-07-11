// Importe los componentes necesarios
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const PrivacyPolicies = () => {
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
                            Políticas de Privacidad
                        </h1>
                        
                        {/* Descripción introductoria */}
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                <p
                                    className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    En La MarquesaSV, respetamos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros.
                                    Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tus datos.
                                </p>
                            </div>
                        </div>

                        {/* Contenido de políticas - ahora responsive */}
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="space-y-6 sm:space-y-8">
                                
                                {/* 1. Información que recopilamos */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">1</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Información que recopilamos
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16 space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Nombre completo
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Dirección de entrega
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Teléfono de contacto
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Correo electrónico
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Datos de facturación y pago (cuando aplica)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Uso de la información */}
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">2</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Uso de la información
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Utilizamos tus datos para:
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Procesar pedidos
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Enviar confirmaciones y actualizaciones
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Mejorar nuestros servicios
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <p className="text-gray-700 text-sm sm:text-base lg:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Ofrecer promociones personalizadas con tu consentimiento
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Protección de datos */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">3</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Protección de datos
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                La información recopilada es <strong>confidencial</strong> y está protegida por medidas de seguridad físicas, digitales y administrativas.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Compartición con terceros */}
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">4</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Compartición con terceros
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <strong>No compartimos</strong> tu información con terceros, excepto en casos necesarios para completar el servicio (por ejemplo, plataformas de pago o mensajería).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Derechos del usuario */}
                                <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 sm:p-8 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4 sm:mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl font-bold">5</span>
                                        </div>
                                        <h3 className="ml-4 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Derechos del usuario
                                        </h3>
                                    </div>
                                    <div className="ml-0 sm:ml-16">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                Tienes derecho a <strong>acceder, corregir o eliminar</strong> tus datos personales escribiéndonos a: 
                                                <a href="mailto:marquesasv@gmail.com" className="text-red-600 hover:text-red-800 font-semibold ml-1 underline">
                                                    marquesasv@gmail.com
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nota de contacto */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400 p-4 sm:p-6 rounded-r-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-gray-700 text-sm sm:text-base font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <strong>¿Tienes preguntas sobre nuestras políticas de privacidad?</strong> No dudes en contactarnos. Tu privacidad es nuestra prioridad.
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

export default PrivacyPolicies;
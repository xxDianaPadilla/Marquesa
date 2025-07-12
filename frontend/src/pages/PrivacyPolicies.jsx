import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const PrivacyPolicies = () => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
                {/* Header de la página */}
                <Header />

                {/* Contenido principal */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section con título principal */}
                    <div className="text-center mb-16">
                        {/* Decoración superior */}
                        <div className="flex justify-center mb-6">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-rose-300 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-3 h-3 bg-rose-300 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>

                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Políticas de Privacidad
                        </h1>

                        {/* Línea decorativa */}
                        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mb-8"></div>

                        {/* Descripción introductoria */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 max-w-4xl mx-auto">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <p
                                className="text-gray-700 text-lg sm:text-xl leading-relaxed text-center"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                En La MarquesaSV, respetamos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros.
                                Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tus datos.
                            </p>
                        </div>
                    </div>

                    {/* Contenido de políticas en tarjetas elegantes */}
                    <div className="space-y-8">
                        
                        {/* 1. Información que recopilamos */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-white text-xl font-bold">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Información que recopilamos
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Nombre completo",
                                            "Dirección de entrega", 
                                            "Teléfono de contacto",
                                            "Correo electrónico",
                                            "Datos de facturación y pago (cuando aplica)"
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                                <p className="text-gray-700 text-base sm:text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Uso de la información */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-white text-xl font-bold">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Uso de la información
                                    </h3>
                                    <p className="text-gray-700 text-lg font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Utilizamos tus datos para:
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Procesar pedidos",
                                            "Enviar confirmaciones y actualizaciones",
                                            "Mejorar nuestros servicios",
                                            "Ofrecer promociones personalizadas con tu consentimiento"
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                                <p className="text-gray-700 text-base sm:text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Protección de datos */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-white text-xl font-bold">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Protección de datos
                                    </h3>
                                    <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-400">
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-gray-700 text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                La información recopilada es <strong>confidencial</strong> y está protegida por medidas de seguridad físicas, digitales y administrativas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Compartición con terceros */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-white text-xl font-bold">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Compartición con terceros
                                    </h3>
                                    <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-400">
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-gray-700 text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <strong>No compartimos</strong> tu información con terceros, excepto en casos necesarios para completar el servicio (por ejemplo, plataformas de pago o mensajería).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Derechos del usuario */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-white text-xl font-bold">5</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Derechos del usuario
                                    </h3>
                                    <div className="bg-rose-50 rounded-2xl p-6 border-l-4 border-rose-400">
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 text-rose-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    Tienes derecho a <strong>acceder, corregir o eliminar</strong> tus datos personales escribiéndonos a:
                                                </p>
                                                <a 
                                                    href="mailto:marquesasv@gmail.com" 
                                                    className="inline-flex items-center space-x-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                    <span>marquesasv@gmail.com</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nota de contacto final */}
                        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl shadow-xl p-8 sm:p-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-white text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¿Tienes preguntas sobre nuestras políticas de privacidad?
                            </h4>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                No dudes en contactarnos. Tu privacidad es nuestra prioridad.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicies;
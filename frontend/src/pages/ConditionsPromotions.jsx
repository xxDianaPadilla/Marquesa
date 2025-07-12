import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ConditionsPromotions = () => {
    return (
        <>
            <div className="min-h-screen bg-white-50">
                {/* Header de la página */}
                <Header />

                {/* Contenido principal */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section con título principal */}
                    <div className="text-center mb-16">
                        {/* Decoración superior */}
                        <div className="flex justify-center mb-6">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FDB4B7' }}></div>
                                <div className="w-3 h-3 rounded-full animate-pulse delay-75" style={{ backgroundColor: '#F2C6C2' }}></div>
                                <div className="w-3 h-3 rounded-full animate-pulse delay-150" style={{ backgroundColor: '#FDB4B7' }}></div>
                            </div>
                        </div>

                        <h1
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent mb-6 px-4"
                            style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                backgroundImage: 'linear-gradient(to right, #FF6A5F, #FDB4B7)'
                            }}
                        >
                            Condiciones de Ofertas y Promociones
                        </h1>

                        {/* Línea decorativa */}
                        <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ background: 'linear-gradient(to right, #F2C6C2, #FADDDD)' }}></div>

                        {/* Descripción introductoria */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #FDB4B7)' }}>
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <p
                                className="text-lg sm:text-xl leading-relaxed text-center"
                                style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}
                            >
                                Las ofertas o promociones que se publiquen a través de nuestras redes sociales o sitio web están sujetas a los siguientes términos:
                            </p>
                        </div>
                    </div>

                    {/* Contenido de condiciones en tarjetas elegantes */}
                    <div className="space-y-8 mb-12">
                        
                        {/* Tarjeta principal con todas las condiciones */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-6" style={{ background: 'linear-gradient(to bottom right, #FADDDD, #F2C6C2)' }}>
                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                    Términos de nuestras promociones
                                </h2>
                            </div>

                            {/* Grid de condiciones */}
                            <div className="grid md:grid-cols-2 gap-6">
                                
                                {/* Condición 1 */}
                                <div className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: '#BEF7FF', borderColor: '#CCCCCC', borderWidth: '1px' }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#3C3550' }}>
                                            <span className="text-white text-lg font-bold">1</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                Vigencia limitada
                                            </h3>
                                            <p className="text-base leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Aplican únicamente dentro del período de vigencia especificado.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Condición 2 */}
                                <div className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: '#FADDDD', borderColor: '#CCCCCC', borderWidth: '1px' }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#3C3550' }}>
                                            <span className="text-white text-lg font-bold">2</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                No acumulables
                                            </h3>
                                            <p className="text-base leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                No son acumulables con otras promociones.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Condición 3 */}
                                <div className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: '#F2C6C2', borderColor: '#CCCCCC', borderWidth: '1px' }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#3C3550' }}>
                                            <span className="text-white text-lg font-bold">3</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                Sujetas a disponibilidad
                                            </h3>
                                            <p className="text-base leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Están sujetas a disponibilidad de producto y zonas de cobertura.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Condición 4 */}
                                <div className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: '#FDB4B7', borderColor: '#CCCCCC', borderWidth: '1px' }}>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: '#3C3550' }}>
                                            <span className="text-white text-lg font-bold">4</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                Restricciones de entrega
                                            </h3>
                                            <p className="text-base leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                No aplican para entregas fuera de área o en días feriados, salvo que se indique lo contrario.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nota importante */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10" style={{ background: 'linear-gradient(to right, #FF6A5F, #FDB4B7)' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Nota importante
                                    </h4>
                                    <p className="text-white text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        <strong>La MarquesaSV se reserva el derecho de modificar o cancelar promociones sin previo aviso.</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje final */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(to right, #FDB4B7, #F2C6C2)' }}>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-white text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Promociones especiales
                            </h4>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Mantente atento a nuestras redes sociales para descubrir ofertas exclusivas y promociones limitadas.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ConditionsPromotions;
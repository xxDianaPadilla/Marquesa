import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ShippingInformation = () => {
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
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent mb-6"
                            style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                backgroundImage: 'linear-gradient(to right, #FF6A5F, #FDB4B7)'
                            }}
                        >
                            Información de Envíos
                        </h1>

                        {/* Línea decorativa */}
                        <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ background: 'linear-gradient(to right, #F2C6C2, #FADDDD)' }}></div>

                        {/* Descripción introductoria */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #FDB4B7)' }}>
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                                    </svg>
                                </div>
                            </div>
                            <p
                                className="text-lg sm:text-xl leading-relaxed text-center"
                                style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}
                            >
                                En La MarquesaSV ofrecemos servicio de entrega a domicilio en determinadas zonas de El Salvador. A continuación, los detalles clave:
                            </p>
                        </div>
                    </div>

                    {/* Contenido de información en tarjetas elegantes */}
                    <div className="space-y-8">
                        
                        {/* 1. Horarios de entrega */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #BEF7FF, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Horarios de entrega
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* Horario de lunes a sábado */}
                                        <div className="rounded-2xl p-6" style={{ backgroundColor: '#BEF7FF', borderLeftColor: '#3C3550', borderLeftWidth: '4px' }}>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <svg className="w-6 h-6" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <h4 className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                    Lunes a sábado
                                                </h4>
                                            </div>
                                            <p className="text-base font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                9:00 a.m. – 5:00 p.m.
                                            </p>
                                        </div>
                                        
                                        {/* Días sin servicio */}
                                        <div className="rounded-2xl p-6" style={{ backgroundColor: '#CCCCCC', borderLeftColor: '#999999', borderLeftWidth: '4px' }}>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <svg className="w-6 h-6" style={{ color: '#999999' }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                </svg>
                                                <h4 className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                                    Sin entregas
                                                </h4>
                                            </div>
                                            <p className="text-base font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Domingos y feriados (salvo fechas especiales anunciadas)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tiempo de entrega */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Tiempo de entrega
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Pedido con anticipación */}
                                        <div className="rounded-2xl p-6" style={{ backgroundColor: '#F2C6C2', borderLeftColor: '#FDB4B7', borderLeftWidth: '4px' }}>
                                            <div className="flex items-start space-x-4">
                                                <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                    Se recomienda hacer el pedido con al menos <strong>24 a 48 horas</strong> de anticipación.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Entregas urgentes */}
                                        <div className="rounded-2xl p-6" style={{ backgroundColor: '#FDB4B7', borderLeftColor: '#FF6A5F', borderLeftWidth: '4px' }}>
                                            <div className="flex items-start space-x-4">
                                                <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#000000' }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                    Entregas urgentes pueden estar sujetas a disponibilidad con un cargo adicional.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Cobertura */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #FADDDD, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Cobertura
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#FADDDD', borderLeftColor: '#F2C6C2', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Realizamos entregas en áreas seleccionadas dentro del <strong>área metropolitana de San Salvador</strong>. Consultar con antelación si la zona es cubierta.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Información requerida */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6 mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #FDB4B7, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Información requerida
                                    </h3>
                                    <p className="text-lg font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        El cliente debe proporcionar:
                                    </p>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {[
                                            { icon: "📍", title: "Dirección completa", desc: "Dirección exacta y detallada" },
                                            { icon: "👤", title: "Nombre del destinatario", desc: "Nombre completo de quien recibe" },
                                            { icon: "📱", title: "Número de contacto", desc: "Teléfono activo y disponible" }
                                        ].map((item, index) => (
                                            <div key={index} className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#BEF7FF' }}>
                                                <div className="text-3xl mb-3">{item.icon}</div>
                                                <h4 className="font-bold text-base mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#000000' }}>
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nota importante */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10" style={{ backgroundColor: '#FF6A5F', borderColor: '#FDB4B7', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white text-xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Importante
                                    </h4>
                                    <p className="text-white text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        La MarquesaSV no se hace responsable por retrasos o entregas fallidas debido a información incorrecta o ausencia del destinatario.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje final */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(to right, #FDB4B7, #F2C6C2)' }}>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-white text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Entregas confiables
                            </h4>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Llevamos tus flores favoritas directamente hasta tu puerta con el mayor cuidado.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ShippingInformation;
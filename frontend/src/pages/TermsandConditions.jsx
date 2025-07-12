import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const TermsandConditions = () => {
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
                            Términos y Condiciones
                        </h1>

                        {/* Línea decorativa */}
                        <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ background: 'linear-gradient(to right, #F2C6C2, #FADDDD)' }}></div>

                        {/* Descripción introductoria */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #FDB4B7)' }}>
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <p
                                className="text-lg sm:text-xl leading-relaxed text-center"
                                style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}
                            >
                                Al utilizar los servicios de La MarquesaSV, aceptas los siguientes términos:
                            </p>
                        </div>
                    </div>

                    {/* Contenido de términos en tarjetas elegantes */}
                    <div className="space-y-8">
                        
                        {/* 1. Pedidos */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #BEF7FF, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">1</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Pedidos
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#BEF7FF', borderLeftColor: '#3C3550', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Todos los pedidos deben realizarse a través de nuestros canales oficiales
                                                (redes sociales, sitio web o WhatsApp). El pago debe completarse antes de la elaboración del arreglo floral.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Productos */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">2</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Productos
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#F2C6C2', borderLeftColor: '#FDB4B7', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M2 9.5A3.5 3.5 0 005.5 13H9v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 15.586V13h3.5a3.5 3.5 0 100-7H11V3.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 3.414V6H5.5A3.5 3.5 0 002 9.5z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Nuestros arreglos pueden variar ligeramente en diseño y flores según disponibilidad estacional,
                                                pero se respeta siempre el estilo y calidad ofrecidos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Precios */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #FADDDD, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">3</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Precios
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#FADDDD', borderLeftColor: '#F2C6C2', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Los precios están expresados en dólares estadounidenses (USD) e incluyen IVA. Los costos de envío pueden variar según la zona.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Cancelaciones y reembolsos */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #FDB4B7, #3C3550)' }}>
                                    <span className="text-white text-xl font-bold">4</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Cancelaciones y reembolsos
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#FDB4B7', borderLeftColor: '#FF6A5F', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#000000' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Los pedidos pueden cancelarse hasta 48 horas después de la fecha que se emitió la orden del pedido.
                                                No se hacen reembolsos por cancelaciones fuera de ese plazo o por errores en los datos proporcionados por el cliente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Uso del contenido */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #FF6A5F, #FDB4B7)' }}>
                                    <span className="text-white text-xl font-bold">5</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Uso del contenido
                                    </h3>
                                    <div className="rounded-2xl p-6" style={{ backgroundColor: '#F2C6C2', borderLeftColor: '#FDB4B7', borderLeftWidth: '4px' }}>
                                        <div className="flex items-start space-x-4">
                                            <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                                Todo el contenido visual, logotipos y fotografías pertenecen a La MarquesaSV y no puede ser usado sin autorización previa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mensaje final */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10 text-center" style={{ background: 'linear-gradient(to right, #FDB4B7, #F2C6C2)' }}>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-white text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Términos aceptados
                            </h4>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Al usar nuestros servicios, confirmas que has leído y aceptado estos términos y condiciones.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default TermsandConditions;
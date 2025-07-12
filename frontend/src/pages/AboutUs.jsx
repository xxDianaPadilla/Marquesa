import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const AboutUs = () => {
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
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-6"
                            style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                backgroundImage: 'linear-gradient(to right, #FF6A5F, #FDB4B7)'
                            }}
                        >
                            Sobre Nosotros
                        </h1>

                        {/* Línea decorativa */}
                        <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ background: 'linear-gradient(to right, #F2C6C2, #FADDDD)' }}></div>
                    </div>

                    {/* Contenido principal en tarjetas elegantes */}
                    <div className="space-y-8">
                        {/* Primera tarjeta */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #F2C6C2, #FDB4B7)' }}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Nuestra Esencia
                                    </h3>
                                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        En La Marquesa, creemos que cada detalle cuenta y que las flores son el lenguaje perfecto para expresar emociones. 
                                        Somos una tienda de arreglos florales ubicada en El Salvador, especializada en crear diseños únicos, personalizados y
                                        llenos de significado para cada ocasión especial.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Segunda tarjeta */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #FADDDD, #F2C6C2)' }}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Nuestro Estilo
                                    </h3>
                                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        Nos caracterizamos por un estilo visual elegante y minimalista, reflejado en cada uno de nuestros productos, empaques y comunicación.
                                        Nuestro logotipo, inspirado en pequeños botones de flor y detalles de regalo, representa la esencia de lo que somos: 
                                        creadores de momentos especiales que florecen con amor y dedicación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tercera tarjeta */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #FDB4B7, #FADDDD)' }}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Nuestra Identidad
                                    </h3>
                                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        Utilizamos una paleta de colores suaves y delicados, combinando tonos pastel como el rosa, azul y blanco, con acentos modernos en negro y gris. 
                                        Esta identidad se extiende a nuestras redes sociales, donde compartimos de forma cercana y creativa el arte que ponemos en cada arreglo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cuarta tarjeta */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300" style={{ borderColor: '#FADDDD', borderWidth: '1px' }}>
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #FADDDD, #FDB4B7)' }}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}>
                                        Nuestro Propósito
                                    </h3>
                                    <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        Ya sea para cumpleaños, aniversarios, bodas, condolencias o simplemente para alegrar el día de alguien especial, nuestros arreglos buscan 
                                        transmitir emociones auténticas. Más que flores, entregamos sentimientos, historias y recuerdos imborrables.
                                    </p>
                                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                        Déjanos ser parte de tus momentos más importantes, llevando belleza, color y vida a cada uno de ellos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta final con mensaje especial */}
                        <div className="rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 text-center" style={{ background: 'linear-gradient(to right, #FF6A5F, #FDB4B7)' }}>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-white text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                La Marquesa
                            </p>
                            <p className="text-white/90 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Dedicados a realizar detalles únicos
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default AboutUs;
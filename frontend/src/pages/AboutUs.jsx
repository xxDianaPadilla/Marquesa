// Importe los componentes necesarios
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const AboutUs = () => {
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
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Sobre Nosotros
                        </h1>
                        <br />
                        <br />
                        
                        {/* Contenido del texto - Responsive */}
                        <div className="text-justify mb-8 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                En La Marquesa, creemos que cada detalle cuenta y que las flores son el lenguaje perfecto para expresar emociones. 
                                Somos una tienda de arreglos florales ubicada en El Salvador, especializada en crear diseños únicos, personalizados y
                                llenos de significado para cada ocasión especial.
                            </p>
                            
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Nos caracterizamos por un estilo visual elegante y minimalista, reflejado en cada uno de nuestros productos, empaques y comunicación.
                                Nuestro logotipo, inspirado en pequeños botones de flor y detalles de regalo, representa la esencia de lo que somos: 
                                creadores de momentos especiales que florecen con amor y dedicación.
                            </p>
                            
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Utilizamos una paleta de colores suaves y delicados, combinando tonos pastel como el rosa, azul y blanco, con acentos modernos en negro y gris. 
                                Esta identidad se extiende a nuestras redes sociales, donde compartimos de forma cercana y creativa el arte que ponemos en cada arreglo.
                            </p>
                            
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Ya sea para cumpleaños, aniversarios, bodas, condolencias o simplemente para alegrar el día de alguien especial, nuestros arreglos buscan 
                                transmitir emociones auténticas. Más que flores, entregamos sentimientos, historias y recuerdos imborrables.
                            </p>
                            
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Déjanos ser parte de tus momentos más importantes, llevando belleza, color y vida a cada uno de ellos. 
                            </p>
                            
                            <p
                                className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed font-medium text-center mt-8"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                La Marquesa — Dedicados a realizar detalles únicos
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
/**
 * Componente AboutUs - Página "Sobre Nosotros" de La Marquesa
 * 
 * Funcionalidades principales:
 * - Información detallada sobre la empresa
 * - Secciones organizadas con tarjetas informativas
 * - Diseño responsivo y atractivo
 * - Mensaje final con call-to-action
 * 
 * Componentes utilizados:
 * - Header/Footer (existentes)
 * - PageTitle (nuevo)
 * - InfoCard (nuevo)
 * - GradientCard (nuevo)
 * - Container 
 */

import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

// Componentes nuevos reutilizables
import PageTitle from "../components/PageTitle";
import InfoCard from "../components/InfoCard";
import GradientCard from "../components/GradientCard";
import Container from "../components/Container";

const AboutUs = () => {
    /**
     * Datos de las secciones informativas de la empresa
     */
    const aboutSections = [
        {
            id: 1,
            icon: (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            ),
            title: "Nuestra Esencia",
            description: (
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                    En marquesa creemos en los detalles únicos, porque somos una tienda especializada en los
                    detalles personalizados, estamos ubicados en San Salvador. Nuestros diversos arreglos
                    tienen un significado especial para cada cliente.
                </p>
            ),
            backgroundColor: '#BEF7FF',
            borderColor: '#3C3550',
            iconBg: 'linear-gradient(to bottom right, #FADDDD, #FDB4B7)'
        },
        {
            id: 2,
            icon: (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            ),
            title: "Nuestro Estilo",
            description: (
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                    Algo que nos caracteriza es la variedad de productos con los que contamos y que nuestros
                    arreglos son personalizados por los clientes. Cuidamos cada detalle al entregar un arreglo,
                    desde el empaque; buscamos tener una comunicación constante con nuestros clientes para
                    cumplir sus necesidades. El logotipo es parte de nuestra esencia que está inspirado en
                    pequeños botones de flor y detalles de regalo; nos representa siendo creadores de
                    momentos especiales que florecen con amor y dedicación.
                </p>
            ),
            backgroundColor: '#F2C6C2',
            borderColor: '#FDB4B7',
            iconBg: 'linear-gradient(to bottom right, #FADDDD, #F2C6C2)'
        },
        {
            id: 3,
            icon: (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            ),
            title: "Nuestra Identidad",
            description: (
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                    Utilizamos una paleta de colores pasteles para nuestra marca, dónde se puede observar en
                    nuestras redes sociales, y nos permite tener una cercanía con nuestro clientes, mostrando
                    la elaboración de los productos y la creatividad.
                </p>
            ),
            backgroundColor: '#FADDDD',
            borderColor: '#F2C6C2',
            iconBg: 'linear-gradient(to bottom right, #FDB4B7, #FADDDD)'
        },
        {
            id: 4,
            icon: (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ),
            title: "Nuestro Propósito",
            description: (
                <div className="space-y-4">
                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                        Para la diferente ocasión que se nos solicite, cumpleaños, aniversarios, bodas o
                        condolencias o simplemente para alegrar el día a alguien especial, nuestros arreglos
                        buscan transmitir emociones, más que ser detalles únicos, entregamos sentimientos
                        historias y recuerdos inmemorables.
                    </p>
                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                        Marquesa - dedicado a realizar detalles únicos.
                    </p>
                </div>
            ),
            backgroundColor: '#FDB4B7',
            borderColor: '#FF6A5F',
            iconBg: 'linear-gradient(to bottom right, #FADDDD, #FF6A5F)'
        }
    ];

    return (
        <>
            <div className="min-h-screen bg-white-50">
                {/* Header de la página */}
                <Header />

                {/* Contenido principal */}
                <main className="py-12">
                    <Container>
                        {/* Título principal usando componente reutilizable */}
                        <PageTitle
                            title="Sobre Nosotros"
                            subtitle="En Marquesa, respetamos cada detalle y nos comprometemos a crear momentos especiales únicos. Conoce más sobre nuestra historia, valores y compromiso con la excelencia."
                        />

                        {/* Contenido principal en tarjetas elegantes usando InfoCard */}
                        <div className="space-y-8">
                            {aboutSections.map((section) => (
                                <InfoCard
                                    key={section.id}
                                    icon={section.icon}
                                    title={section.title}
                                    description={section.description}
                                    backgroundColor={section.backgroundColor}
                                    borderColor={section.borderColor}
                                    iconBg={section.iconBg}
                                    number={section.id}
                                />
                            ))}

                            {/* Tarjeta final con mensaje especial usando GradientCard */}
                            <GradientCard
                                title="Marquesa"
                                description="Dedicados a realizar detalles únicos"
                                icon={
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                }
                                gradient="linear-gradient(to right, #FF6A5F, #FDB4B7)"
                            />
                        </div>
                    </Container>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default AboutUs;
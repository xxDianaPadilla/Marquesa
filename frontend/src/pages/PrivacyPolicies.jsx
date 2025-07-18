/**
 * Componente PrivacyPolicies - Página de Políticas de Privacidad
 * 
 * Funcionalidades principales:
 * - Información detallada sobre políticas de privacidad
 * - Secciones organizadas con tarjetas informativas
 * - Diseño responsivo y profesional
 * - Enlaces de contacto integrados
 * 
 * Componentes utilizados:
 * - Header/Footer (existentes)
 * - PageTitle (nuevo)
 * - InfoCard (nuevo)
 * - GradientCard (nuevo)
 * - Container (nuevo)
 */

import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

// Componentes nuevos reutilizables
import PageTitle from "../components/PageTitle";
import InfoCard from "../components/InfoCard";
import GradientCard from "../components/GradientCard";
import Container from "../components/Container";

const PrivacyPolicies = () => {
    /**
     * Datos de las secciones de políticas de privacidad
     */
    const privacySections = [
        {
            id: 1,
            title: "Información que recopilamos",
            description: (
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        "Nombre completo",
                        "Dirección de entrega", 
                        "Teléfono de contacto",
                        "Correo electrónico",
                        "Datos de facturación y pago (cuando aplica)"
                    ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-xl" style={{ backgroundColor: '#BEF7FF' }}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3C3550' }}></div>
                            <p className="text-base sm:text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            ),
            backgroundColor: '#BEF7FF',
            borderColor: '#3C3550',
            iconBg: 'linear-gradient(to bottom right, #BEF7FF, #3C3550)'
        },
        {
            id: 2,
            title: "Uso de la información",
            description: (
                <div>
                    <p className="text-lg font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                        Utilizamos tus datos para:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            "Procesar pedidos",
                            "Enviar confirmaciones y actualizaciones",
                            "Mejorar nuestros servicios",
                            "Ofrecer promociones personalizadas con tu consentimiento"
                        ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 rounded-xl" style={{ backgroundColor: '#F2C6C2' }}>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3C3550' }}></div>
                                <p className="text-base sm:text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
            backgroundColor: '#F2C6C2',
            borderColor: '#FDB4B7',
            iconBg: 'linear-gradient(to bottom right, #F2C6C2, #3C3550)'
        },
        {
            id: 3,
            title: "Protección de datos",
            description: (
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#FADDDD', borderLeftColor: '#F2C6C2', borderLeftWidth: '4px' }}>
                    <div className="flex items-start space-x-4">
                        <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                            La información recopilada es <strong>confidencial</strong> y está protegida por medidas de seguridad físicas, digitales y administrativas.
                        </p>
                    </div>
                </div>
            ),
            backgroundColor: '#FADDDD',
            borderColor: '#F2C6C2',
            iconBg: 'linear-gradient(to bottom right, #FADDDD, #3C3550)'
        },
        {
            id: 4,
            title: "Compartición con terceros",
            description: (
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#FDB4B7', borderLeftColor: '#FF6A5F', borderLeftWidth: '4px' }}>
                    <div className="flex items-start space-x-4">
                        <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#000000' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                            <strong>No compartimos</strong> tu información con terceros, excepto en casos necesarios para completar el servicio (por ejemplo, plataformas de pago o mensajería).
                        </p>
                    </div>
                </div>
            ),
            backgroundColor: '#FDB4B7',
            borderColor: '#FF6A5F',
            iconBg: 'linear-gradient(to bottom right, #FDB4B7, #3C3550)'
        },
        {
            id: 5,
            title: "Derechos del usuario",
            description: (
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#F2C6C2', borderLeftColor: '#FDB4B7', borderLeftWidth: '4px' }}>
                    <div className="flex items-start space-x-4">
                        <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#3C3550' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 4-4 .257-.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-base sm:text-lg leading-relaxed mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}>
                                Tienes derecho a <strong>acceder, corregir o eliminar</strong> tus datos personales escribiéndonos a:
                            </p>
                            <a 
                                href="mailto:marquesasv@gmail.com" 
                                className="inline-flex items-center space-x-2 hover:opacity-80 font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    backgroundColor: '#FADDDD',
                                    color: '#3C3550'
                                }}
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
            ),
            backgroundColor: '#F2C6C2',
            borderColor: '#FDB4B7',
            iconBg: 'linear-gradient(to bottom right, #FF6A5F, #FDB4B7)'
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
                            title="Políticas de Privacidad"
                            subtitle="En La MarquesaSV, respetamos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tus datos."
                        />

                        {/* Contenido de políticas en tarjetas elegantes usando InfoCard */}
                        <div className="space-y-8">
                            {privacySections.map((section) => (
                                <InfoCard
                                    key={section.id}
                                    title={section.title}
                                    description={section.description}
                                    backgroundColor={section.backgroundColor}
                                    borderColor={section.borderColor}
                                    iconBg={section.iconBg}
                                    number={section.id}
                                />
                            ))}

                            {/* Nota de contacto final usando GradientCard */}
                            <GradientCard
                                title="¿Tienes preguntas sobre nuestras políticas de privacidad?"
                                description="No dudes en contactarnos. Tu privacidad es nuestra prioridad."
                                icon={
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                }
                                gradient="linear-gradient(to right, #FDB4B7, #F2C6C2)"
                            />
                        </div>
                    </Container>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicies;
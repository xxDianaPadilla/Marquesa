import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ConditionsPromotions = () => {
    return (
        <>
            <div className="min-h-screen bg-pink-100">
                {/* Header de la página */}
                <Header />

                {/* Contenido principal */}
                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Título de la página */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Condiciones de ofertas y promociones
                        </h1>
                        <br />
                        <p
                            className="text-black-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Las ofertas o promociones que se publiquen a través de nuestras redes sociales o sitio web están sujetas a los siguientes términos:
                        </p>
                        <br />
                        <div className="text-justify mb-8" style={{ marginLeft: '110px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Aplican únicamente dentro del período de vigencia especificado.</li>
                                <li>No son acumulables con otras promociones.</li>
                                <li>Están sujetas a disponibilidad de producto y zonas de cobertura.</li>
                                <li>No aplican para entregas fuera de área o en días feriados, salvo que se indique lo contrario.</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ConditionsPromotions;
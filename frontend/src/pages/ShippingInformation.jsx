import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const ShippingInformation = () => {
    return (
        <>
            <div className="min-h-screen bg-white-100">
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
                            Información de envíos
                        </h1>
                        <br />
                        <p
                            className="text-black-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            En La MarquesaSV ofrecemos servicio de entrega a domicilio en determinadas zonas de El Salvador. A continuación, los detalles clave:
                        </p>
                        <br />
                        <div className="text-justify mb-8" style={{ marginLeft: '110px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Horarios de entrega</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ShippingInformation;
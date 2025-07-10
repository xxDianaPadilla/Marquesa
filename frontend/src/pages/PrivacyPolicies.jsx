// Importe los componentes necesarios
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const PrivacyPolicies = () => {
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
                            Políticas de Privacidad
                        </h1>
                        <br />
                        <br />
                        <div className="text-justify mb-8" style={{ marginLeft: '110px' }}>
                        <p
                            className="text-black-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            En La MarquesaSV, respetamos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros.
                            Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos tus datos.
                        </p>
                        <br />
                        <p>   1. Información que recopilamos</p>
                        <ul style={{ listStyle: 'inherit' }}>
                                <li>Nombre completo</li>
                                <li>Dirección de entrega</li>
                                <li>Teléfono de contacto</li>
                                <li>Correo electrónico</li>
                                <li>Datos de facturación y pago (cuando aplica)</li>
                            </ul>
                            <br />
                            <p>   2. Uso de la información: Utilizamos tus datos para:</p>
                        <ul style={{ listStyle: 'inherit' }}>
                                <li>Procesar pedidos</li>
                                <li>Enviar confirmaciones y actualizaciones</li>
                                <li>Mejorar nuestros servicios</li>
                                <li>Ofrecer promociones personalizadas con tu consentimiento</li>
                            </ul>
                            <br />
                            <p>   3. Protección de datos</p>
                            <p>La información recopilada es confidencial y está protegida por medidas de seguridad físicas, digitales y administrativas</p>
                            <br />
                            <p>   4. Compartición con terceros</p>
                            <p>No compartimos tu información con terceros, excepto en casos necesarios para completar el servicio (por ejemplo, plataformas de pago o mensajería).</p>
                            <br />
                            <p>   5. Derechos del usuario</p>
                            <p>Tienes derecho a acceder, corregir o eliminar tus datos personales escribiéndonos a: marquesasv@gmail.com.</p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicies;
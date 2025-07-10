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
                        <div className="text-justify mb-8" style={{ marginLeft: '90px' }}>
                            <ol>
                                <li>1. Horarios de entrega</li>
                            </ol>
                        </div>
                        <div className="text-justify mb-8" style={{ marginLeft: '150px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Lunes a sábado: 9:00 a.m. – 5:00 p.m.</li>
                                <li>No se realizan entregas los domingos ni feriados (salvo fechas especiales anunciadas).</li>
                            </ul>
                        </div>

                        <div className="text-justify mb-8" style={{ marginLeft: '90px' }}>
                            <ol>
                                <li>2. Tiempo de entrega</li>
                            </ol>
                        </div>
                        <div className="text-justify mb-8" style={{ marginLeft: '150px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Se recomienda hacer el pedido con al menos 24 a 48 horas de anticipación.</li>
                                <li>Entregas urgentes pueden estar sujetas a disponibilidad con un cargo adicional</li>
                            </ul>
                        </div>

                        <div className="text-justify mb-8" style={{ marginLeft: '90px' }}>
                            <ol>
                                <li>3. Cobertura</li>
                            </ol>
                        </div>
                        <div className="text-justify mb-8" style={{ marginLeft: '150px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Realizamos entregas en áreas seleccionadas dentro del área metropolitana de San Salvador. Consultar con antelación si la zona es cubierta.</li>
                            </ul>
                        </div>

                        <div className="text-justify mb-8" style={{ marginLeft: '90px' }}>
                            <ol>
                                <li>4. Información requerida</li>
                                <br />
                                <p>El cliente debe proporcionar:</p>
                            </ol>
                        </div>
                        <div className="text-justify mb-8" style={{ marginLeft: '150px' }}>
                            <ul style={{ listStyle: 'inherit' }}>
                                <li>Dirección completa y exacta</li>
                                <li>Nombre del destinatario</li>
                                <li>Número de contacto activo</li>
                            </ul>
                        </div>

                        <p>La MarquesaSV no se hace responsable por retrasos o entregas fallidas debido a información incorrecta o ausencia del destinatario.</p>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default ShippingInformation;
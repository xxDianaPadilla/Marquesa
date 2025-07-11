// Importe los componentes necesarios
import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const TermsandConditions = () => {
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
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 px-4"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Términos y condiciones
                        </h1>
                        <br />
                        <br />

                        {/* Contenido de términos - ahora responsive */}
                        <div className="text-justify mb-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p
                                className="text-gray-600 text-sm sm:text-base mb-6"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Al utilizar los servicios de La MarquesaSV, aceptas los siguientes términos:
                            </p>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        1. Pedidos
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Todos los pedidos deben realizarse a través de nuestros canales oficiales
                                        (redes sociales, sitio web o WhatsApp). El pago debe completarse antes de la elaboración del arreglo floral.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        2. Productos
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Nuestros arreglos pueden variar ligeramente en diseño y flores según disponibilidad estacional,
                                        pero se respeta siempre el estilo y calidad ofrecidos.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        3. Precios
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Los precios están expresados en dólares estadounidenses (USD) e incluyen IVA. Los costos de envío pueden variar según la zona.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        4. Cancelaciones y reembolsos
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Los pedidos pueden cancelarse hasta 48 horas después de la fecha que se emitió la orden del pedido.
                                        No se hacen reembolsos por cancelaciones fuera de ese plazo o por errores en los datos proporcionados por el cliente.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        5. Uso del contenido
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Todo el contenido visual, logotipos y fotografías pertenecen a La MarquesaSV y no puede ser usado sin autorización previa.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default TermsandConditions;
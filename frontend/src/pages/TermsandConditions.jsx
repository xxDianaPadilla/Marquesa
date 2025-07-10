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
                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Título de la página */}
                    <div className="text-center mb-8">
                        <h1
                            className="text-3xl font-bold text-gray-800 mb-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Términos y condiciones
                        </h1>
                        <br />
                        <br />
                        <div className="text-justify mb-8" style={{ marginLeft: '110px' }}>
                        <p
                            className="text-black-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Al utilizar los servicios de La MarquesaSV, aceptas los siguientes términos:
                        </p>
                        <br />
                        <p>   1. Pedidos</p>
                        <p>Todos los pedidos deben realizarse a través de nuestros canales oficiales 
                            (redes sociales, sitio web o WhatsApp). El pago debe completarse antes de la elaboración del arreglo floral.</p>
                            <br />
                        <p>   2. Productos</p>
                        <p>Nuestros arreglos pueden variar ligeramente en diseño y flores según disponibilidad estacional, 
                            pero se respeta siempre el estilo y calidad ofrecidos.</p>
                            <br />
                        <p>   3. Precios</p>
                        <p>Los precios están expresados en dólares estadounidenses (USD) e incluyen IVA. Los costos de envío pueden variar según la zona.</p>
                            <br />
                        <p>   4. Cancelaciones y reembolsos</p>
                        <p>Los pedidos pueden cancelarse hasta 48 horas después de la fecha que se emitió la orden del pedido. 
                            No se hacen reembolsos por cancelaciones fuera de ese plazo o por errores en los datos proporcionados por el cliente.</p>
                            <br />
                        <p>   5. Uso del contenido</p>
                        <p>Todo el contenido visual, logotipos y fotografías pertenecen a La MarquesaSV y no puede ser usado sin autorización previa.</p>
                            <br />
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default TermsandConditions;
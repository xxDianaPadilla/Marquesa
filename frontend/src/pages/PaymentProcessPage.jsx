import React, { useState } from "react";
import Header from "../components/Header/Header"; // Componente para el encabezado de la página
import ProgressSteps from "../components/ProgressSteps"; // Componente que muestra los pasos del proceso
import PaymentOrderSummary from "../components/PaymentOrderSummary"; // Resumen del pedido con el desglose de productos y precios
import ShippingInfo from "../components/ShippingInfo"; // Componente para ingresar información de envío
import PaymentMethodSelection from "../components/PaymentMethodSelection"; // Componente para seleccionar el método de pago
import OrderReview from "../components/OrderReview"; // Componente que permite revisar el pedido antes de confirmar

const PaymentProcessPage = () => {
    // Estado que mantiene el paso actual del proceso de pago (1 - Envío, 2 - Pago, 3 - Revisión)
    const [currentStep, setCurrentStep] = useState(1);

    // Función que avanza al siguiente paso
    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3)); // El paso máximo es el paso 3
    };

    // Función que retrocede al paso anterior
    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1)); // El paso mínimo es el paso 1
    };

    // Función que maneja la confirmación del pedido
    const handleConfirmOrder = () => {
        // Aquí podrás agregar la lógica para procesar el pedido (por ejemplo, llamar a una API de pago)
        alert('¡Pedido realizado con éxito!');
    };

    // Función que renderiza el componente correspondiente según el paso actual
    const renderCurrentComponent = () => {
        switch (currentStep) {
            case 1:
                return <ShippingInfo onNext={handleNextStep} />; // Paso 1: Información de envío
            case 2:
                return <PaymentMethodSelection onNext={handleNextStep} onBack={handlePrevStep} />; // Paso 2: Selección de método de pago
            case 3:
                return (
                    <OrderReview 
                        onBack={handlePrevStep} 
                        onConfirm={handleConfirmOrder} // Paso 3: Revisión del pedido
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Header /> {/* Encabezado de la página */}
            <div className="min-h-screen bg-white-50">
                {/* Componente que muestra el progreso de los pasos */}
                <ProgressSteps currentStep={currentStep} />
                <div className="max-w-6xl mx-auto px-6 pb-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Contenido dinámico que cambia según el paso actual */}
                        <div className="flex-1">
                            {renderCurrentComponent()}
                        </div>
                        {/* Resumen del pedido (se mantiene constante) */}
                        <div className="w-full lg:w-1/3">
                            <PaymentOrderSummary />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentProcessPage;

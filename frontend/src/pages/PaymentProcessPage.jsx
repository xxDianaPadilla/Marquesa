import React, { useState } from "react";
import Header from "../components/Header/Header";
import ProgressSteps from "../components/ProgressSteps";
import PaymentOrderSummary from "../components/PaymentOrderSummary";
import ShippingInfo from "../components/ShippingInfo";
import PaymentMethodSelection from "../components/PaymentMethodSelection";
import OrderReview from "../components/OrderReview";

const PaymentProcessPage = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleConfirmOrder = () => {
        // Aquí podremos agregar la lógica para procesar el pedido
        alert('¡Pedido realizado con éxito!');
    };

    const renderCurrentComponent = () => {
        switch (currentStep) {
            case 1:
                return <ShippingInfo onNext={handleNextStep} />;
            case 2:
                return <PaymentMethodSelection onNext={handleNextStep} onBack={handlePrevStep} />;
            case 3:
                return (
                    <OrderReview 
                        onBack={handlePrevStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white-50">
                <ProgressSteps currentStep={currentStep} />
                <div className="max-w-6xl mx-auto px-6 pb-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            {renderCurrentComponent()}
                        </div>
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
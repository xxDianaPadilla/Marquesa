import React, { useState } from "react";

const ProgressSteps = ({ currentStep = 1 }) => {
    const steps = [
        { number: 1, title: "Envío", active: currentStep >= 1, completed: currentStep > 1 },
        { number: 2, title: "Pago", active: currentStep >= 2, completed: currentStep > 2 },
        { number: 3, title: "Revisión", active: currentStep >= 3, completed: currentStep > 3 }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 bg-white">
            <h1 className="text-2xl text-center font-bold mb-8">Finalizar Compra</h1>
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${step.completed
                                    ? 'bg-green-500'
                                    : step.active
                                        ? 'bg-pink-400'
                                        : 'bg-gray-300'
                                }`}>
                                {step.completed ? '✓' : step.number}
                            </div>
                            <span className="text-sm mt-2 text-gray-600">{step.title}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mx-4 mt-[-20px] ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressSteps;
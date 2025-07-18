// frontend/src/components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ 
    steps, 
    currentStep, 
    className = '',
    showLabels = true 
}) => {
    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className={`w-full ${className}`}>
            {/* Barra de progreso */}
            <div className="relative mb-8">
                <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                    <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ 
                            width: `${progressPercentage}%`, 
                            backgroundColor: '#E8ACD2' 
                        }}
                    ></div>
                </div>

                {/* Pasos con iconos */}
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;
                        
                        return (
                            <div key={step.id || index} className="flex flex-col items-center relative">
                                <div 
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium 
                                        ${isCompleted ? 'text-white' : 
                                          isCurrent ? 'text-white' : 'bg-gray-400 text-gray-500'}
                                    `} 
                                    style={{ 
                                        backgroundColor: isCompleted || isCurrent ? '#E8ACD2' : '' 
                                    }}
                                >
                                    {step.icon || stepNumber}
                                </div>
                                {showLabels && (
                                    <span 
                                        className={`
                                            mt-2 text-sm font-medium 
                                            ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                                        `}
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {step.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
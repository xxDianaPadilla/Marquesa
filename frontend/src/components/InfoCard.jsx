// frontend/src/components/InfoCard.jsx
import React from 'react';

const InfoCard = ({ 
    icon, 
    title, 
    description, 
    backgroundColor = '#BEF7FF',
    borderColor = '#3C3550',
    iconBg = 'linear-gradient(to bottom right, #BEF7FF, #3C3550)',
    number,
    className = '' 
}) => {
    return (
        <div 
            className={`bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300 ${className}`} 
            style={{ borderColor: '#FADDDD', borderWidth: '1px' }}
        >
            <div className="flex items-start space-x-6">
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" 
                    style={{ background: iconBg }}
                >
                    {number ? (
                        <span className="text-white text-xl font-bold">{number}</span>
                    ) : (
                        icon
                    )}
                </div>
                <div className="flex-1">
                    <h3 
                        className="text-2xl sm:text-3xl font-bold mb-4" 
                        style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}
                    >
                        {title}
                    </h3>
                    <div 
                        className="rounded-2xl p-6" 
                        style={{ 
                            backgroundColor, 
                            borderLeftColor: borderColor, 
                            borderLeftWidth: '4px' 
                        }}
                    >
                        <div className="flex items-start space-x-4">
                            {typeof description === 'string' ? (
                                <p 
                                    className="text-base sm:text-lg leading-relaxed" 
                                    style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}
                                >
                                    {description}
                                </p>
                            ) : (
                                description
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
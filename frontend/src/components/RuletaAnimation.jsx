// frontend/src/components/RuletaAnimation.jsx
import React, { useState, useEffect } from 'react';
import ruletaImage from '../assets/ruletaDescuentos.png';

const RuletaAnimation = ({ isSpinning, onSpin, hasSpun }) => {
    const [spinClass, setSpinClass] = useState('');

    const handleClick = () => {
        if (!isSpinning && !hasSpun) {
            onSpin();
        }
    };

    // Controlar la animación manualmente
    useEffect(() => {
        if (isSpinning) {
            setSpinClass('animate-spin-ruleta');
        } else {
            // Resetear la animación después de que termine
            setSpinClass('');
        }
    }, [isSpinning]);

    return (
        <div className="relative flex justify-center items-center">
            {/* Contenedor de la ruleta */}
            <div 
                className={`relative transition-all duration-300 ruleta-container ${
                    !isSpinning && !hasSpun ? 'hover:scale-105 cursor-pointer' : ''
                } ${hasSpun ? 'opacity-75' : ''}`}
                onClick={handleClick}
            >
                {/* Imagen de la ruleta */}
                <img
                    src={ruletaImage}
                    alt="Ruleta de descuentos"
                    className={`w-80 h-80 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] ruleta-image ${spinClass} ${
                        !hasSpun ? 'hover:shadow-2xl' : 'grayscale'
                    }`}
                    style={{
                        filter: hasSpun ? 'grayscale(30%)' : 'none',
                        transformOrigin: 'center center'
                    }}
                />

                {/* Punto central de la ruleta */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-6 h-6 bg-white rounded-full border-4 border-pink-400 shadow-lg z-10 ${
                        isSpinning ? 'animate-pulse' : ''
                    }`}></div>
                </div>

                {/* Overlay de instrucción cuando no ha girado */}
                {!isSpinning && !hasSpun && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30 rounded-full">
                        <div className="bg-white text-gray-800 px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                            <span className="text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¡Haz clic para girar!
                            </span>
                        </div>
                    </div>
                )}

                {/* Estado de giro */}
                {isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full z-20">
                        <div className="bg-white px-8 py-4 rounded-xl shadow-xl animate-fade-in">
                            <div className="flex items-center space-x-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-pink-500"></div>
                                <span className="text-gray-700 font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Girando...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado usado */}
                {hasSpun && !isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 rounded-full z-20">
                        <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl shadow-lg">
                            <span className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Ruleta utilizada
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Efectos de partículas durante el giro */}
            {isSpinning && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-4 h-4 rounded-full animate-float-up"
                            style={{
                                backgroundColor: ['#FF69B4', '#FFB6C1', '#DDA0DD', '#98FB98', '#FFE4B5', '#FFA07A'][i % 6],
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '2s'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Indicador de que se puede hacer clic */}
            {!isSpinning && !hasSpun && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        <span style={{ fontFamily: 'Poppins, sans-serif' }}>👆 ¡Haz clic!</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuletaAnimation;
// frontend/src/components/RuletaAnimation.jsx
import React, { useState, useEffect } from 'react';
import ruletaImage from '../assets/ruletaDescuentos.png';

const RuletaAnimation = ({ isSpinning, onSpin, hasSpun }) => {
    const [spinClass, setSpinClass] = useState('');
    const [showFullscreen, setShowFullscreen] = useState(false);

    const handleClick = () => {
        if (!isSpinning && !hasSpun) {
            setShowFullscreen(true);
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
            // Ocultar fullscreen después de un tiempo
            if (showFullscreen) {
                setTimeout(() => {
                    setShowFullscreen(false);
                }, 1000);
            }
        }
    }, [isSpinning, showFullscreen]);

    return (
        <>
            {/* Ruleta normal en la página */}
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
                        className={`w-80 h-80 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] ruleta-image ${
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

                {/* Indicador de que se puede hacer clic */}
                {!isSpinning && !hasSpun && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>👆 ¡Haz clic!</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay fullscreen durante el giro */}
            {showFullscreen && isSpinning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    {/* Contenedor principal centrado */}
                    <div className="relative flex flex-col items-center justify-center">
                        {/* Ruleta grande centrada */}
                        <div className="relative">
                            <img
                                src={ruletaImage}
                                alt="Ruleta de descuentos"
                                className={`w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] ${spinClass} drop-shadow-2xl`}
                                style={{
                                    transformOrigin: 'center center'
                                }}
                            />
                            
                            {/* Punto central brillante */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-8 bg-white rounded-full border-4 border-pink-400 shadow-2xl animate-pulse"></div>
                            </div>
                        </div>

                        {/* Texto de estado */}
                        <div className="mt-8 bg-white bg-opacity-90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-2xl animate-fade-in">
                            <div className="flex items-center space-x-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-pink-500"></div>
                                <span className="text-gray-800 font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    ¡La ruleta está girando!
                                </span>
                            </div>
                        </div>

                        {/* Efectos de partículas durante el giro */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-float-particle"
                                    style={{
                                        width: `${Math.random() * 8 + 4}px`,
                                        height: `${Math.random() * 8 + 4}px`,
                                        backgroundColor: ['#FF69B4', '#FFB6C1', '#DDA0DD', '#98FB98', '#FFE4B5', '#FFA07A', '#E8ACD2', '#FADDDD', '#C6E2C6'][i % 9],
                                        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                                        top: `${10 + Math.random() * 80}%`,
                                        left: `${10 + Math.random() * 80}%`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: `${2 + Math.random() * 2}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Confeti de fondo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={`confetti-${i}`}
                                className="absolute animate-confetti-fall"
                                style={{
                                    width: `${Math.random() * 6 + 2}px`,
                                    height: `${Math.random() * 6 + 2}px`,
                                    backgroundColor: ['#FADDDD', '#E8ACD2', '#C6E2C6', '#FF69B4', '#FFB6C1', '#DDA0DD'][i % 6],
                                    borderRadius: Math.random() > 0.7 ? '50%' : '0%',
                                    top: '-10px',
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 4}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Estilos CSS personalizados */}
            <style jsx>{`
                @keyframes spin-ruleta {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(1800deg); }
                }

                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                @keyframes float-particle {
                    0% { 
                        transform: translateY(0px) scale(0); 
                        opacity: 1; 
                    }
                    50% { 
                        transform: translateY(-100px) scale(1); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: translateY(-200px) scale(0); 
                        opacity: 0; 
                    }
                }

                @keyframes confetti-fall {
                    0% { 
                        transform: translateY(-10px) rotate(0deg); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(100vh) rotate(720deg); 
                        opacity: 0; 
                    }
                }

                .animate-spin-ruleta {
                    animation: spin-ruleta 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                .animate-float-particle {
                    animation: float-particle 2s ease-out infinite;
                }

                .animate-confetti-fall {
                    animation: confetti-fall 3s linear infinite;
                }
            `}</style>
        </>
    );
};

export default RuletaAnimation;
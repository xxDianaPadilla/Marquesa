// frontend/src/components/RuletaAnimation.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ruletaImage from '../assets/ruletaDescuentos.png';

const RuletaAnimation = ({ isSpinning, onSpin, hasSpun, showResult }) => {
    const [spinClass, setSpinClass] = useState('');
    const [showFullscreen, setShowFullscreen] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleClick = () => {
        // Verificar autenticación antes de permitir el giro
        if (!isAuthenticated) {
            console.log('Usuario no autenticado, no puede girar la ruleta');
            return;
        }

        if (!isSpinning && !hasSpun) {
            console.log('🎯 Iniciando animación de ruleta...');
            setShowFullscreen(true);
            onSpin();
        }
    };

    // Controlar la animación manualmente - AJUSTADO PARA MANTENER FULLSCREEN
    useEffect(() => {
        if (isSpinning) {
            setSpinClass('animate-spin-ruleta');
        } else {
            // IMPORTANTE: Solo resetear la clase de animación, NO ocultar fullscreen aquí
            setSpinClass('');
            
            // El fullscreen se ocultará cuando aparezca el modal (showResult = true)
            if (showFullscreen && showResult) {
                setTimeout(() => {
                    setShowFullscreen(false);
                }, 300); // Pequeño delay para transición suave al modal
            }
        }
    }, [isSpinning, showFullscreen, showResult]);

    return (
        <>
            {/* Ruleta normal en la página */}
            <div className="relative flex justify-center items-center">
                {/* Contenedor de la ruleta */}
                <div 
                    className={`relative transition-all duration-300 ruleta-container ${
                        !isSpinning && !hasSpun && isAuthenticated ? 'hover:scale-105 cursor-pointer' : ''
                    } ${hasSpun ? 'opacity-75' : ''} ${!isAuthenticated ? 'opacity-60' : ''}`}
                    onClick={handleClick}
                >
                    {/* Imagen de la ruleta - RESTAURADA LÓGICA ORIGINAL */}
                    <img
                        src={ruletaImage}
                        alt="Ruleta de descuentos"
                        className={`w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px] ruleta-image ${
                            !hasSpun && isAuthenticated ? 'hover:shadow-2xl' : 'grayscale'
                        } ${spinClass}`}
                        style={{
                            filter: hasSpun || !isAuthenticated ? 'grayscale(30%)' : 'none',
                            transformOrigin: 'center center'
                        }}
                    />

                    {/* Punto central de la ruleta */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white rounded-full border-2 sm:border-3 md:border-4 border-pink-400 shadow-lg z-10 ${
                            isSpinning ? 'animate-pulse' : ''
                        }`}></div>
                    </div>

                    {/* Overlay de instrucción cuando no ha girado y está autenticado */}
                    {!isSpinning && !hasSpun && isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30 rounded-full">
                            <div className="bg-white text-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                                <span className="text-sm sm:text-base md:text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    ¡Haz clic para girar!
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Overlay para usuarios no autenticados */}
                    {!isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 rounded-full z-20">
                            <div className="bg-gray-100 text-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg text-center">
                                <span className="font-bold text-sm sm:text-base md:text-lg block mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Inicia sesión
                                </span>
                                <span className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    para girar la ruleta
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Estado usado */}
                    {hasSpun && !isSpinning && isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 rounded-full z-20">
                            <div className="bg-gray-100 text-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg">
                                <span className="font-bold text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Ruleta utilizada
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Indicador de que se puede hacer clic */}
                {!isSpinning && !hasSpun && isAuthenticated && (
                    <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="bg-pink-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>👆 ¡Haz clic!</span>
                        </div>
                    </div>
                )}

                {/* Indicador para usuarios no autenticados */}
                {!isAuthenticated && (
                    <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>🔒 Inicia sesión</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay fullscreen durante el giro - MANTENIDO HASTA EL MODAL */}
            {showFullscreen && isAuthenticated && !showResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
                    {/* Contenedor principal centrado */}
                    <div className="relative flex flex-col items-center justify-center">
                        {/* Ruleta grande centrada */}
                        <div className="relative">
                            <img
                                src={ruletaImage}
                                alt="Ruleta de descuentos"
                                className={`w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] ${spinClass} drop-shadow-2xl`}
                                style={{
                                    transformOrigin: 'center center'
                                }}
                            />
                            
                            {/* Punto central brillante */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full border-3 sm:border-4 border-pink-400 shadow-2xl animate-pulse"></div>
                            </div>
                        </div>

                        {/* Texto de estado - ACTUALIZADO */}
                        <div className="mt-6 sm:mt-8 bg-white bg-opacity-90 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl animate-fade-in">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                {isSpinning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-3 sm:border-b-4 border-pink-500"></div>
                                        <span className="text-gray-800 font-bold text-lg sm:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            ¡La ruleta está girando!
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-3 sm:border-b-4 border-green-500"></div>
                                        <span className="text-gray-800 font-bold text-lg sm:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            ¡Generando tu código!
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Efectos de partículas durante todo el proceso */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute animate-float-particle"
                                    style={{
                                        width: `${Math.random() * 6 + 4}px`,
                                        height: `${Math.random() * 6 + 4}px`,
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

                    {/* Confeti de fondo durante todo el proceso */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={`confetti-${i}`}
                                className="absolute animate-confetti-fall"
                                style={{
                                    width: `${Math.random() * 4 + 3}px`,
                                    height: `${Math.random() * 4 + 3}px`,
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

            {/* Estilos CSS personalizados - RESTAURADOS ORIGINALES */}
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
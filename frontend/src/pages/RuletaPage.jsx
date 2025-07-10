import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import RuletaAnimation from '../components/RuletaAnimation';
import ResultModal from '../components/ResultModal';
import { useRuleta } from '../components/Ruleta/Hooks/useRuleta';

const RuletaPage = () => {
    const navigate = useNavigate();
    const {
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        spinRuleta,
        resetRuleta,
        closeResult,
        copyToClipboard
    } = useRuleta();

    const handleStartShopping = () => {
        navigate('/');
    };

    return (
        <div >
            {/* Header */}
            <Header />

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Título principal */}
                <div className="text-center mb-8">
                    <h1 
                        className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Ruleta marquesa
                    </h1>
                </div>

                {/* Layout principal - Imagen a la izquierda, códigos a la derecha */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    
                    {/* Sección izquierda - Ruleta */}
                    <div className="flex flex-col items-center">
                        <RuletaAnimation 
                            isSpinning={isSpinning}
                            onSpin={spinRuleta}
                            hasSpun={hasSpun}
                        />
                        
                        {/* Mensaje debajo de la ruleta */}
                        <div className="text-center mt-6">
                            {!hasSpun && !isSpinning && (
                                <p 
                                    className="text-gray-700 text-lg font-medium"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    ¡Haz clic en la ruleta para obtener tu descuento!
                                </p>
                            )}
                            {isSpinning && (
                                <p 
                                    className="text-gray-700 text-lg font-medium animate-pulse"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    ¡La ruleta está girando! Espera tu resultado...
                                </p>
                            )}
                            {hasSpun && (
                                <div className="space-y-4">
                                    <p 
                                        className="text-gray-600 text-lg"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        ¡Ya has utilizado la ruleta!
                                    </p>
                                    <button
                                        onClick={resetRuleta}
                                        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                    >
                                        Intentar de nuevo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección derecha - Códigos obtenidos */}
                    <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-200">
                        <h2 
                            className="text-2xl font-bold text-gray-800 mb-6 text-center"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Códigos obtenidos
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Código Verano 2025 */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span 
                                        className="text-xl font-bold text-gray-900"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Verano 2025
                                    </span>
                                    <span 
                                        className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                        style={{ backgroundColor: '#E8ACD2' }}
                                    >
                                        25% OFF
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Válido hasta:
                                        </span>
                                        <div className="text-gray-900 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            30 de agosto, 2025
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Código:
                                        </span>
                                        <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            326956
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Código Ruleta marquesa */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span 
                                        className="text-xl font-bold text-gray-900"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Ruleta marquesa
                                    </span>
                                    <span 
                                        className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                        style={{ backgroundColor: '#E8ACD2' }}
                                    >
                                        10% OFF
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Válido hasta:
                                        </span>
                                        <div className="text-gray-900 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            8 de abril, 2025
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Código:
                                        </span>
                                        <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            842034
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Código Primavera 2025 */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <span 
                                        className="text-xl font-bold text-gray-900"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Primavera 2025
                                    </span>
                                    <span 
                                        className="px-4 py-2 rounded-full text-sm font-bold text-white"
                                        style={{ backgroundColor: '#E8ACD2' }}
                                    >
                                        10% OFF
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Válido hasta:
                                        </span>
                                        <div className="text-gray-900 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            2 de abril, 2025
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Código:
                                        </span>
                                        <div className="text-gray-900 font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            659274
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botón de acción */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleStartShopping}
                                className="w-full text-white px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif', 
                                    cursor: 'pointer',
                                    backgroundColor: '#E8ACD2'
                                }}
                            >
                                Comenzar a comprar 🛍️
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de resultado */}
            <ResultModal 
                isOpen={showResult}
                selectedCode={selectedCode}
                onClose={closeResult}
                onCopyCode={copyToClipboard}
            />

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default RuletaPage;
/**
 * Página de la ruleta de descuentos para clientes - VERSIÓN ACTUALIZADA CON CONTROL DE ESTADO
 * Permite a los usuarios girar una ruleta para obtener códigos de descuento reales
 * Los códigos se generan en el backend y se almacenan en el perfil del usuario
 * Muestra códigos obtenidos dinámicamente desde la base de datos
 * ✅ NUEVO: Verifica si la ruleta está activa antes de permitir girar
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import RuletaAnimation from '../components/RuletaAnimation';
import ResultModal from '../components/ResultModal';
import { useRuleta } from '../components/Ruleta/Hooks/useRuleta';
import toast from 'react-hot-toast';

const RuletaPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();
    
    // Estados para códigos obtenidos del usuario
    const [userCodes, setUserCodes] = useState([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    
    // ✅ NUEVO: Estado para verificar si la ruleta está activa
    const [isRuletaActive, setIsRuletaActive] = useState(true);
    const [checkingRuletaStatus, setCheckingRuletaStatus] = useState(true);
    
    // Hook personalizado para manejar la lógica de la ruleta
    const {
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        error,
        spinRuleta,
        resetRuleta,
        closeResult,
        copyToClipboard,
        clearError,
        checkRuletaStatus // ✅ NUEVA: Función para verificar estado de ruleta
    } = useRuleta();

    /**
     * ✅ NUEVA: Función para verificar el estado de la ruleta
     */
    const checkRuletaActiveStatus = async () => {
        try {
            setCheckingRuletaStatus(true);
            const status = await checkRuletaStatus();
            setIsRuletaActive(status.isActive);
            console.log('Estado de ruleta verificado:', status.isActive);
        } catch (error) {
            console.error('Error verificando estado de ruleta:', error);
            // En caso de error, asumir que está activa
            setIsRuletaActive(true);
        } finally {
            setCheckingRuletaStatus(false);
        }
    };

    /**
     * Función para obtener los códigos del usuario desde el backend
     */
    const fetchUserCodes = async () => {
        if (!isAuthenticated) return;

        try {
            setLoadingCodes(true);
            
            const response = await fetch('https://marquesa.onrender.com/api/clients/ruleta/codes', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('✅ Códigos del usuario obtenidos:', data.codes);
                setUserCodes(data.codes || []);
            } else {
                console.error('❌ Error al obtener códigos:', data.message);
                toast.error(data.message || 'Error al cargar códigos');
            }

        } catch (error) {
            console.error('❌ Error de conexión al obtener códigos:', error);
            toast.error('Error de conexión al cargar códigos');
        } finally {
            setLoadingCodes(false);
        }
    };

    /**
     * Función para formatear fechas
     */
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    /**
     * Función para obtener el texto del estado en español
     */
    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Activo',
            'used': 'Utilizado',
            'expired': 'Caducado'
        };
        return statusMap[status] || status;
    };

    /**
     * Función para obtener el color del estado
     */
    const getStatusColor = (status) => {
        const colorMap = {
            'active': 'bg-green-100 text-green-800',
            'used': 'bg-gray-100 text-gray-600',
            'expired': 'bg-red-100 text-red-600'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-600';
    };

    /**
     * Maneja la navegación para comenzar a comprar
     */
    const handleStartShopping = () => {
        navigate('/');
    };

    /**
     * Maneja el cierre del modal con recarga de códigos
     */
    const handleCloseResult = () => {
        closeResult();
        fetchUserCodes();
    };

    /**
     * Maneja el reseteo con limpieza de errores
     */
    const handleReset = () => {
        resetRuleta();
        clearError();
    };

    // ✅ NUEVO: Verificar estado de la ruleta al montar el componente
    useEffect(() => {
        checkRuletaActiveStatus();
    }, []);

    // Cargar códigos del usuario al montar el componente
    useEffect(() => {
        if (isAuthenticated && !loading) {
            fetchUserCodes();
        }
    }, [isAuthenticated, loading]);

    // Mostrar toast de error cuando hay errores
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Redirigir a login si no está autenticado
    if (!loading && !isAuthenticated) {
        toast.error('Debes iniciar sesión para acceder a la ruleta');
        navigate('/login');
        return null;
    }

    return (
        <div>
            <Header />

            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Título principal de la página */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Ruleta marquesa
                    </h1>
                    
                    {/* Mostrar información de autenticación */}
                    {!isAuthenticated && (
                        <p className="text-orange-600 text-sm font-medium">
                            Inicia sesión para obtener códigos de descuento personalizados
                        </p>
                    )}
                    
                    
                </div>

                {/* Layout principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
                    
                    {/* Sección izquierda - Componente de la ruleta */}
                    <div className="flex flex-col items-center order-1 lg:order-1">
                        {/* ✅ NUEVO: Solo mostrar ruleta si está activa */}
                        {isRuletaActive ? (
                            <>
                                <RuletaAnimation 
                                    isSpinning={isSpinning}
                                    onSpin={spinRuleta}
                                    hasSpun={hasSpun}
                                    showResult={showResult}
                                />
                                
                                {/* Mensajes dinámicos debajo de la ruleta */}
                                <div className="text-center mt-4 sm:mt-6 px-2">
                                    {/* Mostrar error si existe */}
                                    {error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                            <p className="text-sm">{error}</p>
                                            <button
                                                onClick={clearError}
                                                className="mt-2 text-xs underline hover:no-underline"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    )}

                                    {!error && !hasSpun && !isSpinning && (
                                        <p 
                                            className="text-gray-700 text-base sm:text-lg font-medium"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            {isAuthenticated 
                                                ? '¡Haz clic en la ruleta para obtener tu descuento!'
                                                : 'Inicia sesión para girar la ruleta y obtener descuentos'
                                            }
                                        </p>
                                    )}
                                    
                                    {!error && isSpinning && (
                                        <p 
                                            className="text-gray-700 text-base sm:text-lg font-medium animate-pulse"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            ¡La ruleta está girando! Espera tu resultado...
                                        </p>
                                    )}
                                    
                                    {!error && hasSpun && (
                                        <div className="space-y-3 sm:space-y-4">
                                            <p 
                                                className="text-green-600 text-base sm:text-lg font-medium"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                ¡Código generado exitosamente!
                                            </p>
                                            <button
                                                onClick={handleReset}
                                                className="bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                            >
                                                Intentar de nuevo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* ✅ NUEVO: Mostrar mensaje grande cuando está desactivada */
                            <div className="w-full max-w-md bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Ruleta Desactivada
                                </h3>
                                <p className="text-gray-600 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    La ruleta de descuentos no está disponible en este momento.
                                </p>
                                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Puedes revisar tus códigos obtenidos anteriormente o volver más tarde.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sección derecha - Lista de códigos obtenidos */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 lg:p-8 border border-gray-200 order-2 lg:order-2">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 
                                className="text-xl sm:text-2xl font-bold text-gray-800"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Mis códigos obtenidos
                            </h2>
                            
                            <button
                                onClick={fetchUserCodes}
                                disabled={loadingCodes}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                style={{ cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                            >
                                {loadingCodes ? '🔄' : '↻ Actualizar'}
                            </button>
                        </div>
                        
                        {loadingCodes && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Cargando códigos...
                                </p>
                            </div>
                        )}

                        {!loadingCodes && (
                            <div className="space-y-3 sm:space-y-4">
                                {userCodes.length > 0 ? (
                                    userCodes.map((code, index) => (
                                        <div 
                                            key={code.codeId || index}
                                            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 relative overflow-hidden"
                                            style={{ backgroundColor: code.color || '#F9FAFB' }}
                                        >
                                            {/* Badge de estado */}
                                            <div className="absolute top-3 right-3">
                                                <span 
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}
                                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                                >
                                                    {getStatusText(code.status)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mb-3 sm:mb-4 pr-20">
                                                <span 
                                                    className="text-lg sm:text-xl font-bold"
                                                    style={{ 
                                                        fontFamily: 'Poppins, sans-serif',
                                                        color: code.textColor || '#374151'
                                                    }}
                                                >
                                                    {code.name}
                                                </span>
                                                <span 
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white"
                                                    style={{ backgroundColor: '#E8ACD2' }}
                                                >
                                                    {code.discount}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <span 
                                                        className="text-xs sm:text-sm font-medium opacity-75" 
                                                        style={{ 
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: code.textColor || '#6B7280'
                                                        }}
                                                    >
                                                        Válido hasta:
                                                    </span>
                                                    <div 
                                                        className="font-semibold text-sm sm:text-base" 
                                                        style={{ 
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: code.textColor || '#374151'
                                                        }}
                                                    >
                                                        {formatDate(code.expiresAt)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span 
                                                        className="text-xs sm:text-sm font-medium opacity-75" 
                                                        style={{ 
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: code.textColor || '#6B7280'
                                                        }}
                                                    >
                                                        Código:
                                                    </span>
                                                    <div 
                                                        className="font-bold text-base sm:text-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                        style={{ 
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: code.textColor || '#374151'
                                                        }}
                                                        onClick={() => {
                                                            copyToClipboard(code.code);
                                                            toast.success('Código copiado al portapapeles');
                                                        }}
                                                        title="Haz clic para copiar"
                                                    >
                                                        {code.code}
                                                    </div>
                                                </div>
                                            </div>

                                            {code.status === 'used' && code.usedAt && (
                                                <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-50">
                                                    <span 
                                                        className="text-xs opacity-75" 
                                                        style={{ 
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: code.textColor || '#6B7280'
                                                        }}
                                                    >
                                                        Utilizado el {formatDate(code.usedAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">🎰</div>
                                        <p 
                                            className="text-gray-500 text-lg mb-2" 
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            ¡Aún no tienes códigos!
                                        </p>
                                        <p 
                                            className="text-gray-400 text-sm" 
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            Gira la ruleta para obtener tu primer descuento
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loadingCodes && userCodes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Códigos mostrados: {userCodes.length}
                                    </span>
                                    <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Activos: {userCodes.filter(c => c.status === 'active').length}/10
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                            <button
                                onClick={handleStartShopping}
                                className="w-full text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif', 
                                    cursor: 'pointer',
                                    backgroundColor: '#E8ACD2'
                                }}
                            >
                                Comenzar a comprar
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <ResultModal 
                isOpen={showResult}
                selectedCode={selectedCode}
                onClose={handleCloseResult}
                onCopyCode={copyToClipboard}
            />

            <Footer />
        </div>
    );
};

export default RuletaPage;
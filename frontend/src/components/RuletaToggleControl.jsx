/**
 * Componente de control para activar/desactivar la ruleta de descuentos
 * Solo visible para administradores en el Dashboard
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const RuletaToggleControl = () => {
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetchingStatus, setFetchingStatus] = useState(true);

    /**
     * Obtener el estado actual de la ruleta al montar el componente
     */
    useEffect(() => {
        fetchRuletaStatus();
    }, []);

    /**
     * Función para obtener el estado actual de la ruleta
     */
    const fetchRuletaStatus = async () => {
        try {
            setFetchingStatus(true);

            const response = await fetch('https://marquesa.onrender.com/api/clients/ruleta/status', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsActive(data.isActive);
                console.log('Estado de ruleta obtenido:', data.isActive);
            } else {
                console.error('Error al obtener estado:', data.message);
                toast.error('Error al obtener estado de la ruleta');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            toast.error('Error de conexión al obtener estado');
        } finally {
            setFetchingStatus(false);
        }
    };

    /**
     * Función para cambiar el estado de la ruleta
     */
    const handleToggle = async () => {
        const newStatus = !isActive;

        try {
            setLoading(true);

            const response = await fetch('https://marquesa.onrender.com/api/clients/ruleta/toggle', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: newStatus
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsActive(data.isActive);
                toast.success(
                    newStatus 
                        ? 'Ruleta activada exitosamente' 
                        : 'Ruleta desactivada'
                );
                console.log('Estado actualizado:', data.isActive);
            } else {
                console.error('Error al cambiar estado:', data.message);
                toast.error(data.message || 'Error al cambiar estado de la ruleta');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            toast.error('Error de conexión al cambiar estado');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingStatus) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                    <span className="ml-3 text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Cargando estado...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4" 
             style={{ borderLeftColor: isActive ? '#10B981' : '#EF4444' }}>
            <div className="flex items-center justify-between">
                {/* Información de la ruleta */}
                <div className="flex items-center space-x-4">
                    {/* Icono de ruleta */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        <svg 
                            className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-red-600'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" 
                            />
                        </svg>
                    </div>

                    {/* Texto de estado */}
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800" 
                            style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Ruleta de Descuentos
                        </h3>
                        <p className={`text-sm ${isActive ? 'text-green-600' : 'text-red-600'}`}
                           style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {isActive ? '● Activa' : '● Desactivada'}
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>

            {/* Mensaje informativo */}
            <div className={`mt-4 p-3 rounded-lg text-sm ${
                isActive ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                {isActive ? (
                    <p>
                        ✓ Los clientes pueden girar la ruleta y obtener códigos de descuento.
                    </p>
                ) : (
                    <p>
                        ⚠ La ruleta está desactivada. Los clientes verán un mensaje informativo.
                    </p>
                )}
            </div>
        </div>
    );
};

export default RuletaToggleControl;
import React, { useState, useCallback } from "react";
import TermsModal from "../Modals/TermsModal";
import PrivacyModal from "../Modals/PrivacyModal";

/**
 * Componente para el checkbox de términos y condiciones
 * CORREGIDO: Manejo mejorado de estado para evitar errores de React
 * Incluye validación visual con borde rojo cuando hay error
 * 
 * @param {boolean} checked - Si el checkbox está marcado
 * @param {Function} onChange - Función para manejar cambios
 * @param {string} error - Mensaje de error a mostrar
 * @param {boolean} disabled - Si el checkbox está deshabilitado
 */
const TermsCheckbox = ({ checked, onChange, error, disabled }) => {
    // Estados para controlar la visibilidad de los modales
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    /**
     * Maneja el click en el enlace de términos y condiciones
     * Previene la navegación y abre el modal
     */
    const handleTermsClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setShowTermsModal(true);
        }
    }, [disabled]);

    /**
     * Maneja el click en el enlace de política de privacidad
     * Previene la navegación y abre el modal
     */
    const handlePrivacyClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setShowPrivacyModal(true);
        }
    }, [disabled]);

    /**
     * Cierra el modal de términos y condiciones
     */
    const closeTermsModal = useCallback(() => {
        setShowTermsModal(false);
    }, []);

    /**
     * Cierra el modal de política de privacidad
     */
    const closePrivacyModal = useCallback(() => {
        setShowPrivacyModal(false);
    }, []);

    return (
        <div className="mt-4">
            {/* Container del checkbox y texto con borde condicional */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors duration-200 ${
                error 
                    ? 'border-red-400 bg-red-50' 
                    : 'border-transparent bg-transparent'
            }`}>
                {/* Checkbox personalizado con estilo de error */}
                <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={!!checked}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-4 h-4 mt-1 rounded border text-pink-600 focus:ring-pink-500 focus:ring-2 transition-colors duration-200 ${
                        error 
                            ? 'border-red-400 focus:ring-red-500' 
                            : 'border-gray-300'
                    }`}
                />
                
                {/* Texto con enlaces clickeables */}
                <label 
                    htmlFor="acceptTerms" 
                    className={`text-sm leading-relaxed cursor-pointer transition-colors duration-200 ${
                        error ? 'text-red-700' : 'text-gray-700'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Al registrarme, acepto los{" "}
                    <button
                        type="button"
                        onClick={handleTermsClick}
                        disabled={disabled}
                        className={`underline transition-colors duration-200 font-medium ${
                            error 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-pink-500 hover:text-pink-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Términos y Condiciones
                    </button>{" "}
                    y la{" "}
                    <button
                        type="button"
                        onClick={handlePrivacyClick}
                        disabled={disabled}
                        className={`underline transition-colors duration-200 font-medium ${
                            error 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-pink-500 hover:text-pink-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Política de Privacidad
                    </button>{" "}
                    de MARQUESA.
                </label>
            </div>
            
            {/* Mensaje de error */}
            {error && (
                <div className="text-red-500 text-sm mt-2 italic flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Modal de Términos y Condiciones */}
            {showTermsModal && (
                <TermsModal 
                    isOpen={showTermsModal} 
                    onClose={closeTermsModal} 
                />
            )}

            {/* Modal de Política de Privacidad */}
            {showPrivacyModal && (
                <PrivacyModal 
                    isOpen={showPrivacyModal} 
                    onClose={closePrivacyModal} 
                />
            )}
        </div>
    );
};

export default TermsCheckbox;
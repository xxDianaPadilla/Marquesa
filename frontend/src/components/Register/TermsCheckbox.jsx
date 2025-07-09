import React from "react";

/**
 * Componente para el checkbox de términos y condiciones
 * Incluye enlaces a políticas y manejo de errores
 * 
 * @param {boolean} checked - Si el checkbox está marcado
 * @param {Function} onChange - Función para manejar cambios
 * @param {string} error - Mensaje de error a mostrar
 * @param {boolean} disabled - Si el checkbox está deshabilitado
 */
const TermsCheckbox = ({ checked, onChange, error, disabled }) => {
    /**
     * Maneja el click en términos y condiciones
     * En una aplicación real, abriría un modal o navegaría a otra página
     */
    const handleTermsClick = (e) => {
        e.preventDefault();
        // TODO: Implementar modal o navegación a términos
        console.log('Abrir términos y condiciones');
    };

    /**
     * Maneja el click en política de privacidad
     * En una aplicación real, abriría un modal o navegaría a otra página
     */
    const handlePrivacyClick = (e) => {
        e.preventDefault();
        // TODO: Implementar modal o navegación a política de privacidad
        console.log('Abrir política de privacidad');
    };

    return (
        <div className="mt-4">
            {/* Container del checkbox y texto */}
            <div className="flex items-start gap-3">
                {/* Checkbox personalizado */}
                <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-4 h-4 mt-1 rounded border text-pink-600 focus:ring-pink-500 focus:ring-2 transition-colors ${
                        error ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                
                {/* Texto con enlaces */}
                <label 
                    htmlFor="acceptTerms" 
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    Al registrarme, acepto los{" "}
                    <button
                        type="button"
                        onClick={handleTermsClick}
                        className="text-pink-500 underline hover:text-pink-600 transition-colors"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Términos y Condiciones
                    </button>{" "}
                    y la{" "}
                    <button
                        type="button"
                        onClick={handlePrivacyClick}
                        className="text-pink-500 underline hover:text-pink-600 transition-colors"
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
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
};

export default TermsCheckbox;
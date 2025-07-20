import React, { useState, useCallback, memo } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Componente de input personalizado para formularios generales (principalmente Login)
 * COMPLETAMENTE OPTIMIZADO: Uso de memo, useCallback y manejo mejorado de estado
 * Incluye validación visual, manejo de errores y funcionalidades de accesibilidad
 * 
 * @param {string} name - Nombre del campo para identificación y react-hook-form
 * @param {string} type - Tipo de input (text, email, password, etc.)
 * @param {string} placeholder - Texto placeholder a mostrar
 * @param {string} icon - URL del icono a mostrar en el lado izquierdo
 * @param {boolean} showPassword - Si mostrar/ocultar contraseña (solo para type="password")
 * @param {Function} onTogglePassword - Función para toggle de contraseña
 * @param {Object} register - Función register de react-hook-form
 * @param {Object} validationRules - Reglas de validación para react-hook-form
 * @param {string} error - Mensaje de error a mostrar
 * @param {boolean} disabled - Si el input está deshabilitado
 * @param {string} autoComplete - Valor de autocompletado para el navegador
 * @param {Function} onFocus - Función para manejar evento focus (opcional)
 * @param {Function} onBlur - Función para manejar evento blur (opcional)
 */
const Input = memo(({
    name,
    type = "text",
    placeholder,
    icon,
    showPassword,
    onTogglePassword,
    register,
    validationRules,
    error,
    disabled = false,
    autoComplete,
    onFocus,
    onBlur,
    ...props
}) => {
    // ============ ESTADOS LOCALES ============
    
    /**
     * Estado para controlar si el campo ha sido enfocado
     * Útil para mejorar la experiencia visual del usuario
     */
    const [isFocused, setIsFocused] = useState(false);
    
    /**
     * Estado para controlar si el campo ha sido tocado
     * Mejora la UX al mostrar errores solo después de interacción
     */
    const [isTouched, setIsTouched] = useState(false);

    // ============ MANEJADORES DE EVENTOS OPTIMIZADOS ============
    
    /**
     * Maneja el evento focus del input
     * Actualiza estados visuales y ejecuta callback externo si existe
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleFocus = useCallback((e) => {
        console.log(`📍 Focus en campo: ${name}`);
        
        setIsFocused(true);
        setIsTouched(true);
        
        // Ejecutar callback externo si existe
        if (onFocus) {
            onFocus(e);
        }
    }, [name, onFocus]);

    /**
     * Maneja el evento blur del input
     * Actualiza estados visuales y ejecuta callback externo si existe
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleBlur = useCallback((e) => {
        console.log(`📍 Blur en campo: ${name}`);
        
        setIsFocused(false);
        
        // Ejecutar callback externo si existe
        if (onBlur) {
            onBlur(e);
        }
    }, [name, onBlur]);

    /**
     * Maneja el toggle de mostrar/ocultar contraseña
     * Incluye logging para debugging y validación de estados
     * Memoizada para evitar re-creaciones innecesarias
     */
    const handleTogglePassword = useCallback(() => {
        if (onTogglePassword && !disabled) {
            console.log(`👁️ Toggle password visibility para: ${name}`);
            onTogglePassword();
        }
    }, [onTogglePassword, disabled, name]);

    // ============ CÁLCULOS Y ESTADOS DERIVADOS ============
    
    /**
     * Determina el tipo de input a mostrar
     * Para campos de contraseña, alterna entre 'password' y 'text'
     */
    const inputType = type === "password" && showPassword ? "text" : type;
    
    /**
     * Determina si debe mostrar el error
     * Solo muestra error si el campo ha sido tocado y hay un error
     */
    const shouldShowError = error && isTouched;
    
    /**
     * Calcula las clases CSS para el contenedor del input
     * Incluye estados de error, focus, disabled y animaciones
     */
    const containerClasses = `
        flex items-center bg-white bg-opacity-50 border-2 rounded-lg px-4 py-3 
        transition-all duration-200 relative
        ${shouldShowError 
            ? 'border-red-400 bg-red-50 shadow-red-100 shadow-md' 
            : isFocused 
                ? 'border-pink-500 shadow-pink-200 shadow-md bg-white bg-opacity-70'
                : 'border-[#FDB4B7] hover:border-pink-400'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}
    `.trim();
    
    /**
     * Calcula las clases CSS para el icono
     * Incluye estados de error, focus y disabled
     */
    const iconClasses = `
        w-5 h-5 mr-3 transition-all duration-200 
        ${shouldShowError 
            ? 'opacity-70 filter brightness-75' 
            : isFocused 
                ? 'opacity-80' 
                : 'opacity-60'
        }
    `.trim();
    
    /**
     * Calcula las clases CSS para el input
     * Incluye estados de error, placeholder y texto
     */
    const inputClasses = `
        flex-1 bg-transparent outline-none text-sm transition-colors duration-200 
        ${shouldShowError 
            ? 'placeholder-red-400 text-red-700' 
            : 'placeholder-gray-400 text-gray-700'
        }
    `.trim();

    // ============ CONFIGURACIÓN DE REACT-HOOK-FORM ============
    
    /**
     * Configuración para react-hook-form si se proporciona register
     * Incluye todas las reglas de validación y callbacks
     */
    const registerProps = register ? register(name, {
        ...validationRules,
        onBlur: (e) => {
            // Ejecutar validación de react-hook-form
            if (validationRules?.onBlur) {
                validationRules.onBlur(e);
            }
            // Ejecutar nuestro manejador local
            handleBlur(e);
        }
    }) : {};

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <div className="relative mb-4">
            {/* Container principal del input con estilos dinámicos */}
            <div className={containerClasses}>
                
                {/* Icono izquierdo (opcional) */}
                {icon && (
                    <img
                        src={icon}
                        alt={`Icono para ${placeholder || name}`}
                        className={iconClasses}
                    />
                )}

                {/* Input principal con integración de react-hook-form */}
                <input
                    {...registerProps}
                    type={inputType}
                    placeholder={placeholder}
                    className={inputClasses}
                    style={{
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        fontStyle: 'italic'
                    }}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    onFocus={handleFocus}
                    aria-invalid={shouldShowError ? 'true' : 'false'}
                    aria-describedby={shouldShowError ? `${name}-error` : undefined}
                    {...props}
                />

                {/* Botón para mostrar/ocultar contraseña */}
                {type === "password" && onTogglePassword && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        disabled={disabled}
                        className={`ml-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded p-1 ${
                            shouldShowError 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-400 hover:text-gray-600'
                        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}

                {/* Indicador visual de error */}
                {shouldShowError && (
                    <div className="ml-2 text-red-500" aria-hidden="true">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}

                {/* Indicador de focus para accesibilidad */}
                {isFocused && (
                    <div className="absolute -inset-1 rounded-lg border-2 border-pink-300 opacity-50 pointer-events-none" 
                         aria-hidden="true" />
                )}
            </div>

            {/* Mensaje de error con animación */}
            {shouldShowError && (
                <div 
                    id={`${name}-error`}
                    className="text-red-500 text-sm mt-2 italic flex items-start animate-slideDown" 
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    role="alert"
                    aria-live="polite"
                >
                    <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="leading-tight">{error}</span>
                </div>
            )}

            {/* Mensaje de ayuda o hint (opcional) */}
            {!shouldShowError && placeholder && isFocused && (
                <div className="text-xs text-gray-500 mt-1 italic" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {type === 'email' && 'Ingresa un correo electrónico válido'}
                    {type === 'password' && 'Mínimo 8 caracteres'}
                </div>
            )}
        </div>
    );
});

// Establecer displayName para debugging
Input.displayName = 'Input';

export default Input;
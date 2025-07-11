import React from "react";
import { Eye, EyeOff } from "lucide-react";

// Componente de entrada personalizado
// Permite mostrar un campo de entrada con íconos, validación y estado de contraseña
const Input = ({
    name,
    type = "text",
    placeholder,
    icon,
    showPassword,
    onTogglePassword,
    register,
    validationRules,
    error,
    disabled
}) => {
    return (
        <div className="relative mb-4">
            <div className="flex items-center bg-white bg-opacity-50 border border-[#FDB4B7] rounded-lg px-4 py-3 focus-within:border-pink-500 transition-colors">
                {/* Ícono izquierdo */}
                {icon && (
                    <img
                        src={icon}
                        alt="Icon"
                        className="w-5 h-5 mr-3 opacity-60"
                    />
                )}

                <input
                    {...register(name, validationRules)}
                    type={type === "password" && showPassword ? "text" : type}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none placeholder-gray-400 text-sm"
                    style={{
                        color: '#999999',
                        fontWeight: '500',
                        fontFamily: 'Poppins, sans-serif',
                        fontStyle: 'italic'
                    }}
                    disabled={disabled}
                />

                {/* Ícono de mostrar/ocultar contraseña */}
                {type === "password" && onTogglePassword && (
                    <button
                        style={{ cursor: 'pointer' }}
                        type="button"
                        onClick={onTogglePassword}
                        className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-1 italic">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Input;
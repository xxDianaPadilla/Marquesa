import React from "react";
import {Eye, EyeOff} from "lucide-react";

const Input = ({
    type = "text",
    placeholder,
    value,
    onChange,
    icon,
    showPassword,
    onTogglePassword
}) => {
    return(
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
                
                {/* Input */}
                <input
                    type={type === "password" && showPassword ? "text" : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="flex-1 bg-transparent outline-none placeholder-gray-400 text-sm"  style={{ color: '#999999', fontWeight: '500', fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}
                />
                
                {/* Ícono de mostrar/ocultar contraseña (solo para tipo password) */}
                {type === "password" && onTogglePassword && (
                    <button
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
        </div>
    );
};

export default Input;
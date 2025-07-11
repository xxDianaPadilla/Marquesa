import React from "react";
import googleIcon from "../assets/google.png";

// Componente para el botón de Google
// Este componente muestra un botón estilizado para iniciar sesión con Google
const GoogleButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full rounded-lg py-3 px-6 font-semibold text-center 
                       transition-all duration-200 flex items-center justify-center
                       bg-white hover:bg-gray-50 text-gray-700 border-2 
                       hover:border-pink-400"
            style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                borderColor: '#FDB4B7',
                cursor: 'pointer'
            }}
        >
            <img
                src={googleIcon}
                alt="Google Icon"
                className="w-5 h-5 mr-3"
            />
            Continuar con Google
        </button>
    );
};

export default GoogleButton;
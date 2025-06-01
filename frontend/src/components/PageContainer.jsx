import React from "react";
import marquesaLogo from "../assets/marquesaLogo2.png";
import bgImage from "../assets/bgImage.png";

const PageContainer = ({ children }) => {
    return (
        <div className="min-h-screen w-full flex">
            {/* Sección izquierda - Rosa con logo */}
            <div className="w-1/4 flex flex-col justify-center items-center relative" style={{ backgroundColor: '#FDB4B7' }}>
                <div className="text-center">
                    <img
                        src={marquesaLogo}
                        alt="Marquesa Logo"
                        className="max-w-38 max-h-32 object-contain"
                    />
                </div>
            </div>

            {/* Sección derecha - Fondo floral */}
            <div className="w-3/4 relative overflow-hidden">
                {/* Imagen de fondo floral */}
                <div className="absolute inset-0">
                    <img
                        src={bgImage}
                        alt="Fondo floral"
                        className="w-[150%] h-full object-cover"
                    />
                </div>

                {/* Contenedor para el contenido que se pasará como children */}
                <div className="relative z-10 w-full h-full flex justify-center items-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PageContainer;
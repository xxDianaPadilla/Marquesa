import React from "react";
import marquesaLogo from "../assets/marquesaLogo2.png";
import bgImage from "../assets/bgImage.png";

// Componente para el contenedor de la página
// Este componente define la estructura básica de la página con un diseño dividido
const PageContainer = ({ children }) => {
    return (
        <div className="min-h-screen w-full flex">
            {/* Sección izquierda - Rosa con logo */}
            <div className="w-1/4 flex flex-col justify-center items-center relative" style={{ backgroundColor: '#FDB4B7' }}>
                <div className="text-center">
                    <img
                        src={marquesaLogo}
                        alt="Marquesa Logo"
                        className="object-contain"
                        style={{width:"200px", height: "200px"}}
                    />
                </div>
            </div>

            {/* Sección derecha - Fondo floral con scroll */}
            <div className="w-3/4 relative overflow-hidden">
                {/* Imagen de fondo floral */}
                <div className="absolute inset-0">
                    <img
                        src={bgImage}
                        alt="Fondo floral"
                        className="w-[150%] h-full object-cover"
                    />
                </div>

                {/* Contenedor scrolleable para el contenido */}
                <div className="relative z-10 w-full h-screen overflow-y-auto">
                    <div className="min-h-full flex justify-center items-center py-8 px-4">
                        <div className="w-full max-w-2xl">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageContainer;
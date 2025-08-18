import React from "react";
import marquesaLogo from "../assets/marquesaLogo2.png";
import bgImage from "../assets/bgImage.png";

// Componente para el contenedor de la página
// Este componente define la estructura básica de la página con un diseño dividido
const PageContainer = ({ children }) => {
    return (
        <div className="min-h-screen w-full flex">
            {/* Sección izquierda - Rosa con logo (oculta en pantallas pequeñas) */}
            <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col justify-center items-center relative" style={{ backgroundColor: '#FDB4B7' }}>
                <div className="text-center px-4">
                    <img
                        src={marquesaLogo}
                        alt="Marquesa Logo"
                        className="object-contain w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52"
                    />
                </div>
            </div>

            {/* Sección derecha - Fondo floral con scroll */}
            <div className="w-full md:w-2/3 lg:w-3/4 relative overflow-hidden">
                {/* Imagen de fondo floral */}
                <div className="absolute inset-0">
                    <img
                        src={bgImage}
                        alt="Fondo floral"
                        className="w-full md:w-[150%] h-full object-cover"
                    />
                </div>

                {/* Contenedor scrolleable para el contenido */}
                <div className="relative z-10 w-full h-screen overflow-y-auto">
                    <div className="min-h-full flex justify-center items-center py-8 px-4 sm:px-6 md:px-8">
                        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageContainer;
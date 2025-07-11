import React, { useEffect } from "react";

const OverlayBackdrop = ({ isVisible, children, onClose }) => {
    
    // Bloquear/desbloquear scroll de la página principal
    useEffect(() => {
        if (isVisible) {
            // Guardar la posición actual del scroll
            const scrollY = window.scrollY;
            const body = document.body;
            const html = document.documentElement;
            
            // Aplicar estilos para bloquear el scroll
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.width = '100%';
            html.style.overflow = 'hidden';
            
            // Cleanup function para restaurar el scroll
            return () => {
                // Restaurar estilos
                body.style.position = '';
                body.style.top = '';
                body.style.left = '';
                body.style.right = '';
                body.style.width = '';
                html.style.overflow = '';
                
                // Restaurar la posición del scroll
                window.scrollTo(0, scrollY);
            };
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop con efecto responsivo */}
            <div 
                className="absolute inset-0"
                onClick={onClose}
                style={{ 
                    background: 'rgba(0, 0, 0, 0.5)', // Más opaco para mejor contraste en móvil
                    backdropFilter: 'blur(2px)', // Blur más suave
                    WebkitBackdropFilter: 'blur(2px)' // Safari support
                }}
            />
            
            {/* Contenido del modal con padding responsivo */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
                {children}
            </div>
        </div>
    );
};

export default OverlayBackdrop;
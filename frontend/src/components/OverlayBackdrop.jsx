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
        <div className="fixed inset-0 z-50">
            {/* Backdrop con efecto más suave y menos intenso */}
            <div 
                className="absolute inset-0"
                onClick={onClose}
                style={{ 
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(1.5px) brightness(0.95)',
                    WebkitBackdropFilter: 'blur(1.5px) brightness(0.95)' // Safari support
                }}
            />
            
            {/* Contenido del modal que se mantiene funcional */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default OverlayBackdrop;
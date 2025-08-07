// Importamos React para crear el componente funcional
import React from 'react';

// Definimos el componente CategoryCard que renderiza una tarjeta individual de categoría
const CategoryCard = ({ 
    name,           // Nombre de la categoría que se mostrará como texto
    image,          // URL de la imagen de fondo de la categoría
    className = '', // Clases CSS adicionales (opcional, default: string vacío)
    onClick         // Función que se ejecuta al hacer click en la tarjeta
}) => {
    return (
        // Contenedor principal de la tarjeta
        <div 
            // Clases CSS que definen el aspecto y comportamiento de la tarjeta
            className={`
                relative          // Posicionamiento relativo para elementos absolutos internos
                group            // Grupo para efectos hover en elementos hijos
                cursor-pointer   // Cambia cursor a pointer para indicar interactividad
                overflow-hidden  // Oculta contenido que sobresale del contenedor
                rounded-2xl      // Bordes redondeados grandes
                shadow-lg        // Sombra grande por defecto
                hover:shadow-xl  // Sombra extra grande al hacer hover
                transition-all   // Transición suave para todas las propiedades
                duration-300     // Duración de 300ms para las transiciones
                transform        // Habilita transformaciones CSS
                hover:scale-105  // Escala al 105% en hover (efecto de zoom sutil)
                ${className}     // Clases adicionales pasadas como prop
            `}
            onClick={onClick}    // Manejador de evento click
            style={{ aspectRatio: '4/3' }}  // Mantiene proporción 4:3 (ancho:alto)
        >
            {/* Contenedor de la imagen de fondo */}
            <div 
                // Posicionamiento absoluto que cubre todo el contenedor padre
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                    // Establece la imagen de fondo usando la URL proporcionada
                    backgroundImage: `url(${image})`,
                }}
            >
                {/* Overlay gradient para mejorar legibilidad del texto sobre la imagen */}
                <div className="
                    absolute inset-0                    // Cubre toda la imagen
                    bg-gradient-to-t                   // Gradiente de abajo hacia arriba
                    from-black/70                      // Negro 70% opacidad en la parte inferior
                    via-black/30                       // Negro 30% opacidad en el medio
                    to-black/10                        // Negro 10% opacidad en la parte superior
                    group-hover:from-black/80          // En hover: negro 80% abajo
                    group-hover:via-black/40           // En hover: negro 40% medio
                    group-hover:to-black/20            // En hover: negro 20% arriba
                    transition-all duration-300        // Transición suave del overlay
                "></div>
            </div>
            
            {/* Contenedor del texto que se superpone a la imagen */}
            <div className="
                absolute inset-0           // Cubre todo el contenedor
                flex                      // Flexbox para centrar contenido
                items-center              // Centra verticalmente
                justify-center            // Centra horizontalmente
                p-4                       // Padding interno de 1rem
            ">
                {/* Título de la categoría */}
                <h3 
                    className="
                        text-white                     // Texto color blanco
                        font-bold                      // Peso de fuente negrita
                        text-lg sm:text-xl lg:text-2xl // Tamaños responsivos: lg/xl/2xl
                        text-center                    // Texto centrado
                        leading-tight                  // Espaciado de línea compacto
                        group-hover:scale-110          // Escala 110% en hover del grupo padre
                        transition-transform           // Solo anima las transformaciones
                        duration-300                   // Duración de 300ms
                    "
                    style={{ 
                        // Especifica la fuente Poppins
                        fontFamily: "Poppins, sans-serif",
                        // Sombra del texto para mejor legibilidad sobre imágenes
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
                        // textShadow: desplazamiento-x desplazamiento-y blur color
                        // 2px hacia la derecha, 2px hacia abajo, 4px de difuminado, negro 80%
                    }}
                >
                    {name} {/* Renderiza el nombre de la categoría */}
                </h3>
            </div>
            
            {/* Efecto de borde adicional que aparece en hover */}
            <div className="
                absolute inset-0                    // Cubre todo el contenedor
                border-2                           // Borde de 2px
                border-transparent                 // Borde transparente por defecto
                group-hover:border-white/30        // Borde blanco 30% opacidad en hover
                rounded-2xl                        // Bordes redondeados que coinciden con el contenedor
                transition-all duration-300        // Transición suave para el borde
            "></div>
        </div>
    );
};

// Exportamos el componente para usar en otros archivos
export default CategoryCard;
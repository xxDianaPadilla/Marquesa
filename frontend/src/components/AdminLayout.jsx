// frontend/src/components/AdminLayout.jsx

// Importa React y el hook useState para manejar el estado del componente
import React, { useState } from 'react';
// Importa el componente de la barra de navegación del administrador
import NavbarAdmin from './NavbarAdmin';

/**
 * Componente AdminLayout - Layout principal para las páginas del administrador
 * 
 * Incluye la barra de navegación lateral y el contenido principal con padding dinámico
 * que se ajusta según el estado expandido/colapsado del menú
 * 
 * @param {React.ReactNode} children - Componentes hijos que se renderizarán en el área de contenido principal
 */
const AdminLayout = ({ children }) => {
  // Estado para controlar si el menú está expandido o colapsado
  // Inicializa desde localStorage o usa false como valor por defecto
  const [isMenuExpanded, setIsMenuExpanded] = useState(() => {
    const saved = localStorage.getItem('adminMenuExpanded');
    return saved ? JSON.parse(saved) : false;
  });

  return (
    // Container principal con altura mínima de pantalla completa y fondo gris claro
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación del administrador */}
      <NavbarAdmin 
        isExpanded={isMenuExpanded} 
        setIsExpanded={setIsMenuExpanded} 
      />
      
      {/* Contenido principal con padding dinámico responsivo */}
      <div 
        className="transition-all duration-300"
        style={{ 
          // Padding izquierdo que cambia según el estado del menú
          paddingLeft: `${isMenuExpanded ? '12rem' : '4rem'}`,
          minHeight: '100vh'
        }}
      >
        {/* Renderiza los componentes hijos pasados al layout */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
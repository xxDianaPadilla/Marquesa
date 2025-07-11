import React, { useState } from 'react';
import NavbarAdmin from './NavbarAdmin';

// Componente para el layout del administrador
// Incluye la barra de navegación y el contenido principal con padding dinámico
const AdminLayout = ({ children }) => {
  // Inicializar el estado desde localStorage o usar false como default
  const [isMenuExpanded, setIsMenuExpanded] = useState(() => {
    const saved = localStorage.getItem('adminMenuExpanded');
    return saved ? JSON.parse(saved) : false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin 
        isExpanded={isMenuExpanded} 
        setIsExpanded={setIsMenuExpanded} 
      />
      
      {/* Contenido principal con padding dinámico responsivo */}
      <div 
        className="transition-all duration-300"
        style={{ 
          paddingLeft: `${isMenuExpanded ? '12rem' : '4rem'}`,
          minHeight: '100vh'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
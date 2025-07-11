// Importa React, los hooks useState y useContext, y la función createContext para manejar el contexto global
import React, { useState, createContext, useContext } from 'react';

// Crea un contexto para manejar el estado de las pestañas activas
const TabsContext = createContext();

// Componente principal que proporciona el contexto de las pestañas
// Recibe 'children' (los componentes hijos) y 'defaultValue' (el valor de la pestaña activa por defecto)
export const Tabs = ({ children, defaultValue }) => {
  // Estado local para manejar la pestaña activa
  const [activeTab, setActiveTab] = useState(defaultValue || '');

  return (
    // Proveedor del contexto que pasa el estado 'activeTab' y la función 'setActiveTab' a los componentes hijos
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children} {/* Muestra los hijos del componente Tabs */}
    </TabsContext.Provider>
  );
};

// Componente para la lista de pestañas. Se pueden pasar clases adicionales a través de 'className'.
export const TabsList = ({ children, className }) => (
  <div className={className}>
    {children} {/* Muestra los hijos (que serán los botones de las pestañas) */}
  </div>
);

// Componente para cada botón de la pestaña (TabsTrigger).
// Recibe el valor de la pestaña y el contenido del botón
export const TabsTrigger = ({ value, children }) => {
  // Usa el contexto para obtener la pestaña activa y la función para cambiarla
  const { activeTab, setActiveTab } = useContext(TabsContext);
  // Determina si el botón es la pestaña activa
  const isActive = activeTab === value;

  return (
    <button
      style={{ cursor: 'pointer' }} // Aplica el cursor de puntero cuando el usuario pasa por encima del botón
      onClick={() => setActiveTab(value)} // Cambia la pestaña activa cuando se hace clic
      className={`flex-1 px-4 py-2 text-center transition-all duration-200 rounded-md ${isActive
          ? 'bg-white text-black font-semibold shadow-sm' // Estilos para la pestaña activa
          : 'text-gray-500 hover:text-[#CD5277]' // Estilos para las pestañas inactivas
        }`}
    >
      {children} {/* El contenido de cada pestaña (generalmente texto) */}
    </button>
  );
};

// Componente para el contenido de cada pestaña (TabsContent)
// Solo muestra el contenido de la pestaña activa
export const TabsContent = ({ value, children }) => {
  // Usa el contexto para obtener la pestaña activa
  const { activeTab } = useContext(TabsContext);
  
  // Si la pestaña activa no coincide con el valor de esta pestaña, no muestra el contenido
  if (activeTab !== value) return null;

  return <div className="mt-4">{children}</div>; // Muestra el contenido de la pestaña
};

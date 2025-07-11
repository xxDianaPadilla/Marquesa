// Importa la biblioteca de React.
import React from "react";

/**
 * Componente funcional que renderiza un sistema de pestañas (tabs) para mostrar
 * diferente información de un producto.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {string} props.tab - El estado (del componente padre) que indica la pestaña activa ('description', 'details', etc.).
 * @param {Function} props.setTab - La función (del padre) para actualizar el estado de la pestaña activa.
 * @param {object} props.product - El objeto que contiene la información del producto a mostrar en las pestañas.
 */
const ProductTabs = ({ tab, setTab, product }) => {
  // Función auxiliar para renderizar el contenido de la pestaña activa.
  const renderTab = () => {
    // Comprueba el valor de 'tab' y devuelve el contenido correspondiente del objeto 'product'.
    if (tab === "description") return product.description;
    if (tab === "details") return product.details;
    if (tab === "shipping") return product.shipping;
  };

  return (
    // Contenedor principal del sistema de pestañas.
    <div className="border-t border-gray-200 mt-6 pt-4 ">
      {/* Contenedor de los botones que actúan como cabeceras de las pestañas. */}
      <div className="flex gap-2 bg-gray-100 rounded-md text-sm font-medium overflow-hidden cursor-pointer">
        {/* Itera sobre un array de claves para crear un botón por cada pestaña. */}
        {["description", "details", "shipping"].map((key) => (
          <button
            key={key} // Clave única para cada elemento en la lista.
            // Al hacer clic, se actualiza el estado 'tab' en el componente padre con la clave de esta pestaña.
            onClick={() => setTab(key)}
            // Las clases CSS se aplican dinámicamente según si la pestaña está activa o no.
            className={`flex-1 px-4 py-2 text-center ${
              tab === key
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-gray-500 hover:text-[#CD5277] cursor-pointer"
            }`}
          >
            {/* Muestra un texto legible para el usuario en lugar de la clave interna. */}
            {key === "description"
              ? "Descripción"
              : key === "details"
              ? "Detalles"
              : "Envío"}
          </button>
        ))}
      </div>
      {/* Contenedor donde se mostrará el contenido de la pestaña seleccionada. */}
      <div className="bg-white p-4 rounded-b-md text-sm text-gray-700 mt-1 shadow-sm">
        {/* Llama a la función renderTab para obtener y mostrar el contenido correcto. */}
        {renderTab()}
      </div>
    </div>
  );
};

// Exporta el componente para que pueda ser utilizado en otros lugares de la aplicación.
export default ProductTabs;

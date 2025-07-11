// Importa React y el componente hijo 'ProductActions'.
import React from "react";
import ProductActions from "./ProductActions";

/**
 * Componente funcional que muestra una tabla de productos.
 * Maneja los estados de carga, vacío y cuando hay datos para mostrar.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {Array} props.products - El array de objetos de producto a mostrar.
 * @param {boolean} props.loading - Un booleano que indica si los datos se están cargando.
 * @param {Function} props.onEdit - Función a ejecutar cuando se hace clic en editar un producto.
 * @param {Function} props.onDelete - Función a ejecutar cuando se hace clic en eliminar un producto.
 */
const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  // --- Estado de Carga ---
  // Si 'loading' es verdadero, muestra un indicador de carga y no renderiza el resto del componente.
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-12">
          {/* Spinner animado */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7260]"></div>
          <span className="ml-2 text-gray-600 font-poppins">
            Cargando productos...
          </span>
        </div>
      </div>
    );
  }

  // --- Estado Vacío ---
  // Si no está cargando y no hay productos, muestra un mensaje indicando que no hay datos.
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          {/* Ícono para el estado vacío */}
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2a4 4 0 00-4-4H3m0 0V5a2 2 0 012-2h14a2 2 0 012 2v6m-4 4h.01M6 20h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 font-poppins">
            No hay productos
          </h3>
          <p className="mt-1 text-sm text-gray-500 font-poppins">
            Comienza agregando nuevos productos.
          </p>
        </div>
      </div>
    );
  }

  // --- Estado con Datos ---
  // Si no está cargando y hay productos, renderiza la tabla completa.
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cabecera de la tabla con título y contador de elementos */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-medium text-gray-900 font-poppins">
              Productos
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 order-first sm:order-last font-poppins">
              Mostrando {products.length} de {products.length}{" "}
              elementos
            </span>
          </div>
        </div>
        {/* Contenedor que permite el desplazamiento horizontal en pantallas pequeñas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Encabezados de la tabla */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Imágenes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Es personalizable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Acciones
                </th>
              </tr>
            </thead>
            {/* Cuerpo de la tabla */}
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Itera sobre el array de productos para crear una fila por cada uno */}
              {products.map((product) => (
                // Se usa product._id como 'key' única para cada fila
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Celdas con la información del producto */}
                  <td className="px-6 py-4 whitespace-nowrap font-poppins">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {product.description}
                  </td>
                  {/* Formatea el precio para que siempre tenga dos decimales */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {/* Muestra el nombre de la categoría si existe, sino, muestra el ID */}
                    {" "}
                    {product.categoryId?.name || product.categoryId}

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {/* Muestra la primera imagen del producto si existe, para evitar errores */}
                    {" "}
                    {product.images?.[0]?.image && (
                      <img
                        src={product.images[0].image}
                        alt="Producto"
                        className="w-16 h-16 rounded-lg object-cover border border-transparent"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {/* Convierte el valor booleano a un texto legible */}
                    {product.isPersonalizable ? "Sí" : "No"}
                  </td>
                  {/* Celda para las acciones (editar, eliminar) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Renderiza el componente de acciones y le pasa el producto y las funciones */}
                    <ProductActions
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Vista Mobile - Cards */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-start gap-3">
              {/* Imagen */}
              <div className="flex-shrink-0">
                {product.images?.[0]?.image ? (
                  <img
                    src={product.images[0].image}
                    alt="Producto"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base font-poppins truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-poppins mt-1 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Información adicional */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 font-poppins">Precio:</span>
                        <span className="font-medium text-gray-900 font-poppins">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 font-poppins">Stock:</span>
                        <span className="font-medium text-gray-900 font-poppins">{product.stock}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 font-poppins">Categoría:</span>
                        <span className="font-medium text-gray-900 font-poppins truncate max-w-32">
                          {product.categoryId?.name || 'Sin categoría'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 font-poppins">Personalizable:</span>
                        <span className="font-medium text-gray-900 font-poppins">
                          {product.isPersonalizable ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="ml-2 flex-shrink-0">
                    <ProductActions
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Exporta el componente para su uso en otras partes de la aplicación.
export default ProductTable;
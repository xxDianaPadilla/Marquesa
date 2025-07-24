// Ruta: frontend/src/components/ProductsAdmin/ProductTable.jsx
import React from "react";
import ProductActions from "./ProductActions";

/**
 * Componente funcional que muestra una tabla de productos
 * Mantiene el diseño original pero mejora el manejo de estados y validaciones
 * Maneja los estados de carga, vacío y cuando hay datos para mostrar
 *
 * @param {object} props - Las propiedades del componente
 * @param {Array} props.products - El array de objetos de producto a mostrar
 * @param {boolean} props.loading - Un booleano que indica si los datos se están cargando
 * @param {Function} props.onEdit - Función a ejecutar cuando se hace clic en editar un producto
 * @param {Function} props.onDelete - Función a ejecutar cuando se hace clic en eliminar un producto
 */
const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  // ============ VALIDACIÓN DE DATOS ============

  // Asegurar que products sea un array válido para evitar errores
  const safeProducts = Array.isArray(products) ? products : [];

  // ============ ESTADO DE CARGA ============
  // Si 'loading' es verdadero, muestra un indicador de carga y no renderiza el resto del componente
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-12">
          {/* Spinner animado (diseño original) */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7260]"></div>
          <span className="ml-2 text-gray-600 font-poppins">
            Cargando productos...
          </span>
        </div>
      </div>
    );
  }

  // ============ ESTADO VACÍO ============
  // Si no está cargando y no hay productos, muestra un mensaje indicando que no hay datos
  if (safeProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          {/* Ícono para el estado vacío (diseño original) */}
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

  // ============ FUNCIONES DE UTILIDAD ============

  /**
   * Maneja errores al mostrar información del producto de forma segura
   * Evita errores cuando los datos están incompletos
   * 
   * @param {Object} product - Producto a validar
   * @returns {Object} Producto con datos seguros
   */
  const getSafeProductData = (product) => {
    // Función auxiliar para manejar categoryId de forma segura
    const getCategoryDisplay = (categoryId) => {
      if (!categoryId) return 'Sin categoría';

      // Si es un objeto con nombre, devolver el nombre
      if (typeof categoryId === 'object' && categoryId.name) {
        return categoryId.name;
      }

      // Si es un string (ID), devolverlo
      if (typeof categoryId === 'string') {
        return categoryId;
      }

      // Fallback
      return 'Sin categoría';
    };

    return {
      _id: product._id || '',
      name: product.name || 'Sin nombre',
      description: product.description || 'Sin descripción',
      price: typeof product.price === 'number' ? product.price : 0,
      stock: typeof product.stock === 'number' ? product.stock : 0,
      categoryId: product.categoryId || {},
      categoryDisplay: getCategoryDisplay(product.categoryId), // ← NUEVA PROPIEDAD SEGURA
      images: Array.isArray(product.images) ? product.images : [],
      isPersonalizable: Boolean(product.isPersonalizable),
      details: product.details || ''
    };
  };

  // ============ ESTADO CON DATOS ============
  // Si no está cargando y hay productos, renderiza la tabla completa (diseño original)
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* ============ CABECERA DE LA TABLA (DISEÑO ORIGINAL) ============ */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-medium text-gray-900 font-poppins">
              Productos
            </h3>
            <span className="text-xs sm:text-sm text-gray-500 order-first sm:order-last font-poppins">
              Mostrando {safeProducts.length} de {safeProducts.length} elementos
            </span>
          </div>
        </div>

        {/* ============ CONTENEDOR CON SCROLL HORIZONTAL (DISEÑO ORIGINAL) ============ */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ============ ENCABEZADOS DE LA TABLA (DISEÑO ORIGINAL) ============ */}
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

            {/* ============ CUERPO DE LA TABLA (DISEÑO ORIGINAL MEJORADO) ============ */}
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Itera sobre el array de productos para crear una fila por cada uno */}
              {safeProducts.map((product) => {
                // Obtener datos seguros del producto para evitar errores
                const safeProduct = getSafeProductData(product);

                return (
                  // Se usa product._id como 'key' única para cada fila
                  <tr
                    key={safeProduct._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* ============ COLUMNA: NOMBRE ============ */}
                    <td className="px-6 py-4 whitespace-nowrap font-poppins">
                      <div className="text-sm font-medium text-gray-900">
                        {safeProduct.name}
                      </div>
                      {/* Mostrar detalles adicionales si existen */}
                      {safeProduct.details && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs" title={safeProduct.details}>
                          {safeProduct.details}
                        </div>
                      )}
                    </td>

                    {/* ============ COLUMNA: DESCRIPCIÓN ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      <div className="max-w-xs truncate" title={safeProduct.description}>
                        {safeProduct.description}
                      </div>
                    </td>

                    {/* ============ COLUMNA: PRECIO ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      <div className="text-sm font-medium text-gray-900">
                        ${safeProduct.price.toFixed(2)}
                      </div>
                      {/* Mostrar valor total del inventario */}
                      <div className="text-xs text-gray-500">
                        Total: ${(safeProduct.price * safeProduct.stock).toFixed(2)}
                      </div>
                    </td>

                    {/* ============ COLUMNA: STOCK ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {safeProduct.stock}
                        </span>
                        {/* Indicador visual del estado del stock */}
                        <span className={`text-xs px-2 py-1 rounded-full text-center ${safeProduct.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : safeProduct.stock < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {safeProduct.stock === 0
                            ? 'Sin stock'
                            : safeProduct.stock < 10
                              ? 'Stock bajo'
                              : 'Disponible'
                          }
                        </span>
                      </div>
                    </td>

                    {/* ============ COLUMNA: CATEGORÍA ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      <div className="text-sm text-gray-900">
                        {/* Muestra el nombre de la categoría si existe, sino, muestra el ID o mensaje por defecto */}
                        {safeProduct.categoryDisplay}
                      </div>
                    </td>

                    {/* ============ COLUMNA: IMAGEN ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      {/* Muestra la primera imagen del producto si existe, para evitar errores */}
                      {safeProduct.images.length > 0 && safeProduct.images[0]?.image ? (
                        <img
                          src={safeProduct.images[0].image}
                          alt={`Imagen de ${safeProduct.name}`}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            // Manejo de error si la imagen no carga
                            e.target.style.display = 'none';
                            console.warn(`Error al cargar imagen para producto ${safeProduct._id}`);
                          }}
                        />
                      ) : (
                        // Placeholder cuando no hay imagen
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>

                    {/* ============ COLUMNA: PERSONALIZABLE ============ */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                      <div className="flex items-center">
                        {/* Indicador visual de personalizable */}
                        {safeProduct.isPersonalizable ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ============ COLUMNA: ACCIONES ============ */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Renderiza el componente de acciones y le pasa el producto y las funciones */}
                      <ProductActions
                        product={safeProduct}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ VISTA MOBILE - CARDS (DISEÑO ORIGINAL) ============ */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {safeProducts.map(product => {
          // Obtener datos seguros del producto para la vista móvil
          const safeProduct = getSafeProductData(product);

          return (
            <div key={safeProduct._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                {/* ============ IMAGEN MÓVIL ============ */}
                <div className="flex-shrink-0">
                  {safeProduct.images.length > 0 && safeProduct.images[0]?.image ? (
                    <img
                      src={safeProduct.images[0].image}
                      alt={`Imagen de ${safeProduct.name}`}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.warn(`Error al cargar imagen para producto ${safeProduct._id}`);
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* ============ CONTENIDO MÓVIL ============ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base font-poppins truncate">
                        {safeProduct.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 font-poppins mt-1 line-clamp-2">
                        {safeProduct.description}
                      </p>

                      {/* ============ INFORMACIÓN ADICIONAL MÓVIL ============ */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-poppins">Precio:</span>
                          <span className="font-medium text-gray-900 font-poppins">${safeProduct.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-poppins">Stock:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 font-poppins">{safeProduct.stock}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${safeProduct.stock === 0
                              ? 'bg-red-100 text-red-800'
                              : safeProduct.stock < 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                              }`}>
                              {safeProduct.stock === 0
                                ? 'Sin stock'
                                : safeProduct.stock < 10
                                  ? 'Bajo'
                                  : 'OK'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-poppins">Categoría:</span>
                          <span className="font-medium text-gray-900 font-poppins truncate max-w-32">
                            {safeProduct.categoryDisplay}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-poppins">Personalizable:</span>
                          <span className="font-medium text-gray-900 font-poppins">
                            {safeProduct.isPersonalizable ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                Sí
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Valor total del inventario */}
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-poppins">Valor total:</span>
                          <span className="font-medium text-gray-900 font-poppins">
                            ${(safeProduct.price * safeProduct.stock).toFixed(2)}
                          </span>
                        </div>

                        {/* Detalles si existen */}
                        {safeProduct.details && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600 font-poppins line-clamp-2" title={safeProduct.details}>
                              <span className="font-medium">Detalles:</span> {safeProduct.details}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ============ ACCIONES MÓVIL ============ */}
                    <div className="ml-2 flex-shrink-0">
                      <ProductActions
                        product={safeProduct}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// Exporta el componente para su uso en otras partes de la aplicación
export default ProductTable;
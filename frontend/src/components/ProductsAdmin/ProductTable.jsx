// Ruta: frontend/src/components/ProductsAdmin/ProductTable.jsx
import React from 'react';
import ProductActions from './ProductActions';

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#FF7260]"></div>
          <span className="ml-2 text-gray-600 text-sm sm:text-base font-poppins">
            Cargando productos...
          </span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3m0 0V5a2 2 0 012-2h14a2 2 0 012 2v6m-4 4h.01M6 20h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 font-poppins">
            No hay productos
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 font-poppins">
            Comienza agregando nuevos productos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop - Tabla */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 font-poppins">Productos</h3>
            <span className="text-xs sm:text-sm text-gray-500 order-first sm:order-last font-poppins">
              Mostrando {products.length} de {products.length} elementos
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Imagen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Personalizable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap font-poppins text-sm">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-poppins max-w-xs truncate">{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {product.categoryId?.name || product.categoryId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.images?.[0]?.image && (
                      <img
                        src={product.images[0].image}
                        alt="Producto"
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                    {product.isPersonalizable ? 'Sí' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Vista Tablet - Grid compacto */}
      <div className="hidden md:block xl:hidden">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 font-poppins">Productos</h3>
            <span className="text-sm text-gray-500 font-poppins">
              {products.length} elementos
            </span>
          </div>
          <div className="grid gap-4">
            {products.map(product => (
              <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Imagen */}
                  <div className="flex-shrink-0">
                    {product.images?.[0]?.image ? (
                      <img
                        src={product.images[0].image}
                        alt="Producto"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <h4 className="font-medium text-gray-900 font-poppins truncate">{product.name}</h4>
                        <p className="text-sm text-gray-600 font-poppins truncate">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 font-poppins">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600 font-poppins">Stock: {product.stock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-poppins">
                          Categoría: {product.categoryId?.name || 'Sin categoría'}
                        </p>
                        <p className="text-sm text-gray-600 font-poppins">
                          {product.isPersonalizable ? 'Personalizable' : 'No personalizable'}
                        </p>
                      </div>
                      <div className="text-right">
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

export default ProductTable;
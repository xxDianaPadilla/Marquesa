import React from 'react';
import ProductActions from './ProductActions';

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7260]"></div>
          <span className="ml-2 text-gray-600 font-poppins">
            Cargando productos...
          </span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3m0 0V5a2 2 0 012-2h14a2 2 0 012 2v6m-4 4h.01M6 20h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-medium text-gray-900 font-poppins">Productos</h3>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Imágenes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Es personalizable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Detalles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap font-poppins">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">{product.stock}</td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
  {product.categoryId?.name || product.categoryId}
</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                  {product.images?.[0]?.image && (
                    <img
  src={product.images[0].image}
  alt="Producto"
  className="w-16 h-16 rounded-lg object-cover border border-transparent"
/>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">
                  {product.isPersonalizable ? 'Sí' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-poppins">{product.details}</td>
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
  );
};

export default ProductTable;

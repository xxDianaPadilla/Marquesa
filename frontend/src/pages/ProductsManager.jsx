import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import useDataProducts from "../components/ProductsAdmin/hooks/useDataProducts";
import ProductTable from "../components/ProductsAdmin/ProductTable";
import ProductForm from "../components/ProductsAdmin/ProductForm";
import { FaPlus, FaSearch } from "react-icons/fa";

const ProductsManager = () => {
  const {
    id,
    name,
    description,
    price,
    stock,
    categoryId,
    image,
    isPersonalizable,
    details,
    products,
    loading,
    categories,
    createProduct,
    deleteProduct,
    handleEdit,
    updateProduct,
    resetForm,
  } = useDataProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Validación segura: asegurarse de que products sea un array
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Filtrar productos solo si products es un array válido
  const filteredProducts = safeProducts.filter((product) =>
    product && product.name && 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = () => {
    setEditingProduct(null);
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleEditProduct = (product) => {
    console.log("Producto a editar:", product);
    setEditingProduct(product);
    updateProduct(product);
    setShowForm(true);
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        console.log("Editando producto con ID:", id);
        await handleEdit(productData);
      } else {
        console.log("Creando nuevo producto");
        await createProduct(productData);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error al procesar producto:", error);
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-3 sm:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7260]"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-poppins">
                Gestión de Productos
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base font-poppins">
                Administra tus productos disponibles en el sistema
              </p>
              {/* Mostrar información de estado para debug */}
              <p className="text-xs text-gray-500 mt-1">
                Total productos: {safeProducts.length} | 
                Filtrados: {filteredProducts.length}
              </p>
            </div>
            <button
              onClick={handleOpenForm}
              className="w-full sm:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="hidden sm:inline">Añadir Producto</span>
              <span className="sm:hidden">Añadir</span>
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base font-poppins"
              />
              <FaSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Mostrar mensaje si no hay productos */}
        {safeProducts.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg font-poppins">
              No hay productos disponibles
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Comienza añadiendo tu primer producto
            </p>
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados de búsqueda */}
        {safeProducts.length > 0 && filteredProducts.length === 0 && searchTerm && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg font-poppins">
              No se encontraron productos que coincidan con "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-[#FF7260] hover:text-[#FF7260]/80 text-sm"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Tabla de productos */}
        {filteredProducts.length > 0 && (
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
          />
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/10 backdrop-blur-[2px]">
          <ProductForm
            isOpen={showForm}
            onClose={handleCloseForm}
            onSubmit={handleProductSubmit}
            productData={editingProduct}
            categories={categories}
            isEditing={!!editingProduct}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsManager;
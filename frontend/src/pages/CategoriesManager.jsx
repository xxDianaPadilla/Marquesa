// Ruta: frontend/src/pages/CategoriesManager.jsx
import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import useDataCategories from "../components/Categories/hooks/useDataCategories";
import CategoryTable from "../components/Categories/CategoryTable";
import CategoryForm from "../components/Categories/CategoryForm";

// Página para gestionar las categorías de productos
const CategoriesManager = () => {
  const {
    activeTab,
    setActiveTab,
    id,
    name,
    setName,
    image,
    setImage,
    categories,
    setCategories,
    loading,
    createCategorie,
    deleteCategorie,
    updateCategorie,
    handleEdit,
  } = useDataCategories();
  // Estado para manejar la búsqueda de categorías
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fix: Asegurar que categories sea siempre un array
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = safeCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
// Función para manejar la apertura del formulario de creación/edición
  const handleOpenForm = () => {
    setShowForm(true);
    setActiveTab("form");
  };
// Función para cerrar el formulario y resetear el estado
  const handleCloseForm = () => {
    setShowForm(false);
    setActiveTab("list");
  };
// Función para manejar la edición de una categoría
  const handleEditCategory = (category) => {
    updateCategorie(category);
    setShowForm(true);
  };
// Función para manejar la creación de una nueva categoría
  const handleCreateCategory = async (categoryData) => {
    try {
      await createCategorie(categoryData);
      handleCloseForm();
    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };
// Función para manejar la actualización de una categoría
  const handleUpdateCategory = async (categoryData) => {
    try {
      await handleEdit(categoryData);
      handleCloseForm();
    } catch (error) {
      console.error("Error al editar categoría:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-2 sm:p-3 lg:p-6">
        {/* Header completamente responsivo */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1
                className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Categorías de Marquesa
              </h1>
              <p
                className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Gestiona las categorías de tus productos
              </p>
            </div>
            <button
              onClick={handleOpenForm}
              className="w-full sm:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base shrink-0"
              style={{ fontFamily: "Poppins, sans-serif", cursor: "pointer" }}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
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
              <span className="hidden sm:inline">Añadir Categoría</span>
              <span className="sm:hidden">Añadir</span>
            </button>
          </div>

          {/* Filtros y búsqueda responsivos */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
            {/* Buscador */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              />
              <svg
                className="absolute left-2 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center justify-center sm:justify-start">
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border" style={{ fontFamily: "Poppins, sans-serif" }}>
                {filteredCategories.length} de {safeCategories.length} categorías
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de categorías responsiva */}
        <CategoryTable
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEditCategory}
          onDelete={deleteCategorie}
        />

        {/* Mensaje cuando no hay resultados de búsqueda */}
        {searchTerm && filteredCategories.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron categorías
            </h3>
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No hay categorías que coincidan con "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF7260] hover:bg-[#FF6250] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7260]"
              style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar búsqueda
            </button>
          </div>
        )}
      </div>

      {/* Modal del formulario con overlay completamente responsivo */}
      {showForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/10 backdrop-blur-[2px] p-2 sm:p-4">
          <CategoryForm
            isOpen={showForm}
            onClose={handleCloseForm}
            onSubmit={id ? handleUpdateCategory : handleCreateCategory}
            name={name}
            setName={setName}
            image={image}
            setImage={setImage}
            isEditing={!!id}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default CategoriesManager;
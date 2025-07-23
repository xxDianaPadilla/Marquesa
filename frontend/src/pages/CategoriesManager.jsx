// Ruta: frontend/src/pages/CategoriesManager.jsx
import React, { useState, useCallback, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import useDataCategories from "../components/Categories/hooks/useDataCategories";
import CategoryTable from "../components/Categories/CategoryTable";
import CategoryForm from "../components/Categories/CategoryForm";

/**
 * Página principal para gestionar las categorías de productos
 * Integra todos los componentes y la lógica para CRUD de categorías
 * Incluye búsqueda, filtrado y manejo de estado optimizado
 */
const CategoriesManager = () => {
  
  // ============ HOOK DE DATOS DE CATEGORÍAS ============
  
  // Obtener todas las funciones y estados del hook personalizado
  const {
    activeTab,
    setActiveTab,
    id,
    name,
    setName,
    image,
    setImage,
    categories,
    loading,
    submitting,
    createCategorie,
    deleteCategorie,
    updateCategorie,
    handleEdit,
    clearFormData,
    cancelOperation,
    isOperationInProgress,
    getFormState
  } = useDataCategories();

  // ============ ESTADOS LOCALES DE LA PÁGINA ============
  
  // Estado para manejar la búsqueda de categorías
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para controlar la visibilidad del modal del formulario
  const [showForm, setShowForm] = useState(false);

  // ============ DATOS PROCESADOS Y OPTIMIZADOS ============
  
  /**
   * Asegurar que categories sea siempre un array válido
   * Previene errores cuando categories es undefined o null
   */
  const safeCategories = useMemo(() => {
    return Array.isArray(categories) ? categories : [];
  }, [categories]);

  /**
   * Filtrar categorías basado en el término de búsqueda
   * Optimizado con useMemo para evitar recálculos innecesarios
   */
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return safeCategories;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return safeCategories.filter((category) =>
      category.name && category.name.toLowerCase().includes(searchLower)
    );
  }, [safeCategories, searchTerm]);

  // ============ MANEJADORES DE EVENTOS OPTIMIZADOS ============
  
  /**
   * Maneja la apertura del formulario para crear nueva categoría
   * Limpia el estado previo y abre el modal
   */
  const handleOpenForm = useCallback(() => {
    console.log('➕ Abriendo formulario para nueva categoría');
    
    // Limpiar cualquier dato previo del formulario
    clearFormData();
    
    // Mostrar el modal del formulario
    setShowForm(true);
    
    // Cambiar a la pestaña de formulario
    setActiveTab("form");
  }, [clearFormData, setActiveTab]);

  /**
   * Maneja el cierre del formulario
   * Oculta el modal y limpia el estado
   */
  const handleCloseForm = useCallback(() => {
    console.log('❌ Cerrando formulario');
    
    // Ocultar el modal
    setShowForm(false);
    
    // Volver a la pestaña de lista
    setActiveTab("list");
    
    // Limpiar datos del formulario
    clearFormData();
  }, [setActiveTab, clearFormData]);

  /**
   * Maneja la edición de una categoría existente
   * Prepara el formulario con los datos de la categoría y abre el modal
   * 
   * @param {Object} category - Datos de la categoría a editar
   */
  const handleEditCategory = useCallback((category) => {
    // Validar que se proporcionen datos válidos
    if (!category || !category._id) {
      console.error('❌ Datos de categoría inválidos para edición:', category);
      return;
    }

    console.log("📝 Iniciando edición de categoría:", category.name);
    
    try {
      // Preparar el formulario con los datos de la categoría
      updateCategorie(category);
      
      // Mostrar el modal del formulario
      setShowForm(true);
      
      console.log('✅ Formulario de edición preparado');
    } catch (error) {
      console.error('❌ Error al preparar edición:', error);
    }
  }, [updateCategorie]);

  /**
   * Maneja la creación de una nueva categoría
   * Procesa el formulario y cierra el modal al completarse
   * 
   * @param {Event} categoryData - Datos del formulario (evento simulado)
   */
  const handleCreateCategory = useCallback(async (categoryData) => {
    console.log('💾 Procesando creación de categoría');
    
    try {
      // Ejecutar la función de creación
      await createCategorie(categoryData);
      
      // Cerrar el formulario solo si la operación fue exitosa
      // (createCategorie ya maneja los errores y mensajes)
      console.log('✅ Categoría creada, cerrando formulario');
      handleCloseForm();
      
    } catch (error) {
      console.error("❌ Error al crear categoría:", error);
      // No cerrar el formulario en caso de error para que el usuario pueda corregir
    }
  }, [createCategorie, handleCloseForm]);

  /**
   * Maneja la actualización de una categoría existente
   * Procesa los cambios y cierra el modal al completarse
   * 
   * @param {Event} categoryData - Datos del formulario (evento simulado)
   */
  const handleUpdateCategory = useCallback(async (categoryData) => {
    console.log('💾 Procesando actualización de categoría');
    
    try {
      // Ejecutar la función de edición
      await handleEdit(categoryData);
      
      // Cerrar el formulario solo si la operación fue exitosa
      console.log('✅ Categoría actualizada, cerrando formulario');
      handleCloseForm();
      
    } catch (error) {
      console.error("❌ Error al actualizar categoría:", error);
      // No cerrar el formulario en caso de error
    }
  }, [handleEdit, handleCloseForm]);

  /**
   * Maneja la limpieza del término de búsqueda
   * Optimizado con useCallback para evitar re-renders
   */
  const handleClearSearch = useCallback(() => {
    console.log('🔍 Limpiando búsqueda');
    setSearchTerm("");
  }, []);

  /**
   * Maneja el cambio en el campo de búsqueda
   * Optimizado para mejor rendimiento
   */
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // ============ VARIABLES DERIVADAS ============
  
  // Determinar si estamos en modo edición
  const isEditing = useMemo(() => !!id, [id]);
  
  // Determinar si hay operaciones en progreso
  const operationInProgress = isOperationInProgress();
  
  // Contar resultados de búsqueda
  const searchResultsCount = filteredCategories.length;
  const totalCategoriesCount = safeCategories.length;

  // ============ RENDERIZADO PRINCIPAL ============
  
  return (
    <AdminLayout>
      <div className="p-2 sm:p-3 lg:p-6">
        
        {/* ============ HEADER RESPONSIVO ============ */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4 sm:mb-6">
            
            {/* ---- Información del header ---- */}
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
            
            {/* ---- Botón para añadir categoría ---- */}
            <button
              onClick={handleOpenForm}
              disabled={operationInProgress} // Deshabilitar durante operaciones
              className="w-full sm:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {/* Icono de más */}
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

          {/* ---- Filtros y búsqueda responsivos ---- */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
            
            {/* Buscador */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={operationInProgress} // Deshabilitar durante operaciones
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Poppins, sans-serif" }}
              />
              
              {/* Icono de búsqueda */}
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
              
              {/* Botón para limpiar búsqueda */}
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  disabled={operationInProgress}
                  className="absolute right-2 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  title="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center justify-center sm:justify-start">
              <span 
                className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border" 
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {searchResultsCount} de {totalCategoriesCount} categorías
              </span>
            </div>
          </div>
        </div>

        {/* ============ TABLA DE CATEGORÍAS RESPONSIVA ============ */}
        <CategoryTable
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEditCategory}
          onDelete={deleteCategorie}
        />

        {/* ============ MENSAJE DE NO RESULTADOS ============ */}
        {searchTerm && searchResultsCount === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            
            {/* Icono de búsqueda sin resultados */}
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Mensaje principal */}
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No se encontraron categorías
            </h3>
            
            {/* Mensaje descriptivo */}
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No hay categorías que coincidan con "<span className="font-medium">{searchTerm}</span>"
            </p>
            
            {/* Botón para limpiar búsqueda */}
            <button
              onClick={handleClearSearch}
              disabled={operationInProgress}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF7260] hover:bg-[#FF6250] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7260] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* ============ MENSAJE CUANDO NO HAY CATEGORÍAS ============ */}
        {!loading && !searchTerm && totalCategoriesCount === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            
            {/* Icono de categorías vacías */}
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            
            {/* Mensaje principal */}
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No hay categorías creadas
            </h3>
            
            {/* Mensaje descriptivo */}
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Comienza creando tu primera categoría de productos
            </p>
            
            {/* Botón para crear primera categoría */}
            <button
              onClick={handleOpenForm}
              disabled={operationInProgress}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF7260] hover:bg-[#FF6250] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7260] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear primera categoría
            </button>
          </div>
        )}
      </div>

      {/* ============ MODAL DEL FORMULARIO ============ */}
      {showForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/10 backdrop-blur-[2px] p-2 sm:p-4">
          <CategoryForm
            isOpen={showForm}
            onClose={handleCloseForm}
            onSubmit={isEditing ? handleUpdateCategory : handleCreateCategory}
            name={name}
            setName={setName}
            image={image}
            setImage={setImage}
            isEditing={isEditing}
          />
        </div>
      )}

      {/* ============ INDICADOR DE OPERACIÓN EN PROGRESO ============ */}
      {submitting && (
        <div className="fixed top-4 right-4 z-[9999] bg-white rounded-lg shadow-lg border p-3 sm:p-4 flex items-center space-x-3">
          
          {/* Spinner de carga */}
          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-[#FF7260]"></div>
          
          {/* Mensaje de estado */}
          <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isEditing ? 'Actualizando categoría...' : 'Creando categoría...'}
          </span>
        </div>
      )}
    </AdminLayout>
  );
};

export default CategoriesManager;
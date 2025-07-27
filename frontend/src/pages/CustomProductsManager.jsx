import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from "../components/AdminLayout";
import MaterialForm from "../components/MaterialForm";
import useCustomProductsMaterials from "../components/CustomProductsMaterials/hooks/useCustomProductsMaterials";

const CustomProductsManager = () => {
    const {
        materials,
        loading,
        error,
        createMaterial,
        updateMaterial,
        deleteMaterial,
    } = useCustomProductsMaterials();

    const [showForm, setShowForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [operationLoading, setOperationLoading] = useState({
        creating: false,
        updating: false,
        deleting: null, // ID del material que se está eliminando
    });

    // Filtrar materiales por término de búsqueda
    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.productToPersonalize.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.categoryToParticipate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateMaterial = async (materialData) => {
        setOperationLoading(prev => ({ ...prev, creating: true }));
        try {
            await createMaterial(materialData);
            setShowForm(false);
            toast.success('¡Material creado exitosamente!', {
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#10B981',
                    color: 'white',
                },
                icon: '✅',
            });
        } catch (error) {
            console.error('Error completo:', error);
            toast.error(`Error al crear el material: ${error.message}`, {
                duration: 5000,
                position: 'top-right',
                style: {
                    background: '#EF4444',
                    color: 'white',
                },
                icon: '❌',
            });
        } finally {
            setOperationLoading(prev => ({ ...prev, creating: false }));
        }
    };

    const handleUpdateMaterial = async (materialData) => {
        setOperationLoading(prev => ({ ...prev, updating: true }));
        try {
            await updateMaterial(editingMaterial._id, materialData);
            setEditingMaterial(null);
            setShowForm(false);
            toast.success('¡Material actualizado exitosamente!', {
                duration: 4000,
                position: 'top-right',
                style: {
                    background: '#10B981',
                    color: 'white',
                },
                icon: '📝',
            });
        } catch (error) {
            console.error('Error completo:', error);
            toast.error(`Error al actualizar el material: ${error.message}`, {
                duration: 5000,
                position: 'top-right',
                style: {
                    background: '#EF4444',
                    color: 'white',
                },
                icon: '❌',
            });
        } finally {
            setOperationLoading(prev => ({ ...prev, updating: false }));
        }
    };

    const handleDeleteMaterial = async (id) => {
        const materialToDelete = materials.find(m => m._id === id);
        const materialName = materialToDelete?.name || 'este material';

        // Toast de confirmación personalizado
        toast((t) => (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span className="font-medium">¿Eliminar material?</span>
                </div>
                <p className="text-sm text-gray-600">
                    Se eliminará permanentemente "{materialName}"
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setOperationLoading(prev => ({ ...prev, deleting: id }));
                            try {
                                await deleteMaterial(id);
                                toast.success('¡Material eliminado exitosamente!', {
                                    duration: 3000,
                                    position: 'top-right',
                                    style: {
                                        background: '#EF4444',
                                        color: 'white',
                                    },
                                    icon: '🗑️',
                                });
                            } catch (error) {
                                console.error('Error completo:', error);
                                toast.error(`Error al eliminar el material: ${error.message}`, {
                                    duration: 5000,
                                    position: 'top-right',
                                    style: {
                                        background: '#EF4444',
                                        color: 'white',
                                    },
                                    icon: '❌',
                                });
                            } finally {
                                setOperationLoading(prev => ({ ...prev, deleting: null }));
                            }
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
        });
    };

    const handleEditClick = (material) => {
        setEditingMaterial(material);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingMaterial(null);
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Agotado', class: 'bg-red-100 text-red-800' };
        if (stock <= 5) return { text: 'Bajo Stock', class: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Disponible', class: 'bg-green-100 text-green-800' };
    };

    // Componente de Skeleton para la carga inicial
    const MaterialSkeleton = () => (
        <div className="grid grid-cols-8 gap-4 px-6 py-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    );

    // Mostrar skeleton solo en la carga inicial
    const showSkeleton = loading && materials.length === 0;

    return (
        <AdminLayout>
            <div className="p-2 sm:p-3 lg:p-6">
                {/* Toast Container */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '8px',
                            fontSize: '14px',
                        },
                    }}
                />

                {/* ============ HEADER RESPONSIVO ============ */}
                <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                Gestión de Materiales
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Administra los materiales disponibles para productos personalizados
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Total materiales: {materials.length} | Filtrados: {filteredMaterials.length}
                            </p>
                        </div>
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowForm(true)}
                            disabled={operationLoading.creating}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base ${operationLoading.creating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#FDB4B7] hover:bg-[#F2C6C2] hover:scale-105'
                                } text-white`}
                        >
                            {operationLoading.creating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span className="hidden sm:inline">Preparando...</span>
                                    <span className="sm:hidden">...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">+</span>
                                    <span className="hidden sm:inline">Añadir Material</span>
                                    <span className="sm:hidden">Añadir</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar materiales..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="text-right text-xs sm:text-sm text-gray-500">
                            {filteredMaterials.length} de {materials.length} materiales
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">⚠️</span>
                        <div className="text-sm sm:text-base">
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Materials Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold">Materiales</h2>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Mostrando {filteredMaterials.length} de {materials.length} elementos
                                </p>
                            </div>
                            {loading && materials.length > 0 && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                    Actualizando...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                        {/* Table Header */}
                        <div className="grid grid-cols-8 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                            <div>NOMBRE</div>
                            <div>DESCRIPCIÓN</div>
                            <div>PRECIO</div>
                            <div>STOCK</div>
                            <div>CATEGORÍA</div>
                            <div>IMAGEN</div>
                            <div>PRODUCTO</div>
                            <div>ACCIONES</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-200">
                            {showSkeleton ? (
                                // Mostrar skeletons durante la carga inicial
                                Array(5).fill(0).map((_, index) => (
                                    <MaterialSkeleton key={index} />
                                ))
                            ) : (
                                filteredMaterials.map((material) => {
                                    const stockStatus = getStockStatus(material.stock);
                                    const isDeleting = operationLoading.deleting === material._id;

                                    return (
                                        <div
                                            key={material._id}
                                            className={`grid grid-cols-8 gap-4 px-6 py-4 transition-all duration-200 ${isDeleting
                                                ? 'bg-red-50 opacity-50'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {/* Nombre */}
                                            <div>
                                                <div className="font-medium text-gray-900">{material.name}</div>
                                            </div>

                                            {/* Descripción */}
                                            <div>
                                                <div className="text-gray-600 text-sm truncate">
                                                    {material.categoryToParticipate}
                                                </div>
                                            </div>

                                            {/* Precio */}
                                            <div>
                                                <div className="font-medium">${material.price.toFixed(2)}</div>
                                            </div>

                                            {/* Stock */}
                                            <div>
                                                <div className="font-medium">{material.stock}</div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </div>

                                            {/* Categoría */}
                                            <div>
                                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    {material.categoryToParticipate}
                                                </span>
                                            </div>

                                            {/* Imagen */}
                                            <div>
                                                <img
                                                    src={material.image}
                                                    alt={material.name}
                                                    className="w-12 h-12 object-cover rounded-lg border"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                            </div>

                                            {/* Producto */}
                                            <div>
                                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {material.productToPersonalize}
                                                </span>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex gap-2">
                                                <button
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleEditClick(material)}
                                                    disabled={isDeleting}
                                                    className={`p-2 rounded-md transition-all duration-200 ${isDeleting
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                                                        }`}
                                                    title="Editar material"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleDeleteMaterial(material._id)}
                                                    disabled={isDeleting}
                                                    className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${isDeleting
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                        }`}
                                                    title="Eliminar material"
                                                >
                                                    {isDeleting ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border border-red-500 border-t-transparent"></div>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden">
                        <div className="divide-y divide-gray-200">
                            {showSkeleton ? (
                                // Mobile skeletons
                                Array(5).fill(0).map((_, index) => (
                                    <div key={index} className="p-4 animate-pulse">
                                        <div className="flex items-start gap-3">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredMaterials.map((material) => {
                                    const stockStatus = getStockStatus(material.stock);
                                    const isDeleting = operationLoading.deleting === material._id;

                                    return (
                                        <div
                                            key={material._id}
                                            className={`p-3 sm:p-4 transition-all duration-200 ${isDeleting
                                                ? 'bg-red-50 opacity-50'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                {/* Imagen */}
                                                <img
                                                    src={material.image}
                                                    alt={material.name}
                                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />

                                                {/* Contenido principal */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Nombre y precio */}
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                                            {material.name}
                                                        </h3>
                                                        <span className="font-semibold text-green-600 text-sm sm:text-base flex-shrink-0">
                                                            ${material.price.toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {/* Categoría y producto */}
                                                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                            {material.categoryToParticipate}
                                                        </span>
                                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                            {material.productToPersonalize}
                                                        </span>
                                                    </div>

                                                    {/* Stock y acciones */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">
                                                                Stock: <span className="font-medium">{material.stock}</span>
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                                                                {stockStatus.text}
                                                            </span>
                                                        </div>

                                                        {/* Acciones */}
                                                        <div className="flex gap-1 sm:gap-2">
                                                            <button
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleEditClick(material)}
                                                                disabled={isDeleting}
                                                                className={`p-2 rounded-md transition-all duration-200 ${isDeleting
                                                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                                                                    }`}
                                                                title="Editar material"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleDeleteMaterial(material._id)}
                                                                disabled={isDeleting}
                                                                className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${isDeleting
                                                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                                    }`}
                                                                title="Eliminar material"
                                                            >
                                                                {isDeleting ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border border-red-500 border-t-transparent"></div>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    {!showSkeleton && filteredMaterials.length === 0 && (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="text-4xl sm:text-6xl mb-4">📦</div>
                            <div className="text-gray-500 mb-4 text-sm sm:text-base">
                                {searchTerm ? 'No se encontraron materiales que coincidan con tu búsqueda' : 'No hay materiales registrados'}
                            </div>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all hover:scale-105 text-sm sm:text-base"
                                >
                                    Añadir primer material
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                {showForm && (
                    <MaterialForm
                        onSubmit={editingMaterial ? handleUpdateMaterial : handleCreateMaterial}
                        initialData={editingMaterial}
                        onCancel={handleCloseForm}
                        isLoading={operationLoading.creating || operationLoading.updating}
                        submitText={
                            operationLoading.creating ? 'Creando...' :
                                operationLoading.updating ? 'Actualizando...' :
                                    editingMaterial ? 'Actualizar Material' : 'Crear Material'
                        }
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default CustomProductsManager;
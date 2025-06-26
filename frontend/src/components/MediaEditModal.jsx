import React, { useState, useEffect } from "react";

/**
 * Componente MediaEditModal
 * Ruta: frontend/src/components/MediaEditModal.jsx
 * Modal para editar elementos multimedia existentes
 */
const MediaEditModal = ({ item, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        type: "",
        title: "",
        url: "",
        description: "",
        category: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Opciones de categorías
    const categories = [
        { value: "flores-naturales", label: "Flores Naturales" },
        { value: "flores-secas", label: "Flores Secas" },
        { value: "cuadros-decorativos", label: "Cuadros Decorativos" },
        { value: "giftboxes", label: "Giftboxes" },
        { value: "tarjetas", label: "Tarjetas" },
        { value: "eventos", label: "Eventos" },
        { value: "consejos", label: "Consejos" }
    ];

    // Cargar datos del item al abrir el modal
    useEffect(() => {
        if (item) {
            setFormData({
                type: item.type,
                title: item.title,
                url: item.url,
                description: item.description,
                category: item.category
            });
        }
    }, [item]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "El título es requerido";
        }

        if (!formData.url.trim()) {
            newErrors.url = "La URL es requerida";
        } else {
            // Validación básica de URL
            try {
                new URL(formData.url);
            } catch {
                newErrors.url = "La URL no es válida";
            }
        }

        if (!formData.description.trim()) {
            newErrors.description = "La descripción es requerida";
        }

        if (!formData.category) {
            newErrors.category = "La categoría es requerida";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simular tiempo de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const editedItem = {
                ...item,
                ...formData
            };
            
            onConfirm(editedItem);
        } catch (error) {
            console.error("Error al editar multimedia:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Editar Multimedia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido del modal */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tipo de archivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tipo de archivo
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <option value="imagen">Imagen</option>
                            <option value="video">Video</option>
                            <option value="blog">Blog</option>
                        </select>
                    </div>

                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Título *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el título"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            URL *
                        </label>
                        <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.url ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="https://example.com/archivo.jpg"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.url && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.url}
                            </p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Descripción *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Describe el contenido multimedia"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Categoría *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent ${
                                errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.category}
                            </p>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <strong>ID:</strong> {item.id}
                        </p>
                        <p className="text-xs text-gray-600 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <strong>Creado:</strong> {new Date(item.createdAt).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <strong>Tamaño:</strong> {item.size}
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#FF7260] text-white rounded-lg hover:bg-[#FF6A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MediaEditModal;
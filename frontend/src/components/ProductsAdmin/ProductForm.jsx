// Ruta: frontend/src/components/ProductsAdmin/ProductForm.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X, Upload, Trash2 } from 'lucide-react';
import OverlayBackdrop from '../OverlayBackdrop';

/**
 * Componente para el formulario de productos - REDISEÑADO DESDE CERO
 * Diseño completamente consistente con el resto de modales usando OverlayBackdrop
 * Permite crear o editar productos con validación en tiempo real y manejo de múltiples imágenes
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSubmit - Función para enviar el formulario
 * @param {Object} props.productData - Datos del producto para edición
 * @param {Array} props.categories - Lista de categorías disponibles
 * @param {boolean} props.isEditing - Si está en modo edición
 * @param {Object} props.validationErrors - Errores de validación externos
 * @param {boolean} props.isSubmitting - Si se está enviando el formulario
 */
const ProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  productData = {},
  categories = [],
  isEditing,
  validationErrors = {},
  isSubmitting = false
}) => {
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // ============ CONFIGURACIÓN DEL FORMULARIO ============

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
      images: [],
      isPersonalizable: false,
      details: ''
    },
    mode: 'onChange'
  });

  // ============ REGLAS DE VALIDACIÓN ============

  const validationRules = {
    name: {
      required: "El nombre es obligatorio",
      minLength: {
        value: 2,
        message: "El nombre debe tener al menos 2 caracteres"
      },
      maxLength: {
        value: 100,
        message: "El nombre no puede exceder 100 caracteres"
      },
      validate: (value) => {
        if (!value?.trim()) {
          return "El nombre no puede estar vacío";
        }
        return true;
      }
    },

    description: {
      required: "La descripción es obligatoria",
      minLength: {
        value: 10,
        message: "La descripción debe tener al menos 10 caracteres"
      },
      maxLength: {
        value: 500,
        message: "La descripción no puede exceder 500 caracteres"
      },
      validate: (value) => {
        if (!value?.trim()) {
          return "La descripción no puede estar vacía";
        }
        return true;
      }
    },

    price: {
      required: "El precio es obligatorio",
      validate: (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return "El precio debe ser un número válido";
        }
        if (numValue <= 0) {
          return "El precio debe ser mayor a 0";
        }
        if (numValue > 999999.99) {
          return "El precio no puede exceder $999,999.99";
        }
        return true;
      }
    },

    stock: {
      required: "El stock es obligatorio",
      validate: (value) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
          return "El stock debe ser un número entero";
        }
        if (numValue < 0) {
          return "El stock no puede ser negativo";
        }
        if (numValue > 999999) {
          return "El stock no puede exceder 999,999 unidades";
        }
        return true;
      }
    },

    categoryId: {
      required: "Selecciona una categoría"
    },

    images: {
      validate: () => {
        if (!isEditing && selectedImages.length === 0) {
          return "Debes seleccionar al menos una imagen";
        }
        if (selectedImages.length > 5) {
          return "Máximo 5 imágenes permitidas";
        }
        return true;
      }
    }
  };

  // ============ FUNCIONES PARA MANEJO DE IMÁGENES ============

  const createPreviewUrls = (files) => {
    return files.map(file => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return file;
    });
  };

  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      setError('images', {
        type: 'manual',
        message: `Solo puedes seleccionar ${5 - selectedImages.length} imágenes más (máximo 5 total)`
      });
      return;
    }

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('images', {
          type: 'manual',
          message: `La imagen "${file.name}" excede el tamaño máximo de 5MB`
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('images', {
          type: 'manual',
          message: `"${file.name}" no es un archivo de imagen válido`
        });
        return;
      }
    }

    const updatedImages = [...selectedImages, ...files];
    const updatedPreviews = [...imagePreviewUrls, ...createPreviewUrls(files)];

    setSelectedImages(updatedImages);
    setImagePreviewUrls(updatedPreviews);
    setValue('images', updatedImages);
    clearErrors('images');
    e.target.value = '';
  };

  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviewUrls.filter((_, i) => i !== index);

    if (imagePreviewUrls[index] && imagePreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    setSelectedImages(updatedImages);
    setImagePreviewUrls(updatedPreviews);
    setValue('images', updatedImages);
    clearErrors('images');
  };

  const openFileSelector = () => {
    if (selectedImages.length >= 5) {
      setError('images', {
        type: 'manual',
        message: 'Ya has alcanzado el máximo de 5 imágenes'
      });
      return;
    }
    fileInputRef.current?.click();
  };

  // ============ EFECTOS ============

  useEffect(() => {
    if (isOpen) {
      if (productData && isEditing) {
        console.log('Llenando formulario para edición:', productData);
        
        setValue('name', productData.name || '');
        setValue('description', productData.description || '');
        setValue('price', productData.price || '');
        setValue('stock', productData.stock || '');
        setValue('categoryId', productData.categoryId?._id || '');
        setValue('isPersonalizable', productData.isPersonalizable ?? false);
        setValue('details', productData.details || '');

        if (productData.images && productData.images.length > 0) {
          const existingImages = productData.images.map(img => img.image || img);
          setSelectedImages(existingImages);
          setImagePreviewUrls(existingImages);
          setValue('images', existingImages);
        } else {
          setSelectedImages([]);
          setImagePreviewUrls([]);
          setValue('images', []);
        }
      } else {
        console.log('Inicializando formulario para nuevo producto');
        reset();
        setSelectedImages([]);
        setImagePreviewUrls([]);
      }
    }
  }, [isOpen, productData, setValue, reset, isEditing]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, {
          type: 'server',
          message: message
        });
      });
    }
  }, [validationErrors, setError]);

  // ============ MANEJADORES DE EVENTOS ============

  const handleFormSubmit = (data) => {
    console.log('📤 Enviando formulario con datos:', data);
    const formDataWithImages = {
      ...data,
      images: selectedImages
    };
    onSubmit(formDataWithImages);
  };

  const handleClose = () => {
    console.log('❌ Cerrando formulario de productos');
    imagePreviewUrls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
    reset();
    onClose();
  };

  // ============ COMPONENTE DE ALERTA ============

  const Alert = ({ type, message }) => {
    const styles = {
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: AlertCircle
      },
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: CheckCircle
      }
    };
    const style = styles[type] || styles.error;
    const Icon = style.icon;

    return (
      <div className={`${style.bg} ${style.border} border rounded-lg p-2 sm:p-3 flex items-start space-x-2 mt-1 sm:mt-2`}>
        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${style.text} flex-shrink-0 mt-0.5`} />
        <span className={`text-xs sm:text-sm ${style.text}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
          {message}
        </span>
      </div>
    );
  };

  const categoriesArray = Array.isArray(categories) ? categories : [];

  if (!isOpen) return null;

  return (
    <OverlayBackdrop isVisible={isOpen} onClose={handleClose}>
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div 
          className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200 mx-2 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* ============ HEADER FIJO ============ */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isEditing ? 'Modifica la información del producto' : 'Añade un nuevo producto al catálogo'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Cerrar modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* ============ FORMULARIO SCROLLEABLE ============ */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
              <div className="space-y-6">

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Nombre del producto *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={validationRules.name}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type="text"
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ingresa el nombre del producto"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          maxLength={100}
                        />
                        <div className="absolute right-3 top-2 text-xs text-gray-400">
                          {field.value?.length || 0}/100
                        </div>
                      </div>
                    )}
                  />
                  {errors.name && <Alert type="error" message={errors.name.message} />}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Descripción *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={validationRules.description}
                    render={({ field, fieldState }) => (
                      <div className="relative">
                        <textarea
                          {...field}
                          rows={4}
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Describe el producto"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          maxLength={500}
                        />
                        <div className="absolute right-3 bottom-2 text-xs text-gray-400">
                          {field.value?.length || 0}/500
                        </div>
                      </div>
                    )}
                  />
                  {errors.description && <Alert type="error" message={errors.description.message} />}
                </div>

                {/* Precio y Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Precio *
                    </label>
                    <Controller
                      name="price"
                      control={control}
                      rules={validationRules.price}
                      render={({ field, fieldState }) => (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            disabled={isSubmitting}
                            className={`w-full pl-8 pr-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          />
                        </div>
                      )}
                    />
                    {errors.price && <Alert type="error" message={errors.price.message} />}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Stock *
                    </label>
                    <Controller
                      name="stock"
                      control={control}
                      rules={validationRules.stock}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="0"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                      )}
                    />
                    {errors.stock && <Alert type="error" message={errors.stock.message} />}
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Categoría *
                  </label>
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={validationRules.categoryId}
                    render={({ field, fieldState }) => (
                      <select
                        {...field}
                        disabled={isSubmitting}
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categoriesArray.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.categoryId && <Alert type="error" message={errors.categoryId.message} />}
                </div>

                {/* Imágenes */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Imágenes del producto * (máximo 5)
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {selectedImages.length < 5 && (
                      <button
                        type="button"
                        onClick={openFileSelector}
                        disabled={isSubmitting}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF7260] flex flex-col items-center justify-center text-gray-500 hover:text-[#FF7260] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Agregar
                        </span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    disabled={isSubmitting}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      • Máximo 5 imágenes • Hasta 5MB cada una • Formatos: JPG, PNG, WebP, GIF
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedImages.length}/5 imágenes seleccionadas
                    </p>
                  </div>

                  {errors.images && <Alert type="error" message={errors.images.message} />}
                </div>

                {/* Es personalizable */}
                <div className="flex items-center space-x-3">
                  <Controller
                    name="isPersonalizable"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isSubmitting}
                        className="h-4 w-4 text-[#FF7260] focus:ring-[#FF7260] border-gray-300 rounded"
                      />
                    )}
                  />
                  <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    ¿Es personalizable?
                  </span>
                </div>

                {/* Detalles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Detalles adicionales
                  </label>
                  <Controller
                    name="details"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 text-sm sm:text-base border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Detalles adicionales del producto (opcional)"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ============ FOOTER CON BOTONES FIJOS ============ */}
            <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    isSubmitting || Object.keys(errors).length > 0
                      ? 'bg-gray-400' 
                      : 'bg-[#FF7260] hover:bg-[#FF6B5A]'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditing ? 'Actualizar' : 'Crear'} Producto
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Estilos CSS para scrollbar personalizada */}
        <style jsx>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }

          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f8f9fa;
            border-radius: 4px;
          }

          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
            border: 1px solid #f8f9fa;
          }

          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>
      </div>
    </OverlayBackdrop>
  );
};

export default ProductForm;
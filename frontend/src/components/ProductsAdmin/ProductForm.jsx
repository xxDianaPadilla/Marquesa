// Ruta: frontend/src/components/ProductsAdmin/ProductForm.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

/**
 * Componente para el formulario de productos mejorado con múltiples imágenes
 * Permite crear o editar productos con validación en tiempo real y manejo de hasta 5 imágenes
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

  // ============ CONFIGURACIÓN DEL FORMULARIO CON REACT-HOOK-FORM ============

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
    watch
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

  // ============ REGLAS DE VALIDACIÓN MEJORADAS ============

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
      validate: (value) => {
        // Para productos nuevos, al menos una imagen es obligatoria
        if (!isEditing && selectedImages.length === 0) {
          return "Debes seleccionar al menos una imagen";
        }

        // Validar que no exceda el máximo de 5 imágenes
        if (selectedImages.length > 5) {
          return "Máximo 5 imágenes permitidas";
        }

        // Validar cada archivo seleccionado
        for (let file of selectedImages) {
          if (file instanceof File) {
            // Validar tamaño (máximo 5MB por imagen)
            if (file.size > 5 * 1024 * 1024) {
              return `La imagen "${file.name}" excede el tamaño máximo de 5MB`;
            }

            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
              return `"${file.name}" no es un formato de imagen válido`;
            }
          }
        }

        return true;
      }
    },

    details: {
      maxLength: {
        value: 1000,
        message: "Los detalles no pueden exceder 1000 caracteres"
      }
    }
  };

  // ============ FUNCIONES PARA MANEJO DE IMÁGENES ============

  /**
   * Convierte archivos a URLs de preview
   * @param {Array} files - Array de archivos File
   * @returns {Array} Array de URLs de preview
   */
  const createPreviewUrls = (files) => {
    return files.map(file => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return file; // Si ya es una URL (caso de edición)
    });
  };

  /**
   * Maneja la selección de múltiples imágenes
   * @param {Event} e - Evento del input file
   */
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validar que no exceda el límite total (existentes + nuevas)
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      setError('images', {
        type: 'manual',
        message: `Solo puedes seleccionar ${5 - selectedImages.length} imágenes más (máximo 5 total)`
      });
      return;
    }

    // Validar cada archivo
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

    // Agregar nuevas imágenes
    const updatedImages = [...selectedImages, ...files];
    const updatedPreviews = [...imagePreviewUrls, ...createPreviewUrls(files)];

    setSelectedImages(updatedImages);
    setImagePreviewUrls(updatedPreviews);
    setValue('images', updatedImages);
    clearErrors('images');

    // Limpiar el input
    e.target.value = '';
  };

  /**
   * Elimina una imagen específica
   * @param {number} index - Índice de la imagen a eliminar
   */
  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviewUrls.filter((_, i) => i !== index);

    // Liberar memoria de URLs creadas
    if (imagePreviewUrls[index] && imagePreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }

    setSelectedImages(updatedImages);
    setImagePreviewUrls(updatedPreviews);
    setValue('images', updatedImages);
    clearErrors('images');
  };

  /**
   * Abre el selector de archivos
   */
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

  // ============ EFECTOS PARA MANEJO DE DATOS ============

  /**
   * Efecto para llenar el formulario cuando se abre en modo edición
   */
  useEffect(() => {
    if (isOpen) {
      if (productData && isEditing) {
        console.log('Llenando formulario para edición:', productData);
        console.log('isPersonalizable original:', productData.isPersonalizable);
        console.log('Tipo de isPersonalizable:', typeof productData.isPersonalizable);

        setValue('name', productData.name || '');
        setValue('description', productData.description || '');
        setValue('price', productData.price || '');
        setValue('stock', productData.stock || '');
        setValue('categoryId', productData.categoryId?._id || '');

        // Esto preserva el valor false cuando existe
        setValue('isPersonalizable', productData.isPersonalizable ?? false);

        setValue('details', productData.details || '');

        console.log('isPersonalizable después de setValue:', productData.isPersonalizable ?? false);

        // Manejar imágenes existentes
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
  /**
   * Efecto para limpiar URLs de preview al cerrar
   */
  useEffect(() => {
    return () => {
      // Limpiar URLs de memoria al desmontar el componente
      imagePreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

  /**
   * Efecto para sincronizar errores externos
   */
  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      console.log('⚠️ Aplicando errores externos al formulario:', validationErrors);

      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, {
          type: 'server',
          message: message
        });
      });
    }
  }, [validationErrors, setError]);

  // ============ FUNCIONES DE MANEJO DE EVENTOS ============

  /**
   * Maneja el envío del formulario
   */
  const handleFormSubmit = (data) => {
    console.log('📤 Enviando formulario con datos:', data);

    // Preparar datos con imágenes
    const formDataWithImages = {
      ...data,
      images: selectedImages // Array de archivos File o URLs existentes
    };

    onSubmit(formDataWithImages);
  };

  /**
   * Maneja el cierre del formulario
   */
  const handleClose = () => {
    console.log('❌ Cerrando formulario de productos');

    // Limpiar URLs de preview
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
    <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-2xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-2 font-poppins">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <button style={{ cursor: 'pointer' }} onClick={handleClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex-shrink-0">
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Nombre */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Nombre *</label>
          <Controller
            name="name"
            control={control}
            rules={validationRules.name}
            render={({ field }) => (
              <input
                {...field}
                disabled={isSubmitting}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Nombre del producto"
              />
            )}
          />
          {errors.name && <Alert type="error" message={errors.name.message} />}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Descripción *</label>
          <Controller
            name="description"
            control={control}
            rules={validationRules.description}
            render={({ field }) => (
              <textarea
                {...field}
                rows="3"
                disabled={isSubmitting}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Descripción del producto"
              />
            )}
          />
          {errors.description && <Alert type="error" message={errors.description.message} />}
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Precio *</label>
            <Controller
              name="price"
              control={control}
              rules={validationRules.price}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  {...field}
                  disabled={isSubmitting}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0.00"
                />
              )}
            />
            {errors.price && <Alert type="error" message={errors.price.message} />}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Stock *</label>
            <Controller
              name="stock"
              control={control}
              rules={validationRules.stock}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  disabled={isSubmitting}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="0"
                />
              )}
            />
            {errors.stock && <Alert type="error" message={errors.stock.message} />}
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Categoría *</label>
          <Controller
            name="categoryId"
            control={control}
            rules={validationRules.categoryId}
            render={({ field }) => (
              <select
                {...field}
                disabled={isSubmitting}
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {/* Sección de Imágenes - NUEVO DISEÑO MEJORADO */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 font-poppins">
            Imágenes * (máximo 5)
          </label>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
            {/* Imágenes seleccionadas */}
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

            {/* Botón para agregar más imágenes */}
            {selectedImages.length < 5 && (
              <button
                type="button"
                onClick={openFileSelector}
                disabled={isSubmitting}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF7260] flex flex-col items-center justify-center text-gray-500 hover:text-[#FF7260] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs text-center font-poppins">
                  Agregar
                </span>
              </button>
            )}
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelection}
            disabled={isSubmitting}
            className="hidden"
          />

          {/* Información y errores */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-poppins">
              • Máximo 5 imágenes • Hasta 5MB cada una • Formatos: JPG, PNG, WebP, GIF
            </p>
            <p className="text-xs text-gray-600 font-poppins">
              {selectedImages.length}/5 imágenes seleccionadas
            </p>
          </div>

          {errors.images && <Alert type="error" message={errors.images.message} />}
        </div>

        {/* ¿Es personalizable? */}
        <div className="flex items-center space-x-2">
          <Controller
            name="isPersonalizable"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={isSubmitting}
                className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF7260] focus:ring-[#FF7260] border-gray-300 rounded"
              />
            )}
          />
          <span className="text-xs sm:text-sm font-poppins">¿Es personalizable?</span>
        </div>

        {/* Detalles */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Detalles</label>
          <Controller
            name="details"
            control={control}
            rules={validationRules.details}
            render={({ field }) => (
              <textarea
                {...field}
                rows="2"
                disabled={isSubmitting}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#FF7260] resize-none"
                placeholder="Detalles adicionales del producto"
              />
            )}
          />
          {errors.details && <Alert type="error" message={errors.details.message} />}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#FF7260] hover:bg-[#FF6B5A] rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (isEditing ? 'Actualizando...' : 'Creando...')
              : (isEditing ? 'Actualizar' : 'Crear')} Producto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
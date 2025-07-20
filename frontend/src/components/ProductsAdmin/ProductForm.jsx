// Ruta: frontend/src/components/ProductsAdmin/ProductForm.jsx
import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Componente para el formulario de productos mejorado
 * Mantiene el diseño original pero añade validaciones exhaustivas
 * Permite crear o editar productos con validación en tiempo real y manejo de imágenes
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
      image: null,
      isPersonalizable: false,
      details: ''
    },
    mode: 'onChange' // Validación en tiempo real
  });

  // ============ REGLAS DE VALIDACIÓN MEJORADAS ============
  
  /**
   * Reglas de validación específicas para cada campo
   * Incluye validaciones exhaustivas con mensajes personalizados
   */
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
    
    image: {
      validate: (value) => {
        // Para productos nuevos, la imagen es obligatoria
        if (!isEditing && !value) {
          return "La imagen es obligatoria";
        }
        
        // Si hay una imagen seleccionada, validar el archivo
        if (value instanceof File) {
          // Validar tamaño (máximo 5MB)
          if (value.size > 5 * 1024 * 1024) {
            return "Máximo 5MB";
          }
          
          // Validar tipo de archivo
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
          if (!validTypes.includes(value.type)) {
            return "Debe ser una imagen";
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

  // ============ EFECTOS PARA MANEJO DE DATOS ============
  
  /**
   * Efecto para llenar el formulario cuando se abre en modo edición
   * Se ejecuta cuando cambia el estado de apertura o los datos del producto
   */
  useEffect(() => {
    if (isOpen) {
      if (productData && isEditing) {
        // Modo edición: llenar con datos existentes
        console.log('📝 Llenando formulario para edición:', productData);
        
        setValue('name', productData.name || '');
        setValue('description', productData.description || '');
        setValue('price', productData.price || '');
        setValue('stock', productData.stock || '');
        setValue('categoryId', productData.categoryId?._id || '');
        setValue('image', productData.images?.[0]?.image || null);
        setValue('isPersonalizable', productData.isPersonalizable || false);
        setValue('details', productData.details || '');
      } else {
        // Modo creación: resetear formulario
        console.log('✨ Inicializando formulario para nuevo producto');
        reset();
      }
    }
  }, [isOpen, productData, setValue, reset, isEditing]);

  /**
   * Efecto para sincronizar errores externos con react-hook-form
   * Permite que el hook establezca errores de validación del servidor
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
   * Valida imagen seleccionada
   * Verifica que la imagen sea válida y cumpla con los requisitos
   * 
   * @param {File} value - Archivo de imagen
   * @returns {boolean|string} true si es válido, mensaje de error si no
   */
  const validateImage = (value) => {
    if (!value) return 'La imagen es obligatoria';
    if (value instanceof File) {
      if (value.size > 5 * 1024 * 1024) return 'Máximo 5MB';
      if (!value.type.startsWith('image/')) return 'Debe ser una imagen';
      return true;
    }
    return true;
  };

  /**
   * Maneja el cambio de imagen seleccionada
   * Actualiza el estado del formulario con la imagen seleccionada
   * 
   * @param {Event} e - Evento de cambio del input file
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImage(file);
      if (validation === true) {
        setValue('image', file);
        clearErrors('image');
      } else {
        setError('image', { type: 'manual', message: validation });
      }
    }
  };

  /**
   * Maneja el clic en la imagen para abrir selector de archivos
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Maneja el envío del formulario
   * Procesa los datos y los envía al componente padre
   * 
   * @param {Object} data - Datos del formulario validados
   */
  const handleFormSubmit = (data) => {
    console.log('📤 Enviando formulario con datos:', data);
    onSubmit(data);
  };

  /**
   * Maneja el cierre del formulario
   * Limpia el estado y cierra el modal
   */
  const handleClose = () => {
    console.log('❌ Cerrando formulario de productos');
    reset();
    onClose();
  };

  // ============ COMPONENTE DE ALERTA PARA MENSAJES ============
  
  /**
   * Componente de alerta para mostrar mensajes de error o éxito
   * Mantiene el diseño original del proyecto
   * 
   * @param {Object} props - Propiedades de la alerta
   * @param {string} props.type - Tipo de alerta (error, success)
   * @param {string} props.message - Mensaje a mostrar
   */
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

  // Validar que categories sea un array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
      
      {/* Header responsivo */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-2 font-poppins">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <button onClick={handleClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex-shrink-0">
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </button>
      </div>

      {/* Formulario responsivo */}
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
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                    errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                  errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

        {/* Imagen */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">Imagen *</label>
          <Controller
            name="image"
            control={control}
            rules={validationRules.image}
            render={({ field }) => (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {field.value ? (
                    <img
                      src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                      alt="Preview"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={isSubmitting}
                    className={`w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg transition-colors duration-150 ${
                      errors.image
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {field.value ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          />
          {errors.image && <Alert type="error" message={errors.image.message} />}
          <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-poppins">Máximo 5MB. Formatos: JPG, PNG, WebP, GIF</p>
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

        {/* Botones responsivos */}
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
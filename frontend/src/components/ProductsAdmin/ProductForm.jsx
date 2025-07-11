// Ruta: frontend/src/components/ProductsAdmin/ProductForm.jsx
import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

// Componente para el formulario de productos
// Permite crear o editar productos con validación y manejo de imágenes
const ProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  productData = {},
  categories = [],
  isEditing
}) => {
  const fileInputRef = useRef(null);

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
      image: null,
      isPersonalizable: false,
      details: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (isOpen) {
      if (productData) {
        setValue('name', productData.name || '');
        setValue('description', productData.description || '');
        setValue('price', productData.price || '');
        setValue('stock', productData.stock || '');
        setValue('categoryId', productData.categoryId?._id || '');
        setValue('image', productData.images?.[0]?.image || null);
        setValue('isPersonalizable', productData.isPersonalizable || false);
        setValue('details', productData.details || '');
      } else {
        setValue('name', '');
        setValue('description', '');
        setValue('price', '');
        setValue('stock', '');
        setValue('categoryId', '');
        setValue('image', null);
        setValue('isPersonalizable', false);
        setValue('details', '');
      }
    }
  }, [isOpen, productData, setValue]);
  // Validar imagen
  // Verifica que la imagen sea válida y cumpla con los requisitos
  const validateImage = (value) => {
    if (!value) return 'La imagen es obligatoria';
    if (value instanceof File) {
      if (value.size > 5 * 1024 * 1024) return 'Máximo 5MB';
      if (!value.type.startsWith('image/')) return 'Debe ser una imagen';
      return true;
    }
    return true;
  };
// Manejar cambio de imagen
  // Actualiza el estado del formulario con la imagen seleccionada
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
// Manejar clic en la imagen
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
// Manejar envío del formulario
  const handleFormSubmit = (data) => {
    onSubmit(data);
  };
// Manejar cierre del formulario
  const handleClose = () => {
    reset();
    onClose();
  };
// Componente de alerta para mostrar mensajes de error o éxito
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
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4">
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
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
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
              rules={{ required: 'La descripción es obligatoria' }}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows="3"
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] resize-none ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
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
                rules={{ required: 'Precio requerido', min: 0 }}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    {...field}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                      errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
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
                rules={{ required: 'Stock requerido', min: 0 }}
                render={({ field }) => (
                  <input
                    type="number"
                    {...field}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                      errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
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
              rules={{ required: 'Selecciona una categoría' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] ${
                    errors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
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
              rules={{ validate: validateImage }}
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
                      className={`w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg transition-colors duration-150 ${
                        errors.image
                          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {field.value ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
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
              render={({ field }) => (
                <textarea
                  {...field}
                  rows="2"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg border-gray-300 focus:ring-2 focus:ring-[#FF7260] resize-none"
                  placeholder="Detalles adicionales del producto"
                />
              )}
            />
          </div>

          {/* Botones responsivos */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#FF7260] hover:bg-[#FF6B5A] rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(errors).length > 0}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
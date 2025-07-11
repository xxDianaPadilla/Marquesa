import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

// Componente para el formulario de categorías
// Permite crear y editar categorías con validaciones y manejo de imágenes
const CategoryForm = ({
  isOpen,      
  onClose,     
  onSubmit,    
  name,        
  setName,     
  image,       
  setImage,    
  isEditing    
}) => {

  const fileInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      name: '',
      image: null
    },
    mode: 'onChange'
  });

  const watchedImage = watch('image');

  useEffect(() => {
    if (isOpen) {
      setValue('name', name || '');
      setValue('image', image || null);
    }
  }, [isOpen, name, image, setValue]);

  const validateName = (value) => {
    if (!value || value.trim() === '') return 'El nombre es obligatorio';
    if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres';
    if (value.trim().length > 50) return 'Máximo 50 caracteres';
    if (/\d/.test(value)) return 'No puede contener números';
    if (!/\S/.test(value)) return 'No puede ser solo espacios';
    if (/[<>\"'%;()&+]/.test(value)) return 'Contiene caracteres no permitidos';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_.,!?]+$/.test(value))
      return 'Solo letras, espacios y puntuación básica';
    return true;
  };

  const validateImage = (value) => {
    if (!value) return 'La imagen es obligatoria';
    if (value instanceof File) {
      if (value.size > 5 * 1024 * 1024) return 'Máximo 5MB';
      if (!value.type.startsWith('image/')) return 'Debe ser una imagen';
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed.includes(value.type)) return 'Formato no soportado';
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateImage(file);
      if (validation === true) {
        setValue('image', file);
        setImage(file);
        clearErrors('image');
      } else {
        setError('image', { type: 'manual', message: validation });
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onFormSubmit = (data) => {
    const cleanName = data.name.trim();
    setName(cleanName);

    const fakeEvent = {
      preventDefault: () => {},
      target: {
        name: { value: cleanName },
        image: { value: data.image }
      }
    };

    onSubmit(fakeEvent);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xs sm:max-w-md w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
        
        {/* Header responsivo */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="p-4 sm:p-6">
          
          {/* Input para el nombre de la categoría */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nombre de la categoría *
            </label>
            <Controller
              name="name"
              control={control}
              rules={{ validate: validateName }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  onChange={(e) => {
                    field.onChange(e);
                    setName(e.target.value);
                  }}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors duration-150 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el nombre de la categoría"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              )}
            />
            {errors.name && (
              <Alert type="error" message={errors.name.message} />
            )}
          </div>

          {/* Input para la imagen de la categoría */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Imagen de la categoría *
            </label>
            <Controller
              name="image"
              control={control}
              rules={{ validate: validateImage }}
              render={({ field }) => (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  
                  {/* Vista previa de la imagen */}
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

                  {/* Botón para seleccionar imagen */}
                  <div className="flex-1 w-full">
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className={`w-full px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm transition-colors duration-150 ${
                        errors.image
                          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {field.value ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            />
            {errors.image && (
              <Alert type="error" message={errors.image.message} />
            )}
            <p className="text-xs text-gray-500 mt-1 sm:mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Formatos: JPG, PNG, GIF, WebP. Máximo: 5MB
            </p>
          </div>

          {/* Botones de acción responsivos */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit(onFormSubmit)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#FF7260] hover:bg-[#FF6B5A] rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              disabled={Object.keys(errors).length > 0}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
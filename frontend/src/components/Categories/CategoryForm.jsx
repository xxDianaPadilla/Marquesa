import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Componente para el formulario de categorías
 * Permite crear y editar categorías con validaciones completas y manejo de imágenes
 * Utiliza react-hook-form para el manejo del formulario y validaciones
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado para mostrar/ocultar el modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSubmit - Función para enviar el formulario
 * @param {string} props.name - Nombre actual de la categoría (para edición)
 * @param {Function} props.setName - Función para actualizar el nombre
 * @param {File|string} props.image - Imagen actual (File para nueva, string URL para existente)
 * @param {Function} props.setImage - Función para actualizar la imagen
 * @param {boolean} props.isEditing - Indica si estamos en modo edición
 */
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

  // ============ REFERENCIAS ============
  
  // Referencia para el input de archivo (imagen)
  const fileInputRef = useRef(null);

  // ============ CONFIGURACIÓN DE REACT-HOOK-FORM ============
  
  const {
    control,           // Controlador para campos controlados
    handleSubmit,      // Función para manejar el envío del formulario
    formState: { errors, isValid, touchedFields }, // Estado del formulario y errores
    reset,             // Función para resetear el formulario
    setValue,          // Función para establecer valores
    watch,             // Función para observar cambios en campos
    setError,          // Función para establecer errores manuales
    clearErrors,       // Función para limpiar errores
    trigger            // Función para disparar validaciones manualmente
  } = useForm({
    // Valores por defecto del formulario
    defaultValues: {
      name: '',
      image: null
    },
    // Validar solo cuando el usuario envía el formulario o después de interactuar
    mode: 'onTouched'
  });

  // ============ OBSERVADORES DE CAMBIOS ============
  
  // Observar cambios en el campo imagen para vista previa
  const watchedImage = watch('image');

  // ============ EFECTOS ============
  
  /**
   * Efecto para inicializar el formulario cuando se abre el modal
   * Solo se ejecuta cuando cambia isOpen o isEditing
   */
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Inicializando formulario:', { name, image, isEditing });
      
      // Resetear el formulario con los valores actuales
      reset({
        name: name || '',
        image: image || null
      });
      
      // Limpiar errores
      clearErrors();
    }
  }, [isOpen, isEditing]); // Solo estas dos dependencias

  // ============ FUNCIONES DE VALIDACIÓN ============
  
  /**
   * Validación completa para el campo nombre
   * Incluye múltiples reglas de validación con mensajes específicos
   * 
   * @param {string} value - Valor del campo nombre
   * @returns {boolean|string} true si es válido, string con error si no
   */
  const validateName = (value) => {
    console.log('🔍 Validando nombre:', value);
    
    // Verificar que el valor no esté vacío
    if (!value || value.trim() === '') {
      return 'El nombre es obligatorio';
    }
    
    // Verificar longitud mínima
    if (value.trim().length < 2) {
      return 'Debe tener al menos 2 caracteres';
    }
    
    // Verificar longitud máxima
    if (value.trim().length > 50) {
      return 'Máximo 50 caracteres permitidos';
    }
    
    // Verificar que no contenga solo números
    if (/^\d+$/.test(value.trim())) {
      return 'No puede contener solo números';
    }
    
    // Verificar que no sea solo espacios en blanco
    if (!/\S/.test(value)) {
      return 'No puede ser solo espacios en blanco';
    }
    
    // Verificar caracteres no permitidos (caracteres peligrosos para HTML/JS)
    if (/[<>\"'%;()&+]/.test(value)) {
      return 'Contiene caracteres no permitidos';
    }
    
    // Verificar que solo contenga letras, espacios y puntuación básica
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_.,!?0-9]+$/.test(value)) {
      return 'Solo se permiten letras, números, espacios y puntuación básica';
    }
    
    console.log('✅ Nombre válido');
    return true;
  };

  /**
   * Validación completa para el campo imagen
   * Valida tanto archivos nuevos como URLs existentes
   * 
   * @param {File|string|null} value - Valor del campo imagen
   * @returns {boolean|string} true si es válido, string con error si no
   */
  const validateImage = (value) => {
    console.log('🔍 Validando imagen:', { type: typeof value, isFile: value instanceof File });
    
    // Verificar que haya una imagen seleccionada
    if (!value) {
      return 'La imagen es obligatoria';
    }
    
    // Si es un archivo nuevo (File object)
    if (value instanceof File) {
      console.log('📁 Validando archivo:', { size: value.size, type: value.type });
      
      // Verificar tamaño del archivo (máximo 5MB)
      if (value.size > 5 * 1024 * 1024) {
        return 'La imagen no puede superar los 5MB';
      }
      
      // Verificar que sea realmente una imagen
      if (!value.type.startsWith('image/')) {
        return 'El archivo debe ser una imagen';
      }
      
      // Verificar formatos permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(value.type)) {
        return 'Formato no soportado. Use JPG, PNG, GIF o WebP';
      }
      
      // Verificar nombre del archivo (evitar caracteres extraños)
      if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i.test(value.name)) {
        return 'Nombre de archivo inválido';
      }
    }
    // Si es una URL (modo edición con imagen existente)
    else if (typeof value === 'string') {
      console.log('🔗 Validando URL de imagen existente');
      
      // Verificar que la URL no esté vacía
      if (value.trim() === '') {
        return 'La imagen es obligatoria';
      }
      
      // Validación básica de formato URL (opcional, ya que viene del servidor)
      if (!value.startsWith('http') && !value.startsWith('data:')) {
        console.warn('⚠️ URL de imagen con formato inusual:', value);
      }
    }
    
    console.log('✅ Imagen válida');
    return true;
  };

  // ============ MANEJADORES DE EVENTOS ============
  
  /**
   * Maneja el cambio de imagen cuando el usuario selecciona un archivo
   * Incluye validación inmediata del archivo seleccionado
   * 
   * @param {Event} e - Evento del input file
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('📷 Archivo seleccionado:', file);
    
    if (file) {
      // Validar el archivo inmediatamente
      const validation = validateImage(file);
      
      if (validation === true) {
        console.log('✅ Archivo válido, actualizando estado');
        
        // Actualizar el valor en react-hook-form
        setValue('image', file);
        
        // Limpiar cualquier error previo
        clearErrors('image');
      } else {
        console.log('❌ Archivo inválido:', validation);
        
        // Establecer error manual si la validación falla
        setError('image', { 
          type: 'manual', 
          message: validation 
        });
        
        // Limpiar el input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  /**
   * Maneja el clic en el botón de seleccionar imagen
   * Abre el selector de archivos
   */
  const handleImageClick = () => {
    console.log('🖱️ Abriendo selector de archivos');
    fileInputRef.current?.click();
  };

  /**
   * Maneja el envío del formulario
   * Solo se ejecuta si react-hook-form considera que los datos son válidos
   * 
   * @param {Object} data - Datos del formulario validados por react-hook-form
   */
  const onFormSubmit = (data) => {
    console.log('📤 Enviando formulario con datos válidos:', data);
    
    // Limpiar el nombre (eliminar espacios extra)
    const cleanName = data.name.trim();
    
    // Actualizar el estado externo
    setName(cleanName);
    setImage(data.image);
    
    // Crear un evento simulado para mantener compatibilidad
    const fakeEvent = {
      preventDefault: () => {},
      target: {
        name: { value: cleanName },
        image: { value: data.image }
      }
    };
    
    // Llamar a la función onSubmit del componente padre
    console.log('🚀 Llamando onSubmit del componente padre');
    onSubmit(fakeEvent);
  };

  /**
   * Maneja errores de validación cuando el formulario no es válido
   * Se ejecuta cuando react-hook-form detecta errores
   * 
   * @param {Object} errors - Errores de validación
   */
  const onFormError = (errors) => {
    console.log('❌ Errores de validación detectados:', errors);
    
    // Los errores ya se muestran automáticamente en la UI
    // Solo necesitamos logear para debugging
    Object.keys(errors).forEach(field => {
      console.log(`Error en ${field}:`, errors[field].message);
    });
  };

  /**
   * Maneja el cierre del modal
   * Resetea el formulario y llama a la función onClose
   */
  const handleClose = () => {
    console.log('❌ Cerrando formulario y reseteando estado');
    
    // Resetear el formulario a sus valores por defecto
    reset();
    
    // Llamar a la función onClose del componente padre
    onClose();
  };

  // ============ RENDERIZADO CONDICIONAL ============
  
  // No renderizar nada si el modal no está abierto
  if (!isOpen) return null;

  // ============ COMPONENTE DE ALERTA ============
  
  /**
   * Componente interno para mostrar alertas de error y éxito
   * 
   * @param {Object} props - Propiedades del componente de alerta
   * @param {string} props.type - Tipo de alerta ('error' o 'success')
   * @param {string} props.message - Mensaje a mostrar
   */
  const Alert = ({ type, message }) => {
    // Configuración de estilos según el tipo de alerta
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

  // ============ RENDERIZADO PRINCIPAL ============
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xs sm:max-w-md w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
        
        {/* ============ HEADER DEL MODAL ============ */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 flex-shrink-0"
            type="button"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* ============ CONTENIDO DEL FORMULARIO ============ */}
        <div className="p-4 sm:p-6">
          
          {/* ---- CAMPO NOMBRE DE LA CATEGORÍA ---- */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nombre de la categoría *
            </label>
            
            {/* Campo controlado por react-hook-form */}
            <Controller
              name="name"
              control={control}
              rules={{ validate: validateName }} // Aplicar validación personalizada
              render={({ field }) => (
                <input
                  {...field} // Spread de propiedades del campo
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors duration-150 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el nombre de la categoría"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              )}
            />
            
            {/* Mostrar error siempre que exista (para validación manual y automática) */}
            {errors.name && (
              <Alert type="error" message={errors.name.message} />
            )}
          </div>

          {/* ---- CAMPO IMAGEN DE LA CATEGORÍA ---- */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Imagen de la categoría *
            </label>
            
            {/* Campo de imagen controlado por react-hook-form */}
            <Controller
              name="image"
              control={control}
              rules={{ validate: validateImage }} // Aplicar validación personalizada
              render={({ field }) => (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  
                  {/* ---- VISTA PREVIA DE LA IMAGEN ---- */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    {field.value ? (
                      <img
                        src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                        alt="Preview"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Error al cargar imagen preview');
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      // Placeholder cuando no hay imagen
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* ---- BOTÓN PARA SELECCIONAR IMAGEN ---- */}
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
                    
                    {/* Input file oculto */}
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
            
            {/* Mostrar error siempre que exista */}
            {errors.image && (
              <Alert type="error" message={errors.image.message} />
            )}
            
            {/* Información sobre formatos permitidos */}
            <p className="text-xs text-gray-500 mt-1 sm:mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Formatos: JPG, PNG, GIF, WebP. Máximo: 5MB
            </p>
          </div>

          {/* ============ BOTONES DE ACCIÓN ============ */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
            
            {/* Botón Cancelar */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Cancelar
            </button>
            
            {/* Botón Crear/Actualizar */}
            <button
              type="button"
              onClick={handleSubmit(onFormSubmit, onFormError)} // Usar handleSubmit con callbacks
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#FF7260] hover:bg-[#FF6B5A] rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
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
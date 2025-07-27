// components/MaterialForm.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from "lucide-react";

const MaterialForm = ({ onSubmit, initialData = null, onCancel, isLoading = false, submitText = null }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();

  // Categorías válidas por producto
  const validCategories = {
    "Giftbox": [
      "Base para giftbox",
      "Comestibles para giftbox",
      "Extras"
    ],
    "Ramo de flores naturales": [
      "Flores naturales",
      "Envoltura",
      "Liston"
    ],
    "Ramo de flores secas": [
      "Flores secas",
      "Envoltura",
      "Liston"
    ]
  };

  const watchedProduct = watch('productToPersonalize');

  // Cargar datos iniciales si se está editando
  useEffect(() => {
    if (initialData) {
      console.log('Cargando datos iniciales:', initialData);

      // Establecer el producto y las categorías disponibles primero
      setSelectedProduct(initialData.productToPersonalize);
      const categories = validCategories[initialData.productToPersonalize] || [];
      setAvailableCategories(categories);
      setCurrentImageUrl(initialData.image || '');

      // Reset del formulario con todos los datos
      reset({
        name: initialData.name || '',
        productToPersonalize: initialData.productToPersonalize || '',
        categoryToParticipate: initialData.categoryToParticipate || '',
        price: initialData.price || '',
        stock: initialData.stock || '',
      });

      // Asegurar que la categoría se establezca después de que las categorías estén disponibles
      setTimeout(() => {
        setValue('categoryToParticipate', initialData.categoryToParticipate || '');
      }, 0);
    } else {
      // Limpiar el formulario para nuevos materiales
      setSelectedProduct('');
      setAvailableCategories([]);
      setCurrentImageUrl('');
      reset({
        name: '',
        productToPersonalize: '',
        categoryToParticipate: '',
        price: '',
        stock: '',
      });
    }
  }, [initialData, reset, setValue]);

  // Actualizar categorías disponibles cuando cambia el producto
  useEffect(() => {
    if (watchedProduct && watchedProduct !== selectedProduct) {
      console.log('Producto cambió a:', watchedProduct);
      setSelectedProduct(watchedProduct);
      const categories = validCategories[watchedProduct] || [];
      setAvailableCategories(categories);

      // Solo limpiar categoría si no estamos cargando datos iniciales
      if (!initialData || initialData.productToPersonalize !== watchedProduct) {
        setValue('categoryToParticipate', '');
      }
    }
  }, [watchedProduct, selectedProduct, setValue, initialData]);

  const handleFormSubmit = (data) => {
    if (isLoading) return; // Prevenir doble envío

    const formData = new FormData();

    // Agregar todos los campos del formulario
    Object.keys(data).forEach(key => {
      if (key === 'image') {
        // Solo agregar la imagen si se seleccionó un archivo
        if (data[key] && data[key][0]) {
          formData.append('image', data[key][0]);
        }
      } else {
        formData.append(key, data[key]);
      }
    });

    // Verificar que todos los campos requeridos estén presentes
    console.log('Datos del formulario a enviar:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    onSubmit(formData);
  };

  const getSubmitButtonText = () => {
    if (submitText) return submitText;
    if (isLoading) {
      return initialData ? 'Actualizando...' : 'Creando...';
    }
    return initialData ? 'Actualizar Material' : 'Crear Material';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Encabezado con botón "X" */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar material' : 'Añadir nuevo material'}
          </h2>

          <button
            style={{ cursor: 'pointer' }}
            onClick={onCancel}
            disabled={isLoading}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-150 ${isLoading
                ? 'cursor-not-allowed text-gray-300 hover:bg-transparent'
                : 'hover:bg-gray-100 text-gray-500'
              }`}
            type="button"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Producto a personalizar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto a personalizar *
            </label>
            <select
              {...register('productToPersonalize', {
                required: 'El producto es requerido'
              })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
            >
              <option value="">Seleccionar producto...</option>
              <option value="Ramo de flores naturales">Ramo de flores naturales</option>
              <option value="Ramo de flores secas">Ramo de flores secas</option>
              <option value="Giftbox">Giftbox</option>
            </select>
            {errors.productToPersonalize && (
              <p className="text-red-600 text-sm mt-1">{errors.productToPersonalize.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              {...register('categoryToParticipate', {
                required: 'La categoría es requerida'
              })}
              disabled={!selectedProduct || isLoading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${(!selectedProduct || isLoading) ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
            >
              <option value="">
                {!selectedProduct
                  ? 'Primero selecciona un producto...'
                  : 'Seleccionar categoría...'
                }
              </option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.categoryToParticipate && (
              <p className="text-red-600 text-sm mt-1">{errors.categoryToParticipate.message}</p>
            )}
            {selectedProduct && availableCategories.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                No hay categorías disponibles para este producto
              </p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                }
              })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              placeholder="Nombre del material"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen {!initialData && '*'}
            </label>

            {/* Mostrar imagen actual si existe */}
            {currentImageUrl && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                <div className="relative inline-block">
                  <img
                    src={currentImageUrl}
                    alt="Imagen actual"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                      e.target.className = 'w-20 h-20 object-cover rounded-lg border border-gray-300 bg-gray-100';
                    }}
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              {...register('image', {
                required: initialData ? false : 'La imagen es requerida'
              })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
            />
            {errors.image && (
              <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
            )}
            {initialData && (
              <p className="text-sm text-gray-600 mt-1">
                💡 Selecciona una nueva imagen solo si deseas cambiar la actual
              </p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: 'El precio es requerido',
                  min: {
                    value: 0,
                    message: 'El precio debe ser mayor o igual a 0'
                  }
                })}
                disabled={isLoading}
                className={`w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock *
            </label>
            <input
              type="number"
              min="0"
              {...register('stock', {
                required: 'El stock es requerido',
                min: {
                  value: 0,
                  message: 'El stock debe ser mayor o igual a 0'
                }
              })}
              disabled={isLoading}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              style={{ cursor: 'pointer' }}
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${isLoading
                  ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                }`}
            >
              Cancelar
            </button>
            <button
              style={{ cursor: 'pointer' }}
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#FDB4B7] hover:bg-[#F2C6C2] hover:scale-105'
                }`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;
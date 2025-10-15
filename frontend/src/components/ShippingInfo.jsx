/**
 * Componente ShippingInfo - Información de envío
 * 
 * Formulario para capturar la información de entrega del pedido.
 * Los campos de cliente y email se autocompletar con los datos del usuario autenticado.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook de autenticación

const ShippingInfo = ({
    onNext,
    onShippingInfoUpdate,
    initialData = {}
}) => {
    // Obtener información del usuario desde el contexto de autenticación
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        receiverName: initialData.receiverName || '',
        receiverPhone: initialData.receiverPhone || '',
        deliveryAddress: initialData.deliveryAddress || '',
        deliveryPoint: initialData.deliveryPoint || '',
        deliveryDate: initialData.deliveryDate || ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Autocompletar información del usuario MEJORADO
    useEffect(() => {
        if (userInfo && userInfo.name && !initialData.receiverName) {
            setFormData(prev => ({
                ...prev,
                receiverName: userInfo.name
            }));
        }
    }, [userInfo, initialData.receiverName]);

    // Función para formatear el teléfono automáticamente
    const formatPhoneNumber = (value) => {
        // Remover todo excepto números
        const numbers = value.replace(/\D/g, '');

        // Limitar a 8 dígitos
        const truncated = numbers.slice(0, 8);

        // Formatear como ####-####
        if (truncated.length >= 5) {
            return `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
        }

        return truncated;
    };

    // Función para validar el formulario
    const validateForm = () => {
        const newErrors = {};

        // Validar nombre del receptor (mínimo 12 caracteres, solo letras y espacios)
        if (!formData.receiverName || formData.receiverName.trim().length < 12) {
            newErrors.receiverName = 'El nombre debe tener al menos 12 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.receiverName.trim())) {
            newErrors.receiverName = 'El nombre solo puede contener letras y espacios';
        }

        // Validar teléfono (exactamente formato ####-####)
        const phoneRegex = /^\d{4}-\d{4}$/;
        if (!formData.receiverPhone || !phoneRegex.test(formData.receiverPhone)) {
            newErrors.receiverPhone = 'El teléfono debe tener el formato ####-####';
        }

        // Validar dirección (mínimo 20 caracteres, máximo 200)
        if (!formData.deliveryAddress || formData.deliveryAddress.trim().length < 20) {
            newErrors.deliveryAddress = 'La dirección debe tener al menos 20 caracteres';
        } else if (formData.deliveryAddress.trim().length > 200) {
            newErrors.deliveryAddress = 'La dirección no puede exceder 200 caracteres';
        }

        // Validar punto de referencia (mínimo 20 caracteres, máximo 200)
        if (!formData.deliveryPoint || formData.deliveryPoint.trim().length < 20) {
            newErrors.deliveryPoint = 'El punto de referencia debe tener al menos 20 caracteres';
        } else if (formData.deliveryPoint.trim().length > 200) {
            newErrors.deliveryPoint = 'El punto de referencia no puede exceder 200 caracteres';
        }

        // Validar fecha de entrega
        if (!formData.deliveryDate) {
            newErrors.deliveryDate = 'La fecha de entrega es requerida';
        } else {
            const selectedDate = new Date(formData.deliveryDate);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 2); 
            minDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate < minDate) {
                newErrors.deliveryDate = 'La fecha de entrega debe ser al menos 2 días después de hoy';
            }
        }

        return newErrors;
    };

    // Manejar cambios en los inputs MEJORADO
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Procesar según el tipo de campo
        if (name === 'receiverName') {
            // Solo permitir letras, espacios y caracteres especiales del español
            processedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            // Limitar a 100 caracteres
            processedValue = processedValue.slice(0, 100);
        } else if (name === 'receiverPhone') {
            // Formatear teléfono automáticamente
            processedValue = formatPhoneNumber(value);
        } else if (name === 'deliveryAddress') {
            // Limitar a 200 caracteres
            processedValue = value.slice(0, 200);
        } else if (name === 'deliveryPoint') {
            // Limitar a 200 caracteres
            processedValue = value.slice(0, 200);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Manejar cambio de fecha (solo permitir selección del calendario)
    const handleDateChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error específico
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Prevenir escritura manual en el campo de fecha
    const handleDateKeyDown = (e) => {
        // Prevenir todas las teclas excepto Tab y Delete/Backspace para navegación
        if (e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'Backspace') {
            e.preventDefault();
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Pasar datos al componente padre
            await onShippingInfoUpdate({
                receiverName: formData.receiverName.trim(),
                receiverPhone: formData.receiverPhone.trim(),
                deliveryAddress: formData.deliveryAddress.trim(),
                deliveryPoint: formData.deliveryPoint.trim(),
                deliveryDate: formData.deliveryDate
            });

            // Avanzar al siguiente paso
            onNext();
        } catch (error) {
            console.error('Error al procesar información de envío:', error);
            setErrors({ general: 'Error al procesar la información. Inténtalo nuevamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Obtener fecha mínima (hoy)
    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 2);
        return today.toISOString().split('T')[0];
    };

    // NUEVA FUNCIÓN: Manejar el botón para autocompletar nombre
    const handleAutoFillName = () => {
        if (userInfo && userInfo.name) {
            setFormData(prev => ({
                ...prev,
                receiverName: userInfo.name
            }));

            // Limpiar error si existe
            if (errors.receiverName) {
                setErrors(prev => ({
                    ...prev,
                    receiverName: undefined
                }));
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Información de envío
            </h2>

            {/* Error general */}
            {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {errors.general}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información del cliente (solo lectura) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cliente
                        </label>
                        <input
                            type="text"
                            value={userInfo?.name || 'Usuario'}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={userInfo?.email || 'usuario@correo.com'}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                    </div>
                </div>

                {/* Nombre del receptor MEJORADO */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Nombre completo del receptor *
                        </label>
                        {/* NUEVO: Botón para autocompletar nombre */}
                        {userInfo && userInfo.name && formData.receiverName !== userInfo.name && (
                            <button
                                type="button"
                                onClick={handleAutoFillName}
                                className="text-xs text-pink-600 hover:text-pink-700 underline"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Usar mi nombre
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleInputChange}
                        placeholder="Ej: María José García López"
                        className={`w-full px-3 py-2 border rounded-md ${errors.receiverName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                    {errors.receiverName && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.receiverName}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Escribe el nombre de la persona que recogerá el pedido (solo letras)
                    </p>
                </div>

                {/* Teléfono del receptor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Teléfono del receptor *
                    </label>
                    <input
                        name="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={handleInputChange}
                        placeholder="1234-5678"
                        className={`w-full px-3 py-2 border rounded-md ${errors.receiverPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        disabled={isSubmitting}
                        maxLength={9}
                    />
                    {errors.receiverPhone && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.receiverPhone}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        El teléfono se formateará automáticamente como ####-####
                    </p>
                </div>

                {/* Dirección de entrega */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Dirección de entrega *
                    </label>
                    <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Ej: Colonia Escalón, Calle Principal #123, San Salvador"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md resize-none ${errors.deliveryAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        disabled={isSubmitting}
                        maxLength={200}
                    />
                    {errors.deliveryAddress && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.deliveryAddress}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Entre 20 y 200 caracteres ({formData.deliveryAddress.length}/200)
                    </p>
                </div>

                {/* Punto de referencia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Punto de referencia *
                    </label>
                    <textarea
                        name="deliveryPoint"
                        value={formData.deliveryPoint}
                        onChange={handleInputChange}
                        placeholder="Ej: Casa blanca con portón negro, frente al supermercado, al lado de la farmacia"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md resize-none ${errors.deliveryPoint ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        disabled={isSubmitting}
                        maxLength={200}
                    />
                    {errors.deliveryPoint && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.deliveryPoint}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Entre 20 y 200 caracteres ({formData.deliveryPoint.length}/200)
                    </p>
                </div>

                {/* Fecha de entrega */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Fecha de entrega preferida *
                    </label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleDateChange}
                        onKeyDown={handleDateKeyDown}
                        min={getMinDate()}
                        className={`w-full px-3 py-2 border rounded-md ${errors.deliveryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        disabled={isSubmitting}
                    />
                    {errors.deliveryDate && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.deliveryDate}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Selecciona una fecha a partir de 2 días después de hoy
                    </p>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-blue-700 text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Información importante
                            </p>
                            <ul className="text-blue-600 text-xs space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <li>• Las entregas requieren al menos 2 días de anticipación</li>
                                <li>• El tiempo de entrega puede variar según la ubicación</li>
                                <li>• Asegúrate de que alguien esté disponible en la dirección indicada</li>
                                <li>• El punto de referencia nos ayuda a encontrar la dirección más fácilmente</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Botón de continuar */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 disabled:bg-pink-400 disabled:cursor-not-allowed transition-colors duration-200"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </span>
                        ) : (
                            'Continuar al pago'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShippingInfo;
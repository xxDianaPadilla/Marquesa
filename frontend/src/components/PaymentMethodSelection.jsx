import React from "react";
import { useForm } from 'react-hook-form';

/**
 * Validaciones para métodos de pago
 */
const validateCardNumber = (cardNumber) => {
    if (!cardNumber) return false;
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cardNumberClean);
};

const validateExpiryDate = (expiryDate) => {
    if (!expiryDate) return false;
    const [month, year] = expiryDate.split('/');
    if (!month || !year || month < 1 || month > 12) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    return !(parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth));
};

const validateCVV = (cvv) => {
    if (!cvv) return false;
    return /^\d{3,4}$/.test(cvv);
};

const PaymentMethodSelection = ({ onNext, onBack }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm({
        mode: 'onChange'
    });

    const selectedMethod = watch('method');

    /**
     * Reglas de validación para cada campo
     */
    const validationRules = {
        method: {
            required: 'Debes seleccionar un método de pago'
        },
        cardNumber: {
            required: selectedMethod === 'card' ? 'El número de tarjeta es requerido' : false,
            validate: {
                format: (value) => selectedMethod === 'card' ? (validateCardNumber(value) || 'El número de tarjeta debe tener 16 dígitos') : true
            }
        },
        cardName: {
            required: selectedMethod === 'card' ? 'El nombre en la tarjeta es requerido' : false,
            minLength: {
                value: 3,
                message: 'El nombre debe tener al menos 3 caracteres'
            }
        },
        expiryDate: {
            required: selectedMethod === 'card' ? 'La fecha de expiración es requerida' : false,
            validate: {
                format: (value) => selectedMethod === 'card' ? (validateExpiryDate(value) || 'Fecha inválida o tarjeta expirada') : true
            }
        },
        cvv: {
            required: selectedMethod === 'card' ? 'El CVV es requerido' : false,
            validate: {
                format: (value) => selectedMethod === 'card' ? (validateCVV(value) || 'El CVV debe tener 3 o 4 dígitos') : true
            }
        }
    };

    /**
     * Formatear número de tarjeta
     */
    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        setValue('cardNumber', value);
    };

    /**
     * Formatear fecha de expiración
     */
    const handleExpiryDateChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
        setValue('expiryDate', value);
    };

    /**
     * Formatear CVV
     */
    const handleCVVChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
        setValue('cvv', value);
    };

    /**
     * Función que se ejecuta al enviar el formulario
     */
    const onSubmit = (data) => {
        onNext(); // Solo procede al siguiente paso si todas las validaciones pasan
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Método de Pago
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Selección de método */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Selecciona tu método de pago
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="radio"
                                value="card"
                                {...register('method', validationRules.method)}
                                className="mr-3"
                            />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>💳 Tarjeta de Crédito/Débito</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="radio"
                                value="paypal"
                                {...register('method', validationRules.method)}
                                className="mr-3"
                            />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>💰 PayPal</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="radio"
                                value="cash"
                                {...register('method', validationRules.method)}
                                className="mr-3"
                            />
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>💵 Pago contra entrega</span>
                        </label>
                    </div>
                    {errors.method && (
                        <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.method.message}
                        </p>
                    )}
                </div>

                {/* Campos de tarjeta (solo si se selecciona tarjeta) */}
                {selectedMethod === 'card' && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Información de la Tarjeta
                        </h3>
                        
                        {/* Número de tarjeta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número de tarjeta
                            </label>
                            <input
                                type="text"
                                {...register('cardNumber', validationRules.cardNumber)}
                                onChange={handleCardNumberChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="1234 5678 9012 3456"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            {errors.cardNumber && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.cardNumber.message}
                                </p>
                            )}
                        </div>

                        {/* Nombre en la tarjeta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre en la tarjeta
                            </label>
                            <input
                                type="text"
                                {...register('cardName', validationRules.cardName)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                    errors.cardName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Como aparece en la tarjeta"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            {errors.cardName && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.cardName.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fecha de expiración */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de expiración
                                </label>
                                <input
                                    type="text"
                                    {...register('expiryDate', validationRules.expiryDate)}
                                    onChange={handleExpiryDateChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="MM/YY"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                />
                                {errors.expiryDate && (
                                    <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {errors.expiryDate.message}
                                    </p>
                                )}
                            </div>

                            {/* CVV */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    {...register('cvv', validationRules.cvv)}
                                    onChange={handleCVVChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="123"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                />
                                {errors.cvv && (
                                    <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {errors.cvv.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        className="flex-1 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                        style={{ 
                            backgroundColor: '#E8ACD2',
                            fontFamily: 'Poppins, sans-serif',
                            cursor: 'pointer'
                        }}
                    >
                        Revisar Pedido
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethodSelection;
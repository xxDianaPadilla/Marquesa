import React, { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Mover CardForm FUERA del componente principal
const CardForm = ({
    cardData,
    handleCardDataChange,
    setShowCardForm,
    handleCardPayment,
    isSubmitting,
    formatCardNumber
}) => (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Datos de la tarjeta
                </h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de la tarjeta
                    </label>
                    <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardDataChange('cardNumber', formatCardNumber(e.target.value))}
                        maxLength="19"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del titular
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={cardData.cardName}
                        onChange={(e) => handleCardDataChange('cardName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                </div>

                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de expiración
                        </label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardData.expiryDate}
                            onChange={(e) => handleCardDataChange('expiryDate', e.target.value)}
                            maxLength="5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            type="text"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => handleCardDataChange('cvv', e.target.value)}
                            maxLength="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex space-x-3 mt-6">
                <button
                    onClick={() => setShowCardForm(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    Cancelar
                </button>
                <button
                    onClick={handleCardPayment}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 disabled:opacity-50"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Procesando...
                        </span>
                    ) : (
                        'Pagar ahora'
                    )}
                </button>
            </div>
        </div>
    </div>
);

// Mover BankTransferModal FUERA también
const BankTransferModal = ({ setShowBankTransferModal, handleBankTransferConfirm }) => (
    <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
    >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                Simulación de Pago por Transferencia
            </h3>

            <div
                className="mb-6 text-gray-700 text-justify"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                <p>
                    Por el momento, esta sección es una <strong>simulación </strong>
                    de lo que será la redirección a la plataforma de pagos Wompi.
                </p>
                <p className="mt-2">
                    En la versión final, aquí podremos completar el pago de forma segura
                    a través de Wompi sin necesidad de ver o manejar la información bancaria directamente.
                </p>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={() => setShowBankTransferModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    Cerrar
                </button>
                <button
                    onClick={handleBankTransferConfirm}
                    className="px-4 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    Entendido
                </button>
            </div>
        </div>
    </div>
);

const PaymentMethodSelection = ({
    onNext,
    onBack,
    onPaymentInfoUpdate,
    initialData = {}
}) => {
    const [formData, setFormData] = useState({
        paymentType: initialData.paymentType || '',
        paymentProofImage: initialData.paymentProofImage || null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Estados para modales y formularios
    const [showBankTransferModal, setShowBankTransferModal] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showProofUpload, setShowProofUpload] = useState(false);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    // Opciones de pago disponibles
    const paymentOptions = [
        { value: 'Transferencia', label: 'Transferencia bancaria', description: 'Transfiere a nuestra cuenta bancaria' },
        { value: 'Efectivo', label: 'Pago en efectivo', description: 'Pago al momento de la entrega' },
        { value: 'Débito', label: 'Tarjeta de débito', description: 'Pago con tarjeta de débito' },
        { value: 'Crédito', label: 'Tarjeta de crédito', description: 'Pago con tarjeta de crédito' }
    ];

    // Función para validar el archivo
    const validateFile = (file) => {
        if (!file) {
            return 'El comprobante de pago es requerido';
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return 'El archivo no debe exceder 5MB';
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return 'Solo se permiten archivos JPG, PNG, WEBP o PDF';
        }

        return null;
    };

    // Manejar cambio en tipo de pago
    const handlePaymentTypeChange = (paymentType) => {
        setFormData(prev => ({
            ...prev,
            paymentType: paymentType
        }));

        // Limpiar errores
        if (errors.paymentType) {
            setErrors(prev => ({
                ...prev,
                paymentType: undefined
            }));
        }

        // Manejar lógica específica por tipo de pago
        if (paymentType === 'Transferencia') {
            setShowBankTransferModal(true);
        } else if (paymentType === 'Débito' || paymentType === 'Crédito') {
            setShowCardForm(true);
        } else if (paymentType === 'Efectivo') {
            // Para efectivo no se requiere comprobante inicialmente
            setShowProofUpload(false);
        }
    };

    // Usar useCallback para evitar recrear las funciones
    const handleCardDataChange = useCallback((field, value) => {
        setCardData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Formatear número de tarjeta - también usando useCallback
    const formatCardNumber = useCallback((value) => {
        const numbers = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = numbers.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return numbers;
        }
    }, []);

    // Procesar pago con tarjeta
    const handleCardPayment = useCallback(() => {
        // Simular procesamiento de pago
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setShowCardForm(false);
            setShowProofUpload(true);

            // Toast informativo adicional
            toast('Ahora sube el comprobante de la transacción', {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: '#3B82F6',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                },
                icon: '📄',
            });
        }, 2000);
    }, []);

    // Confirmar transferencia bancaria
    const handleBankTransferConfirm = useCallback(() => {
        setShowBankTransferModal(false);
        setShowProofUpload(true);
    }, []);

    // Manejar cambio en el archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setFormData(prev => ({
                ...prev,
                paymentProofImage: null
            }));
            setPreviewImage(null);
            return;
        }

        const fileError = validateFile(file);

        if (fileError) {
            setErrors(prev => ({
                ...prev,
                paymentProofImage: fileError
            }));
            setPreviewImage(null);
            // Toast de error para archivo inválido
            toast.error(fileError, {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                },
                icon: '❌',
            });
            return;
        }

        setErrors(prev => ({
            ...prev,
            paymentProofImage: undefined
        }));

        setFormData(prev => ({
            ...prev,
            paymentProofImage: file
        }));

        // Toast de éxito al subir archivo
        toast.success('Archivo cargado correctamente', {
            duration: 2000,
            position: 'top-center',
            style: {
                background: '#10B981',
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px'
            },
            icon: '✨',
        });

        // Crear preview si es imagen
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.paymentType) {
            newErrors.paymentType = 'Selecciona un método de pago';
        }

        // Para efectivo no es obligatorio el comprobante
        if (formData.paymentType !== 'Efectivo' && !formData.paymentProofImage) {
            newErrors.paymentProofImage = 'El comprobante de pago es requerido';
        }

        return newErrors;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            // Toast de error para validación
            toast.error('Por favor, completa todos los campos requeridos', {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                },
                icon: '⚠️',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Pasar datos al componente padre
            await onPaymentInfoUpdate({
                paymentType: formData.paymentType,
                paymentProofImage: formData.paymentProofImage,
                // Agregar flag para indicar si es pago en efectivo
                isEffectivePago: formData.paymentType === 'Efectivo'
            });

            // Toast de éxito al procesar
            toast.success('Información de pago guardada correctamente', {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: '#10B981',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                },
                icon: '💳',
            });

            onNext();
        } catch (error) {
            console.error('Error al procesar información de pago:', error);
            setErrors({ general: 'Error al procesar la información. Inténtalo nuevamente.' });

            // Toast de error
            toast.error('Error al procesar la información. Inténtalo nuevamente.', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '14px'
                },
                icon: '❌',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Toaster component para mostrar las notificaciones */}
            <Toaster />

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Método de pago
                </h2>

                {/* Error general */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.general}
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Selección de método de pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Selecciona tu método de pago *
                        </label>

                        <div className="space-y-3">
                            {paymentOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${formData.paymentType === option.value
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handlePaymentTypeChange(option.value)}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            value={option.value}
                                            checked={formData.paymentType === option.value}
                                            onChange={() => { }}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {option.label}
                                            </p>
                                            <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.paymentType && (
                            <p className="mt-2 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.paymentType}
                            </p>
                        )}
                    </div>

                    {/* Subir comprobante de pago - Solo si no es efectivo O si ya procesó el pago */}
                    {(formData.paymentType !== 'Efectivo' || showProofUpload) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Comprobante de pago {formData.paymentType !== 'Efectivo' ? '*' : '(Opcional)'}
                            </label>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="paymentProof"
                                    disabled={isSubmitting}
                                />

                                <label htmlFor="paymentProof" className="cursor-pointer">
                                    <div className="space-y-2">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div>
                                            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {formData.paymentProofImage ? formData.paymentProofImage.name : 'Haz clic para subir comprobante'}
                                            </p>
                                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                PNG, JPG, WEBP o PDF hasta 5MB
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {errors.paymentProofImage && (
                                <p className="mt-2 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.paymentProofImage}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Preview de imagen */}
                    {previewImage && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Vista previa:
                            </p>
                            <div className="border rounded-lg p-2 bg-gray-50">
                                <img
                                    src={previewImage}
                                    alt="Preview del comprobante"
                                    className="max-w-full h-auto max-h-60 mx-auto rounded"
                                />
                            </div>
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="flex justify-between pt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Volver
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 disabled:bg-pink-400 disabled:cursor-not-allowed transition-colors duration-200"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </span>
                            ) : (
                                'Revisar pedido'
                            )}
                        </button>
                    </div>
                </div>

                {/* Modales - Ahora usando los componentes externos */}
                {showBankTransferModal && (
                    <BankTransferModal
                        setShowBankTransferModal={setShowBankTransferModal}
                        handleBankTransferConfirm={handleBankTransferConfirm}
                    />
                )}
                {showCardForm && (
                    <CardForm
                        cardData={cardData}
                        handleCardDataChange={handleCardDataChange}
                        setShowCardForm={setShowCardForm}
                        handleCardPayment={handleCardPayment}
                        isSubmitting={isSubmitting}
                        formatCardNumber={formatCardNumber}
                    />
                )}
            </div>
        </>
    );
};

export default PaymentMethodSelection;
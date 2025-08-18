import React, { useState, useCallback } from 'react'; // Importando React
import toast, { Toaster } from 'react-hot-toast'; // Importando librería para alertas

// Mover CardForm FUERA del componente principal
const CardForm = ({
    cardData,
    handleCardDataChange,
    setShowCardForm,
    handleCardPayment,
    isSubmitting,
    formatCardNumber,
    formatExpiryDate,
    errors
}) => (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Datos de la tarjeta
                </h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de la tarjeta *
                    </label>
                    <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardDataChange('cardNumber', formatCardNumber(e.target.value))}
                        maxLength="19"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                            errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    {errors.cardNumber && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.cardNumber}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del titular *
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={cardData.cardName}
                        onChange={(e) => {
                            // Solo permitir letras y espacios
                            const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                            handleCardDataChange('cardName', value.slice(0, 50));
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                            errors.cardName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        maxLength={50}
                    />
                    {errors.cardName && (
                        <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {errors.cardName}
                        </p>
                    )}
                </div>

                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de expiración *
                        </label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardData.expiryDate}
                            onChange={(e) => handleCardDataChange('expiryDate', formatExpiryDate(e.target.value))}
                            maxLength="5"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                                errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.expiryDate && (
                            <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.expiryDate}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                        </label>
                        <input
                            type="text"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => {
                                // Solo permitir números y limitar a 3 dígitos
                                const value = e.target.value.replace(/\D/g, '');
                                handleCardDataChange('cvv', value.slice(0, 3));
                            }}
                            maxLength="3"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                                errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        {errors.cvv && (
                            <p className="mt-1 text-xs text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {errors.cvv}
                            </p>
                        )}
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
                        'Continuar'
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
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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
    const [cardErrors, setCardErrors] = useState({});

    // Opciones de pago disponibles (SIN EFECTIVO)
    const paymentOptions = [
        { value: 'Transferencia', label: 'Transferencia bancaria', description: 'Transfiere a nuestra cuenta bancaria' },
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

        // NUEVO: Resetear estado de comprobante cuando cambie el método de pago
        setShowProofUpload(false);
        setFormData(prev => ({
            ...prev,
            paymentProofImage: null
        }));
        setPreviewImage(null);

        // NUEVO: Limpiar datos y errores de tarjeta cuando cambie el método
        setCardData({
            cardNumber: '',
            cardName: '',
            expiryDate: '',
            cvv: ''
        });
        setCardErrors({});

        // Manejar lógica específica por tipo de pago
        if (paymentType === 'Transferencia') {
            setShowBankTransferModal(true);
        } else if (paymentType === 'Débito' || paymentType === 'Crédito') {
            setShowCardForm(true);
        }
    };

    // Usar useCallback para evitar recrear las funciones
    const handleCardDataChange = useCallback((field, value) => {
        setCardData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error específico cuando el usuario empiece a escribir
        if (cardErrors[field]) {
            setCardErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [cardErrors]);

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

    // NUEVA FUNCIÓN: Formatear fecha de expiración
    const formatExpiryDate = useCallback((value) => {
        // Remover todo excepto números
        const numbers = value.replace(/\D/g, '');
        
        // Limitar a 4 dígitos
        const truncated = numbers.slice(0, 4);
        
        // Formatear como MM/YY
        if (truncated.length >= 3) {
            return `${truncated.slice(0, 2)}/${truncated.slice(2)}`;
        }
        
        return truncated;
    }, []);

    // NUEVA FUNCIÓN: Validar datos de tarjeta
    const validateCardData = () => {
        const newErrors = {};

        // Validar número de tarjeta (debe tener 16 dígitos)
        const cardNumberDigits = cardData.cardNumber.replace(/\s/g, '');
        if (!cardNumberDigits) {
            newErrors.cardNumber = 'El número de tarjeta es requerido';
        } else if (cardNumberDigits.length !== 16) {
            newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
        } else if (!/^\d+$/.test(cardNumberDigits)) {
            newErrors.cardNumber = 'El número de tarjeta solo puede contener números';
        }

        // Validar nombre del titular (mínimo 5 caracteres, solo letras y espacios)
        if (!cardData.cardName.trim()) {
            newErrors.cardName = 'El nombre del titular es requerido';
        } else if (cardData.cardName.trim().length < 5) {
            newErrors.cardName = 'El nombre debe tener al menos 5 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cardData.cardName.trim())) {
            newErrors.cardName = 'El nombre solo puede contener letras y espacios';
        }

        // Validar fecha de expiración
        if (!cardData.expiryDate) {
            newErrors.expiryDate = 'La fecha de expiración es requerida';
        } else if (cardData.expiryDate.length !== 5) {
            newErrors.expiryDate = 'Formato de fecha inválido (MM/YY)';
        } else {
            const [month, year] = cardData.expiryDate.split('/');
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(`20${year}`, 10);
            
            if (monthNum < 1 || monthNum > 12) {
                newErrors.expiryDate = 'Mes inválido (01-12)';
            } else {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;
                
                if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                    newErrors.expiryDate = 'La tarjeta ha expirado';
                }
            }
        }

        // Validar CVV (debe tener exactamente 3 dígitos)
        if (!cardData.cvv) {
            newErrors.cvv = 'El CVV es requerido';
        } else if (cardData.cvv.length !== 3) {
            newErrors.cvv = 'El CVV debe tener 3 dígitos';
        } else if (!/^\d{3}$/.test(cardData.cvv)) {
            newErrors.cvv = 'El CVV solo puede contener números';
        }

        return newErrors;
    };

    // Procesar pago con tarjeta (sin comprobante)
    const handleCardPayment = useCallback(() => {
        // Validar datos de tarjeta antes de procesar
        const validationErrors = validateCardData();
        
        if (Object.keys(validationErrors).length > 0) {
            setCardErrors(validationErrors);
            // Toast de error para validación
            toast.error('Por favor, completa correctamente todos los campos de la tarjeta', {
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

        // Limpiar errores si la validación es exitosa
        setCardErrors({});

        // Simular procesamiento de pago
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setShowCardForm(false);

            // ✅ NUEVO: Marcar como procesado exitosamente para tarjetas
            setFormData(prev => ({
                ...prev,
                cardProcessed: true
            }));

            // Toast informativo - pago con tarjeta no requiere comprobante
            toast.success('Pago con tarjeta procesado correctamente', {
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
        }, 2000);
    }, [cardData]);

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

        // ✅ VALIDACIÓN MEJORADA: Considerar diferentes métodos de pago
        if (formData.paymentType === 'Transferencia') {
            // Para transferencia bancaria: requiere comprobante
            if (!formData.paymentProofImage) {
                newErrors.paymentProofImage = 'El comprobante de pago es requerido para transferencias bancarias';
            }
        } else if (formData.paymentType === 'Débito' || formData.paymentType === 'Crédito') {
            // Para tarjetas: no requiere comprobante, pero debe haberse procesado
            // La validación de datos de tarjeta se hace en handleCardPayment
            // No agregamos errores aquí para tarjetas
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
            // ✅ CORREGIDO: Pasar datos según el tipo de pago
            const paymentData = {
                paymentType: formData.paymentType,
                // Solo incluir paymentProofImage si es transferencia bancaria
                paymentProofImage: formData.paymentType === 'Transferencia' ? formData.paymentProofImage : null
            };

            await onPaymentInfoUpdate(paymentData);

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

                    {/* Subir comprobante de pago - Solo para transferencia bancaria */}
                    {formData.paymentType === 'Transferencia' && showProofUpload && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Comprobante de pago *
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
                        formatExpiryDate={formatExpiryDate}
                        errors={cardErrors}
                    />
                )}
            </div>
        </>
    );
};

export default PaymentMethodSelection;
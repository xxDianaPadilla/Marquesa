import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header/Header";
import ProgressSteps from "../components/ProgressSteps";
import PaymentOrderSummary from "../components/PaymentOrderSummary";
import ShippingInfo from "../components/ShippingInfo";
import PaymentMethodSelection from "../components/PaymentMethodSelection";
import OrderReview from "../components/OrderReview";
import useShoppingCart from "../components/ShoppingCart/hooks/useShoppingCart";

const PaymentProcessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const { 
        markDiscountAsUsedWithRealOrder, 
        clearCartAfterPurchase, 
        refreshCart, 
        debugDiscountState,
        // ✅ AÑADIR: Función para aplicar descuento
        applyDiscount,
        // Estados de descuento del hook
        appliedDiscount,
        discountAmount: hookDiscountAmount
    } = useShoppingCart();

    // Estado que mantiene el paso actual del proceso de pago
    const [currentStep, setCurrentStep] = useState(1);

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // *** NUEVO: Estado para el modal de éxito ***
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderSuccessData, setOrderSuccessData] = useState(null);

    // Estados para almacenar la información del proceso
    const [orderData, setOrderData] = useState({
        // Información del carrito (viene desde ShoppingCart)
        cartItems: [],
        cartTotal: 0,
        originalSubtotal: 0,
        discountApplied: false,
        discountAmount: 0,
        discountInfo: null,

        // Información de envío (se completa en ShippingInfo)
        shippingInfo: {
            receiverName: '',
            receiverPhone: '',
            deliveryAddress: '',
            deliveryPoint: '',
            deliveryDate: null
        },

        // Información de pago (se completa en PaymentMethodSelection)
        paymentInfo: {
            paymentType: '',
            paymentProofImage: null
        }
    });

    // Verificar autenticación y obtener datos del carrito
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Obtener datos del estado de navegación (desde ShoppingCart)
        const paymentState = location.state;

        if (!paymentState) {
            // Si no hay datos del carrito, redirigir al carrito
            navigate('/shoppingCart');
            return;
        }

        console.log('🛒 Datos del carrito recibidos en PaymentProcessPage:', paymentState);

        // ✅ NUEVO: Aplicar descuento al hook si viene en el estado
        if (paymentState.discountApplied && paymentState.discountInfo && paymentState.discountAmount > 0) {
            console.log('🎯 Aplicando descuento al hook desde location.state:', {
                discountInfo: paymentState.discountInfo,
                discountAmount: paymentState.discountAmount
            });
            
            // Aplicar el descuento al hook useShoppingCart
            applyDiscount(paymentState.discountInfo, paymentState.discountAmount);
        }

        // Actualizar orderData con la información del carrito
        setOrderData(prev => ({
            ...prev,
            cartTotal: paymentState.cartTotal || 0,
            originalSubtotal: paymentState.originalSubtotal || 0,
            discountApplied: paymentState.discountApplied || false,
            discountAmount: paymentState.discountAmount || 0,
            discountInfo: paymentState.discountInfo || null
        }));

    }, [isAuthenticated, location.state, navigate, applyDiscount]);

    // ✅ NUEVO: Effect para sincronizar descuento del hook con orderData
    useEffect(() => {
        if (appliedDiscount && hookDiscountAmount > 0) {
            console.log('🔄 Sincronizando descuento del hook con orderData:', {
                appliedDiscount,
                hookDiscountAmount
            });

            setOrderData(prev => ({
                ...prev,
                discountApplied: true,
                discountAmount: hookDiscountAmount,
                discountInfo: appliedDiscount
            }));
        }
    }, [appliedDiscount, hookDiscountAmount]);

    // Función que avanza al siguiente paso
    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 3));
        setError(null);
    };

    // Función que retrocede al paso anterior
    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError(null);
    };

    // Función para actualizar información de envío
    const handleShippingInfoUpdate = (shippingData) => {
        setOrderData(prev => ({
            ...prev,
            shippingInfo: {
                ...prev.shippingInfo,
                ...shippingData
            }
        }));
        console.log('Información de envío actualizada:', shippingData);
    };

    // Función para actualizar información de pago
    const handlePaymentInfoUpdate = (paymentData) => {
        setOrderData(prev => ({
            ...prev,
            paymentInfo: {
                ...prev.paymentInfo,
                ...paymentData
            }
        }));
        console.log('Información de pago actualizada:', paymentData);
    };

    // Función para crear la venta en el backend
    const createSale = async (saleData) => {
        try {
            const formData = new FormData();

            // Agregar campos requeridos
            formData.append('paymentType', saleData.paymentType);
            formData.append('deliveryAddress', saleData.deliveryAddress);
            formData.append('receiverName', saleData.receiverName);
            formData.append('receiverPhone', saleData.receiverPhone);
            formData.append('deliveryPoint', saleData.deliveryPoint);
            formData.append('deliveryDate', saleData.deliveryDate);
            formData.append('ShoppingCartId', saleData.ShoppingCartId);

            // Agregar imagen de comprobante
            if (saleData.paymentProofImage) {
                formData.append('paymentProofImage', saleData.paymentProofImage);
            }

            const response = await fetch('https://test-9gs3.onrender.com/api/sales', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Error al crear la venta');
            }
        } catch (error) {
            console.error('Error creando venta:', error);
            return {
                success: false,
                message: error.message || 'Error al procesar el pedido'
            };
        }
    };

    // Función que maneja la confirmación del pedido
    const handleConfirmOrder = async () => {
        try {
            setError(null);

            console.log('🛒 === CONFIRMANDO ORDEN ===');
            console.log('Estado del descuento antes de confirmar:', {
                // ✅ CAMBIADO: Usar datos del hook en lugar de orderData
                discountApplied: !!appliedDiscount,
                discountInfo: appliedDiscount,
                discountAmount: hookDiscountAmount,
                orderDataDiscount: {
                    discountApplied: orderData.discountApplied,
                    discountInfo: orderData.discountInfo,
                    discountAmount: orderData.discountAmount
                }
            });

            // Validar que tenemos toda la información necesaria
            if (!orderData.shippingInfo.receiverName ||
                !orderData.shippingInfo.receiverPhone ||
                !orderData.shippingInfo.deliveryAddress ||
                !orderData.shippingInfo.deliveryPoint ||
                !orderData.shippingInfo.deliveryDate) {
                setError('Faltan datos de envío requeridos');
                return;
            }

            // Validar datos de pago según el tipo
            if (!orderData.paymentInfo.paymentType) {
                setError('Falta seleccionar método de pago');
                return;
            }

            // Solo validar comprobante si no es efectivo
            if (orderData.paymentInfo.paymentType !== 'Efectivo' && !orderData.paymentInfo.paymentProofImage) {
                setError('Falta el comprobante de pago');
                return;
            }

            // Obtener el ShoppingCartId del usuario actual
            const cartResponse = await fetch(`https://test-9gs3.onrender.com/api/shoppingCart/client/${user.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const cartData = await cartResponse.json();

            if (!cartResponse.ok || !cartData.success || !cartData.shoppingCart) {
                setError('Error al obtener información del carrito');
                return;
            }

            // Preparar datos para crear la venta
            const saleData = {
                paymentType: orderData.paymentInfo.paymentType,
                deliveryAddress: orderData.shippingInfo.deliveryAddress,
                receiverName: orderData.shippingInfo.receiverName,
                receiverPhone: orderData.shippingInfo.receiverPhone,
                deliveryPoint: orderData.shippingInfo.deliveryPoint,
                deliveryDate: orderData.shippingInfo.deliveryDate,
                ShoppingCartId: cartData.shoppingCart._id,
                paymentProofImage: orderData.paymentInfo.paymentProofImage
            };

            console.log('Datos de venta a enviar:', saleData);

            // Crear la venta
            const result = await createSale(saleData);

            if (result.success) {
                console.log('Venta creada exitosamente:', result.data);

                // ✅ CAMBIADO: Usar datos del hook para verificar descuento
                if (appliedDiscount && hookDiscountAmount > 0) {
                    try {
                        console.log('Marcando código de descuento como usado:', {
                            discountInfo: appliedDiscount,
                            discountAmount: hookDiscountAmount,
                            orderId: result.data.sale._id
                        });

                        const discountResult = await markDiscountAsUsedWithRealOrder(result.data.sale._id);

                        if (discountResult) {
                            console.log('Código de descuento marcado como usado exitosamente');
                        } else {
                            console.warn('No se pudo marcar el código de descuento como usado, pero el pedido fue creado');
                        }
                    } catch (discountError) {
                        console.error('Error al marcar descuento como usado:', discountError);
                    }
                }

                // Limpiar carrito después de marcar el descuento
                const clearResult = await clearCartAfterPurchase(cartData.shoppingCart._id);

                if (clearResult.success) {
                    console.log('Carrito limpiado exitosamente');
                } else {
                    console.warn('No se pudo limpiar el carrito, pero la compra fue exitosa');
                }

                // *** Mostrar modal en lugar de redirigir ***
                setOrderSuccessData({
                    orderId: result.data.sale._id,
                    orderData: orderData,
                    // ✅ CAMBIADO: Usar datos del hook
                    discountUsed: !!appliedDiscount,
                    discountAmount: hookDiscountAmount,
                    saleStatus: result.data.sale.status,
                    paymentType: result.data.sale.paymentType
                });
                setShowSuccessModal(true);

            } else {
                setError(result.message || 'Error al procesar el pedido');
            }

        } catch (error) {
            console.error('Error al confirmar pedido:', error);
            setError('Error inesperado al procesar el pedido');
        }
    };

    useEffect(() => {
        // Debug cada 5 segundos
        const interval = setInterval(() => {
            if (debugDiscountState) {
                debugDiscountState();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [debugDiscountState]);

    // *** NUEVO: Función para manejar el botón "Seguir comprando" ***
    const handleContinueShopping = () => {
        setShowSuccessModal(false);

        // NUEVO: Forzar recarga del carrito antes de navegar
        if (refreshCart) {
            refreshCart();
        }

        navigate('/categoryProducts');
    };

    // *** NUEVO: Componente Modal de Éxito ***
    const SuccessModal = () => {
        if (!showSuccessModal || !orderSuccessData) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="p-6 text-center">
                        {/* Icono de éxito */}
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        {/* Título */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ¡Pedido Realizado!
                        </h2>

                        {/* Mensaje */}
                        <p className="text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tu pedido ha sido procesado exitosamente.
                        </p>

                        {/* ID del pedido */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-6">
                            <p className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Número de pedido:
                            </p>
                            <p className="font-mono text-sm font-semibold text-gray-900">
                                {orderSuccessData.orderId}
                            </p>
                        </div>

                        {/* Información adicional */}
                        <div className="text-left mb-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Total pagado:
                                </span>
                                <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    ${orderSuccessData.orderData.cartTotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Método de pago:
                                </span>
                                <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {orderSuccessData.orderData.paymentInfo.paymentType}
                                </span>
                            </div>
                            {orderSuccessData.discountUsed && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Descuento aplicado:
                                    </span>
                                    <span className="text-sm font-semibold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        -${orderSuccessData.discountAmount.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Mensaje informativo */}
                        <p className="text-xs text-gray-500 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Recibirás una confirmación por correo electrónico con los detalles de tu pedido.
                        </p>

                        {/* Botón para continuar comprando */}
                        <button
                            onClick={handleContinueShopping}
                            className="w-full bg-pink-400 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-500 transition-colors"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            Seguir Comprando
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Función que renderiza el componente correspondiente según el paso actual
    const renderCurrentComponent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ShippingInfo
                        onNext={handleNextStep}
                        onShippingInfoUpdate={handleShippingInfoUpdate}
                        userInfo={user}
                        initialData={orderData.shippingInfo}
                    />
                );
            case 2:
                return (
                    <PaymentMethodSelection
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                        onPaymentInfoUpdate={handlePaymentInfoUpdate}
                        initialData={orderData.paymentInfo}
                    />
                );
            case 3:
                return (
                    <OrderReview
                        onBack={handlePrevStep}
                        onConfirm={handleConfirmOrder}
                        orderData={orderData}
                        isProcessing={false}
                    />
                );
            default:
                return null;
        }
    };

    // Mostrar mensaje de error si existe
    const ErrorMessage = () => {
        if (!error) return null;

        return (
            <div className="max-w-6xl mx-auto px-6 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {error}
                        </span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                            style={{ cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Si no está autenticado, mostrar loading o redirigir
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p style={{ fontFamily: 'Poppins, sans-serif' }}>Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white-50">
                <ErrorMessage />

                {/* Componente que muestra el progreso de los pasos */}
                <ProgressSteps currentStep={currentStep} />

                <div className="max-w-6xl mx-auto px-6 pb-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Contenido dinámico que cambia según el paso actual */}
                        <div className="flex-1">
                            {renderCurrentComponent()}
                        </div>

                        {/* Resumen del pedido (se mantiene constante) */}
                        <div className="w-full lg:w-1/3">
                            <PaymentOrderSummary
                                subtotal={orderData.originalSubtotal}
                                total={orderData.cartTotal}
                                // ✅ CAMBIADO: Usar datos del hook
                                discountApplied={!!appliedDiscount}
                                discountAmount={hookDiscountAmount}
                                discountInfo={appliedDiscount}
                                cartItems={orderData.cartItems}
                            />
                        </div>
                    </div>
                </div>

                {/* *** NUEVO: Modal de éxito *** */}
                <SuccessModal />
            </div>
        </>
    );
};

export default PaymentProcessPage;
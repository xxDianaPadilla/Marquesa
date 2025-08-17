// OrderDetail.js - Componente actualizado para usar React Leaflet
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from "../components/Header/Header";
import toast from 'react-hot-toast';

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para el marcador de entrega
const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#E8ACD2" stroke="#fff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#E8ACD2" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const OrderDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();

  // Estados
  const [orderData, setOrderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.692940, -89.218191]); // San Salvador por defecto

  // Función para geocodificar dirección usando Nominatim (gratuito)
  const geocodeAddress = async (address) => {
    try {
      if (!address || address.trim() === '') {
        console.log('Dirección vacía, usando coordenadas por defecto');
        return [13.692940, -89.218191]; // San Salvador por defecto
      }

      const encodedAddress = encodeURIComponent(`${address}, San Salvador, El Salvador`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=sv`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log('Geocodificación exitosa:', { lat, lon, address });
        return [lat, lon];
      } else {
        console.log('No se encontraron coordenadas para:', address);
        return [13.692940, -89.218191]; // Fallback a San Salvador
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return [13.692940, -89.218191]; // Fallback a San Salvador
    }
  };

  // Función para obtener detalles del pedido usando la nueva ruta
  const getOrderDetails = async (saleId) => {
    try {
      setLoading(true);

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/details`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderData(data.data.order);
          setCustomerData(data.data.customer);
          setProductsData(data.data.products);

          // Geocodificar la dirección de entrega
          if (data.data.order.deliveryAddress) {
            const coordinates = await geocodeAddress(data.data.order.deliveryAddress);
            setMapCenter(coordinates);
          }

          // Obtener información de cancelación
          await getCancellationEligibility(saleId);
        } else {
          setError('Error al cargar los detalles del pedido');
          toast.error('Error al cargar los detalles del pedido');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error de conexión con el servidor');
        toast.error(errorData.message || 'Error de conexión con el servidor');
      }
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      setError('Error al cargar los detalles del pedido');
      toast.error('Error al cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar elegibilidad de cancelación
  const getCancellationEligibility = async (saleId) => {
    try {
      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/cancellation-eligibility`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCancellationInfo(data.data);
        }
      }
    } catch (error) {
      console.error('Error al obtener información de cancelación:', error);
    }
  };

  // Effect para cargar datos cuando se monta el componente
  useEffect(() => {
    // Verificar si hay datos pasados desde el perfil
    if (location.state && location.state.orderData) {
      const { orderData: order, customerData: customer, productsData: products } = location.state;
      setOrderData(order);
      setCustomerData(customer);
      setProductsData(products || []);
      setLoading(false);

      // Geocodificar la dirección de entrega
      if (order.deliveryAddress) {
        geocodeAddress(order.deliveryAddress).then(coordinates => {
          setMapCenter(coordinates);
        });
      }

      // Obtener información de cancelación si hay orderId
      if (order._id) {
        getCancellationEligibility(order._id);
      }
    } else if (orderId) {
      // Si no hay datos en el state, cargar desde la API
      getOrderDetails(orderId);
    } else {
      setError('No se encontraron datos del pedido');
      setLoading(false);
    }
  }, [location.state, orderId]);

  // Navegación para atrás
  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  // Función mejorada para cancelar pedido
  const handleCancelOrder = async () => {
    if (!orderData || !cancellationInfo?.isCancellable) return;

    const confirmMessage = `¿Estás seguro de que deseas cancelar este pedido?\n\nTienes hasta ${cancellationInfo.remainingHours} horas para cancelar.`;
    const confirmCancel = window.confirm(confirmMessage);
    if (!confirmCancel) return;

    try {
      setCancelLoading(true);

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${orderData._id}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Pedido cancelado exitosamente');
        // Actualizar el estado del pedido
        setOrderData(prev => ({
          ...prev,
          status: 'Cancelado',
          trackingStatus: 'Cancelado'
        }));
        // Actualizar información de cancelación
        setCancellationInfo(prev => ({
          ...prev,
          isCancellable: false
        }));
      } else {
        toast.error(data.message || 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      toast.error('Error al cancelar el pedido');
    } finally {
      setCancelLoading(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener fecha de cancelación
  const getCancellableDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Configuración de pasos según trackingStatus
  const getSteps = (trackingStatus) => {
    const steps = [
      {
        id: 0,
        label: "Agendado",
        icon: Clock,
        completed: false,
        current: false
      },
      {
        id: 1,
        label: "En proceso",
        icon: Truck,
        completed: false,
        current: false
      },
      {
        id: 2,
        label: "Entregado",
        icon: CheckCircle2,
        completed: false,
        current: false
      }
    ];

    // Actualizar estado de los pasos según trackingStatus
    switch (trackingStatus) {
      case 'Agendado':
        steps[0].completed = true;
        steps[0].current = true;
        break;
      case 'En proceso':
        steps[0].completed = true;
        steps[1].completed = true;
        steps[1].current = true;
        break;
      case 'Entregado':
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[2].current = true;
        break;
      default:
        steps[0].current = true;
    }

    return steps;
  };

  // Función para obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Agendado':
        return { color: '#F59E0B', backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
      case 'En proceso':
        return { color: '#3B82F6', backgroundColor: '#DBEAFE', borderColor: '#3B82F6' };
      case 'Entregado':
        return { color: '#10B981', backgroundColor: '#D1FAE5', borderColor: '#10B981' };
      case 'Cancelado':
        return { color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
      default:
        return { color: '#6B7280', backgroundColor: '#F3F4F6', borderColor: '#6B7280' };
    }
  };

  // Función para obtener etiqueta del estado
  const getStatusLabel = (trackingStatus) => {
    const statusMap = {
      'Agendado': 'Preparando',
      'En proceso': 'En proceso',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };
    return statusMap[trackingStatus] || trackingStatus;
  };

  const ProductImage = ({
    src,
    alt = 'Producto',
    className = "w-full h-full object-cover rounded-lg",
    showError = true,
    isPersonalized = false
  }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Función para extraer URL de imagen de diferentes formatos
    const extractImageUrl = (source) => {
      console.log('Extrayendo URL de:', typeof source, source);

      // Si es null o undefined
      if (!source) {
        console.log('Fuente es null/undefined');
        return null;
      }

      // Si es un string directo
      if (typeof source === 'string') {
        console.log('Fuente es string:', source);
        return source.trim();
      }

      // Si es un objeto, buscar la URL en diferentes propiedades
      if (typeof source === 'object' && source !== null) {
        console.log('Fuente es objeto, buscando URL...');
        const url = source.image ||
          source.url ||
          source.src ||
          source.path ||
          source.href;

        console.log('URL extraída del objeto:', url);
        return url;
      }

      console.log('Tipo de fuente no reconocido:', typeof source);
      return null;
    };

    // Función para validar si src es válido
    const isValidImageSrc = (source) => {
      const extractedUrl = extractImageUrl(source);

      if (!extractedUrl || typeof extractedUrl !== 'string') {
        console.log('URL extraída inválida:', extractedUrl);
        return false;
      }

      const trimmed = extractedUrl.trim();
      if (!trimmed ||
        trimmed === 'null' ||
        trimmed === 'undefined' ||
        trimmed.toLowerCase() === 'none') {
        console.log('URL vacía o nula:', extractedUrl);
        return false;
      }

      // Verificar que parezca una URL
      try {
        new URL(trimmed);
        console.log('URL válida:', trimmed);
        return trimmed; // Retornamos la URL válida
      } catch {
        console.log('URL inválida:', extractedUrl);
        return false;
      }
    };

    // Precargar imagen para verificar si existe
    const preloadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
    };

    useEffect(() => {
      const loadImage = async () => {
        setIsLoading(true);
        setHasError(false);

        console.log('=== CARGANDO IMAGEN ===');
        console.log('Prop src recibida:', typeof src, src);

        // Validar y extraer URL
        const validUrl = isValidImageSrc(src);
        if (!validUrl) {
          console.log('URL no válida, mostrando placeholder');
          setHasError(true);
          setImageSrc(null);
          setIsLoading(false);
          return;
        }

        try {
          // Intentar precargar la imagen
          console.log('Intentando precargar:', validUrl);
          await preloadImage(validUrl);
          setImageSrc(validUrl);
          setHasError(false);
          console.log('✅ Imagen precargada exitosamente');
        } catch (error) {
          console.warn('❌ Error al cargar imagen:', validUrl, error);
          setHasError(true);
          setImageSrc(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadImage();
    }, [src]);

    // Manejar error de carga
    const handleError = (e) => {
      console.warn('Error en img.onError:', src);
      setHasError(true);
      setImageSrc(null);
    };

    // Manejar carga exitosa
    const handleLoad = () => {
      console.log('Imagen cargada exitosamente:', src);
      setHasError(false);
    };

    // Estados de loading
    if (isLoading) {
      return (
        <div className={`${className} bg-gray-200 flex items-center justify-center animate-pulse`}>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      );
    }

    // Si hay error o no hay imagen válida, mostrar placeholder
    if (hasError || !imageSrc) {
      // Si es un producto personalizado, mostrar emoji de paleta
      if (isPersonalized) {
        return (
          <div className={`${className} bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-purple-200`}>
            <div className="text-center">
              <div className="text-4xl mb-1">🎨</div>
              {showError && (
                <span className="text-xs text-purple-600 font-medium">Personalizado</span>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className={`${className} bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300`}>
          <div className="text-center">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            {showError && (
              <span className="text-xs text-gray-400">Sin imagen</span>
            )}
          </div>
        </div>
      );
    }

    // Renderizar imagen
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 ml-4">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-white-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'No se encontraron datos del pedido'}</p>
            <button
              onClick={handleSavesClick}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Volver al perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = getSteps(orderData.trackingStatus);
  const statusStyle = getStatusColor(orderData.trackingStatus);
  const progressPercentage = orderData.trackingStatus === 'Agendado' ? 33 :
    orderData.trackingStatus === 'En proceso' ? 66 :
      orderData.trackingStatus === 'Entregado' ? 100 : 33;

  const showCancelButton = cancellationInfo?.isCancellable &&
    orderData.trackingStatus !== 'Entregado' &&
    orderData.trackingStatus !== 'Cancelado';

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Header personalizado de la página */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <br />
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={handleSavesClick}
                style={{ cursor: 'pointer' }}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Detalles del pedido #{orderData._id?.slice(-6) || 'N/A'}
                </h1>
                <p className="text-sm text-gray-500">
                  Realizado el {formatDate(orderData.createdAt)}
                </p>
              </div>
            </div>

            {showCancelButton && (
              <div className="flex flex-col items-end">
                <button
                  className="px-2 sm:px-4 py-2 text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#E8ACD2', cursor: 'pointer' }}
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
                {cancellationInfo?.remainingHours > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Quedan {cancellationInfo.remainingHours}h para cancelar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del Pedido */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Estado del Pedido
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Fecha estimada de entrega: {formatDate(orderData.deliveryDate)}
              </p>

              {/* Progress Bar */}
              <div className="relative mb-8">
                {/* Barra de progreso completa */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: '#E8ACD2'
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step.completed || step.current ? 'text-white' : 'bg-gray-400 text-gray-500'
                            }`}
                          style={{
                            backgroundColor: step.completed || step.current ? '#E8ACD2' : ''
                          }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`mt-2 text-sm font-medium ${step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Cancelable hasta: {getCancellableDate(orderData.createdAt)}</span>
                {cancellationInfo && !cancellationInfo.isCancellable && (
                  <span className="text-red-500">Período de cancelación expirado</span>
                )}
              </div>
            </div>

            {/* Ubicación en tiempo real con React Leaflet */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Ubicación en tiempo real
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Sigue la ubicación de tu pedido en el mapa
              </p>

              {/* Mapa interactivo con React Leaflet */}
              <div className="rounded-lg h-64 overflow-hidden relative">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapCenter} icon={deliveryIcon}>
                    <Popup>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 mb-1">
                          Dirección de entrega
                        </div>
                        <div className="text-sm text-gray-600">
                          {orderData.deliveryAddress || 'San Salvador, El Salvador'}
                        </div>
                        {orderData.deliveryPoint && (
                          <div className="text-xs text-gray-500 mt-1">
                            Punto de referencia: {orderData.deliveryPoint}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>

                {/* Overlay con información del estado */}
                <div className="absolute bottom-4 left-4 right-4 bg-gray-800 text-white p-3 rounded-lg bg-opacity-90 backdrop-blur-sm">
                  <p className="text-sm font-medium">
                    {orderData.trackingStatus === 'Entregado' ? 'Tu pedido ha sido entregado' :
                      orderData.trackingStatus === 'En proceso' ? 'Tu pedido está en proceso' :
                        orderData.trackingStatus === 'Cancelado' ? 'Tu pedido fue cancelado' :
                          'Tu pedido está siendo preparado'}
                  </p>
                  <p className="text-xs text-gray-300">
                    {orderData.trackingStatus === 'En proceso' ? 'Llegará en aproximadamente 25 minutos' :
                      orderData.trackingStatus === 'Agendado' ? 'Será enviado pronto' :
                        orderData.trackingStatus === 'Cancelado' ? 'Pedido cancelado' :
                          'Pedido completado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Productos
              </h2>

              <div className="space-y-4">
                {productsData && productsData.length > 0 ? (
                  productsData.map((item, index) => {
                    // Detectar si es un producto personalizado
                    const isPersonalized = item.collection === 'CustomProducts' ||
                      (item.isPersonalized && item.collection !== 'Products') ||
                      item.type === 'personalizado' ||
                      item.customized === true;

                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ProductImage
                            src={item.referenceImage || item.image}
                            alt={item.name || 'Producto'}
                            className="w-full h-full object-cover rounded-lg"
                            isPersonalized={isPersonalized}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.name || 'Producto sin nombre'}
                            </p>
                            {isPersonalized && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                <span className="mr-1 text-sm">🎨</span>
                                Personalizado
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.description || 'Sin descripción'}
                          </p>
                          {item.quantity && (
                            <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                          )}
                          {/* Mostrar detalles de personalización si existen */}
                          {isPersonalized && item.customization && (
                            <div className="mt-2 text-xs text-purple-600">
                              <p>✨ Detalles de personalización:</p>
                              <p className="text-gray-600 ml-2">{item.customization}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.subtotal?.toFixed(2) || item.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron productos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Estado</h2>
                <span
                  className="px-3 py-1 text-sm rounded-full border"
                  style={{
                    color: statusStyle.color,
                    borderColor: statusStyle.borderColor,
                    backgroundColor: statusStyle.backgroundColor
                  }}
                >
                  {getStatusLabel(orderData.trackingStatus)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      ${orderData.shoppingCart?.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de cancelación */}
              {cancellationInfo && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Información de cancelación:</p>
                    <div className="space-y-1">
                      <p>Estado: <span className={cancellationInfo.isCancellable ? 'text-green-600' : 'text-red-600'}>
                        {cancellationInfo.isCancellable ? 'Cancelable' : 'No cancelable'}
                      </span></p>
                      {cancellationInfo.isCancellable && cancellationInfo.remainingHours > 0 && (
                        <p>Tiempo restante: <span className="text-orange-600">{cancellationInfo.remainingHours} horas</span></p>
                      )}
                      <p>Límite: {formatDate(cancellationInfo.cancellableUntil)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de envío
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación de entrega</p>
                    <p className="text-sm text-gray-500">
                      {orderData.deliveryAddress || 'Dirección no disponible'}
                    </p>
                    {orderData.deliveryPoint && (
                      <p className="text-sm text-gray-500 mt-1">
                        Punto de referencia: {orderData.deliveryPoint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fecha de entrega estimada</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(orderData.deliveryDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de contacto
              </h2>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customerData?.fullName || orderData.receiverName || 'Nombre no disponible'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customerData?.phone || orderData.receiverPhone || 'Teléfono no disponible'}
                    </p>
                    {customerData?.address && (
                      <p className="text-sm text-gray-500">
                        Dirección registrada: {customerData.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del pedido */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información del pedido
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ID del pedido:</span>
                  <span className="text-sm font-medium text-gray-900">
                    #{orderData._id?.slice(-8) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de creación:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(orderData.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Método de pago:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {orderData.paymentType || 'No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(orderData.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
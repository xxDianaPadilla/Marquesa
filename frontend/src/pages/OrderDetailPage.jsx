// Componente actualizado para mostrar detalles de pedidos usando React Leaflet
// Importación de React y hooks necesarios
import React, { useState, useEffect } from "react";
// Importación de hooks de navegación de React Router
import { useNavigate, useLocation, useParams } from "react-router-dom";
// Importación de iconos de Lucide React
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, AlertCircle, X, AlertTriangle } from "lucide-react";
// Importación de componentes de React Leaflet para mapas
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// Importación de Leaflet para configuración de mapas
import L from 'leaflet';
// Importación de estilos CSS de Leaflet
import 'leaflet/dist/leaflet.css';
// Importación de componentes propios
import Header from "../components/Header/Header";
// Importación de biblioteca de notificaciones
import toast from 'react-hot-toast';

// Configuración de iconos de Leaflet para evitar problemas de carga
delete L.Icon.Default.prototype._getIconUrl;
// Fusión de opciones por defecto para iconos de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Creación de icono personalizado para marcador de entrega
const deliveryIcon = new L.Icon({
  // URL del icono personalizado en formato SVG base64
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#E8ACD2" stroke="#fff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#E8ACD2" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  // Tamaño del icono en píxeles
  iconSize: [25, 41],
  // Punto de anclaje del icono
  iconAnchor: [12, 41],
  // Punto de anclaje del popup
  popupAnchor: [1, -34],
  // URL de la sombra del icono
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  // Tamaño de la sombra
  shadowSize: [41, 41]
});

// Componente Modal de Confirmación
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, remainingHours, isLoading }) => {
  // Effect para manejar la tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 leading-relaxed">
            {message}
          </p>
          
          {/* Información adicional sobre el tiempo restante */}
          {remainingHours && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">
                  Tienes hasta {remainingHours} horas para cancelar este pedido
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mantener pedido
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                <span>Sí, cancelar pedido</span>
              )}
            </button>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            Esta acción no se puede deshacer una vez confirmada
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal para mostrar detalles de pedidos
const OrderDetail = () => {
  // Hook para navegación programática
  const navigate = useNavigate();
  // Hook para obtener información de ubicación actual
  const location = useLocation();
  // Hook para obtener parámetros de la URL
  const { orderId } = useParams();

  // Estados para datos del pedido
  const [orderData, setOrderData] = useState(null);
  // Estado para datos del cliente
  const [customerData, setCustomerData] = useState(null);
  // Estado para datos de productos
  const [productsData, setProductsData] = useState([]);
  // Estado de carga general
  const [loading, setLoading] = useState(true);
  // Estado para errores
  const [error, setError] = useState(null);
  // Estado para información de cancelación
  const [cancellationInfo, setCancellationInfo] = useState(null);
  // Estado de carga para cancelación
  const [cancelLoading, setCancelLoading] = useState(false);
  // Estado para centro del mapa con coordenadas de San Salvador por defecto
  const [mapCenter, setMapCenter] = useState([13.692940, -89.218191]);
  // Estado para controlar el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Función para geocodificar dirección usando servicio Nominatim gratuito
  const geocodeAddress = async (address) => {
    try {
      // Verificar si la dirección está vacía
      if (!address || address.trim() === '') {
        console.log('Dirección vacía, usando coordenadas por defecto');
        // Retornar coordenadas de San Salvador por defecto
        return [13.692940, -89.218191];
      }

      // Codificar dirección para URL agregando contexto de El Salvador
      const encodedAddress = encodeURIComponent(`${address}, San Salvador, El Salvador`);
      // Realizar petición a servicio de geocodificación Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=sv`
      );

      // Parsear respuesta JSON
      const data = await response.json();

      // Verificar si se obtuvieron resultados
      if (data && data.length > 0) {
        // Extraer coordenadas de latitud y longitud
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        // Log de geocodificación exitosa
        console.log('Geocodificación exitosa:', { lat, lon, address });
        return [lat, lon];
      } else {
        // Log cuando no se encuentran coordenadas
        console.log('No se encontraron coordenadas para:', address);
        // Retornar coordenadas por defecto
        return [13.692940, -89.218191];
      }
    } catch (error) {
      // Log de error en geocodificación
      console.error('Error en geocodificación:', error);
      // Retornar coordenadas por defecto en caso de error
      return [13.692940, -89.218191];
    }
  };

  // Función para obtener detalles del pedido usando endpoint específico
  const getOrderDetails = async (saleId) => {
    try {
      // Activar estado de carga
      setLoading(true);

      // Realizar petición al endpoint de detalles de venta
      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/details`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar si la respuesta es exitosa
      if (response.ok) {
        // Parsear respuesta JSON
        const data = await response.json();
        // Verificar si la operación fue exitosa
        if (data.success) {
          // Establecer datos del pedido en el estado
          setOrderData(data.data.order);
          // Establecer datos del cliente en el estado
          setCustomerData(data.data.customer);
          // Establecer datos de productos en el estado
          setProductsData(data.data.products);

          // Geocodificar la dirección de entrega si existe
          if (data.data.order.deliveryAddress) {
            // Obtener coordenadas de la dirección
            const coordinates = await geocodeAddress(data.data.order.deliveryAddress);
            // Establecer centro del mapa con las coordenadas obtenidas
            setMapCenter(coordinates);
          }

          // Obtener información de elegibilidad para cancelación
          await getCancellationEligibility(saleId);
        } else {
          // Establecer error en caso de respuesta no exitosa
          setError('Error al cargar los detalles del pedido');
          // Mostrar notificación de error
          toast.error('Error al cargar los detalles del pedido');
        }
      } else {
        // Parsear respuesta de error
        const errorData = await response.json();
        // Establecer mensaje de error en el estado
        setError(errorData.message || 'Error de conexión con el servidor');
        // Mostrar notificación de error
        toast.error(errorData.message || 'Error de conexión con el servidor');
      }
    } catch (error) {
      // Log de error al obtener detalles
      console.error('Error al obtener detalles del pedido:', error);
      // Establecer error genérico
      setError('Error al cargar los detalles del pedido');
      // Mostrar notificación de error
      toast.error('Error al cargar los detalles del pedido');
    } finally {
      // Desactivar estado de carga sin importar el resultado
      setLoading(false);
    }
  };

  // Función para verificar elegibilidad de cancelación del pedido
  const getCancellationEligibility = async (saleId) => {
    try {
      // Realizar petición al endpoint de elegibilidad de cancelación
      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/cancellationEligibility`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar si la respuesta es exitosa
      if (response.ok) {
        // Parsear respuesta JSON
        const data = await response.json();
        // Verificar si la operación fue exitosa
        if (data.success) {
          // Establecer información de cancelación en el estado
          setCancellationInfo(data.data);
        }
      }
    } catch (error) {
      // Log de error al obtener información de cancelación
      console.error('Error al obtener información de cancelación:', error);
    }
  };

  // Effect para cargar datos cuando se monta el componente
  useEffect(() => {
    // Verificar si hay datos pasados desde el perfil a través del state
    if (location.state && location.state.orderData) {
      // Desestructurar datos del state
      const { orderData: order, customerData: customer, productsData: products } = location.state;
      // Establecer datos en los estados correspondientes
      setOrderData(order);
      setCustomerData(customer);
      setProductsData(products || []);
      // Desactivar estado de carga
      setLoading(false);

      // Geocodificar la dirección de entrega si existe
      if (order.deliveryAddress) {
        // Obtener coordenadas y actualizar centro del mapa
        geocodeAddress(order.deliveryAddress).then(coordinates => {
          setMapCenter(coordinates);
        });
      }

      // Obtener información de cancelación si hay ID de orden
      if (order._id) {
        getCancellationEligibility(order._id);
      }
    } else if (orderId) {
      // Si no hay datos en el state, cargar desde la API usando orderId
      getOrderDetails(orderId);
    } else {
      // Error si no se encuentran datos del pedido
      setError('No se encontraron datos del pedido');
      setLoading(false);
    }
  }, [location.state, orderId]);

  // Función para navegación de regreso al perfil
  const handleSavesClick = (e) => {
    // Prevenir comportamiento por defecto del evento
    e.preventDefault();
    // Navegar a la página de perfil
    navigate('/profile');
  };

  // Función para mostrar modal de confirmación
  const handleCancelOrderClick = () => {
    // Verificar que existan datos del pedido y sea cancelable
    if (!orderData || !cancellationInfo?.isCancellable) return;
    
    // Mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  // Función para cerrar modal de confirmación
  const handleCloseModal = () => {
    if (!cancelLoading) {
      setShowConfirmModal(false);
    }
  };

  // Función para confirmar cancelación del pedido
  const handleConfirmCancel = async () => {
    try {
      // Activar estado de carga para cancelación
      setCancelLoading(true);

      // Realizar petición para cancelar el pedido
      const response = await fetch(`https://marquesa.onrender.com/api/sales/${orderData._id}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parsear respuesta JSON
      const data = await response.json();

      // Verificar si la cancelación fue exitosa
      if (response.ok && data.success) {
        // Mostrar notificación de éxito
        toast.success('Pedido cancelado exitosamente');
        // Actualizar el estado del pedido en el estado local
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
        // Cerrar modal
        setShowConfirmModal(false);
      } else {
        // Mostrar notificación de error
        toast.error(data.message || 'Error al cancelar el pedido');
      }
    } catch (error) {
      // Log de error al cancelar pedido
      console.error('Error al cancelar pedido:', error);
      // Mostrar notificación de error
      toast.error('Error al cancelar el pedido');
    } finally {
      // Desactivar estado de carga para cancelación
      setCancelLoading(false);
    }
  };

  // Función para formatear fecha en formato local español
  const formatDate = (dateString) => {
    // Verificar que la fecha exista
    if (!dateString) return 'N/A';
    // Crear objeto Date
    const date = new Date(dateString);
    // Retornar fecha formateada en español
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener fecha límite de cancelación
  const getCancellableDate = (createdAt) => {
    // Verificar que la fecha de creación exista
    if (!createdAt) return 'N/A';
    // Crear objeto Date
    const date = new Date(createdAt);
    // Agregar 3 días a la fecha de creación
    date.setDate(date.getDate() + 3);
    // Retornar fecha formateada
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para configurar pasos del tracking según estado
  const getSteps = (trackingStatus) => {
    // Definir array de pasos con configuración inicial
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
        // Marcar primer paso como completado y actual
        steps[0].completed = true;
        steps[0].current = true;
        break;
      case 'En proceso':
        // Marcar primeros dos pasos como completados, segundo como actual
        steps[0].completed = true;
        steps[1].completed = true;
        steps[1].current = true;
        break;
      case 'Entregado':
        // Marcar todos los pasos como completados, último como actual
        steps[0].completed = true;
        steps[1].completed = true;
        steps[2].completed = true;
        steps[2].current = true;
        break;
      default:
        // Por defecto, marcar primer paso como actual
        steps[0].current = true;
    }

    return steps;
  };

  // Función para obtener colores según estado del pedido
  const getStatusColor = (status) => {
    // Switch para determinar colores según estado
    switch (status) {
      case 'Agendado':
        // Colores amarillos para agendado
        return { color: '#F59E0B', backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
      case 'En proceso':
        // Colores azules para en proceso
        return { color: '#3B82F6', backgroundColor: '#DBEAFE', borderColor: '#3B82F6' };
      case 'Entregado':
        // Colores verdes para entregado
        return { color: '#10B981', backgroundColor: '#D1FAE5', borderColor: '#10B981' };
      case 'Cancelado':
        // Colores rojos para cancelado
        return { color: '#EF4444', backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
      default:
        // Colores grises por defecto
        return { color: '#6B7280', backgroundColor: '#F3F4F6', borderColor: '#6B7280' };
    }
  };

  // Función para obtener etiqueta legible del estado
  const getStatusLabel = (trackingStatus) => {
    // Mapeo de estados internos a etiquetas de usuario
    const statusMap = {
      'Agendado': 'Preparando',
      'En proceso': 'En proceso',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };
    // Retornar etiqueta mapeada o estado original
    return statusMap[trackingStatus] || trackingStatus;
  };

  // Componente para mostrar imágenes de productos con manejo de errores
  const ProductImage = ({
    src,
    alt = 'Producto',
    className = "w-full h-full object-cover rounded-lg",
    showError = true,
    isPersonalized = false
  }) => {
    // Estados para manejo de imagen
    const [imageSrc, setImageSrc] = useState(null);
    // Estado para controlar errores de carga
    const [hasError, setHasError] = useState(false);
    // Estado para controlar carga de imagen
    const [isLoading, setIsLoading] = useState(true);

    // Función para extraer URL de imagen de diferentes formatos
    const extractImageUrl = (source) => {
      // Log del tipo y contenido de la fuente
      console.log('Extrayendo URL de:', typeof source, source);

      // Verificar si la fuente es null o undefined
      if (!source) {
        console.log('Fuente es null/undefined');
        return null;
      }

      // Verificar si la fuente es un string directo
      if (typeof source === 'string') {
        console.log('Fuente es string:', source);
        // Retornar string limpio de espacios
        return source.trim();
      }

      // Verificar si la fuente es un objeto
      if (typeof source === 'object' && source !== null) {
        console.log('Fuente es objeto, buscando URL...');
        // Buscar URL en diferentes propiedades del objeto
        const url = source.image ||
          source.url ||
          source.src ||
          source.path ||
          source.href;

        // Log de URL extraída del objeto
        console.log('URL extraída del objeto:', url);
        return url;
      }

      // Log para tipo no reconocido
      console.log('Tipo de fuente no reconocido:', typeof source);
      return null;
    };

    // Función para validar si src es válido
    const isValidImageSrc = (source) => {
      // Extraer URL de la fuente
      const extractedUrl = extractImageUrl(source);

      // Verificar que la URL extraída sea válida
      if (!extractedUrl || typeof extractedUrl !== 'string') {
        console.log('URL extraída inválida:', extractedUrl);
        return false;
      }

      // Limpiar espacios de la URL
      const trimmed = extractedUrl.trim();
      // Verificar que la URL no esté vacía o contenga valores nulos
      if (!trimmed ||
        trimmed === 'null' ||
        trimmed === 'undefined' ||
        trimmed.toLowerCase() === 'none') {
        console.log('URL vacía o nula:', extractedUrl);
        return false;
      }

      // Verificar que sea una URL válida usando constructor URL
      try {
        new URL(trimmed);
        console.log('URL válida:', trimmed);
        // Retornar la URL válida
        return trimmed;
      } catch {
        // Log para URL inválida
        console.log('URL inválida:', extractedUrl);
        return false;
      }
    };

    // Función para precargar imagen y verificar que existe
    const preloadImage = (url) => {
      // Retornar promesa para carga de imagen
      return new Promise((resolve, reject) => {
        // Crear elemento imagen
        const img = new Image();
        // Manejar carga exitosa
        img.onload = () => resolve(url);
        // Manejar error de carga
        img.onerror = () => reject(new Error('Failed to load image'));
        // Establecer fuente de la imagen
        img.src = url;
      });
    };

    // Effect para cargar imagen cuando cambia src
    useEffect(() => {
      // Función asíncrona para cargar imagen
      const loadImage = async () => {
        // Activar estado de carga
        setIsLoading(true);
        setHasError(false);

        // Log del inicio de carga de imagen
        console.log('=== CARGANDO IMAGEN ===');
        console.log('Prop src recibida:', typeof src, src);

        // Validar y extraer URL
        const validUrl = isValidImageSrc(src);
        // Verificar si la URL es válida
        if (!validUrl) {
          console.log('URL no válida, mostrando placeholder');
          // Establecer error y limpiar imagen
          setHasError(true);
          setImageSrc(null);
          setIsLoading(false);
          return;
        }

        try {
          // Intentar precargar la imagen
          console.log('Intentando precargar:', validUrl);
          // Esperar a que la imagen se precargue
          await preloadImage(validUrl);
          // Establecer imagen válida en el estado
          setImageSrc(validUrl);
          setHasError(false);
          console.log('Imagen precargada exitosamente');
        } catch (error) {
          // Log de error al cargar imagen
          console.warn('Error al cargar imagen:', validUrl, error);
          // Establecer error en el estado
          setHasError(true);
          setImageSrc(null);
        } finally {
          // Desactivar estado de carga
          setIsLoading(false);
        }
      };

      // Ejecutar función de carga
      loadImage();
    }, [src]);

    // Función para manejar error de carga de imagen
    const handleError = (e) => {
      // Log de error en img.onError
      console.warn('Error en img.onError:', src);
      // Establecer error en el estado
      setHasError(true);
      setImageSrc(null);
    };

    // Función para manejar carga exitosa de imagen
    const handleLoad = () => {
      // Log de imagen cargada exitosamente
      console.log('Imagen cargada exitosamente:', src);
      // Limpiar error en el estado
      setHasError(false);
    };

    // Renderizar estado de carga
    if (isLoading) {
      return (
        <div className={`${className} bg-gray-200 flex items-center justify-center animate-pulse`}>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
      );
    }

    // Renderizar estado de error
    if (hasError || !imageSrc) {
      // Verificar si es producto personalizado para mostrar placeholder específico
      if (isPersonalized) {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px dashed #dee2e6',
            borderRadius: '4px',
            color: '#6c757d',
            fontSize: '12px',
            textAlign: 'center',
            padding: '8px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎨</div>
            <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
              Producto{'\n'}Personalizado
            </div>
          </div>
        );
      }

      // Placeholder para productos normales
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

    // Renderizar imagen válida
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

  // Renderizar estado de carga
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

  // Renderizar estado de error
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

  // Obtener configuración de pasos según estado del tracking
  const steps = getSteps(orderData.trackingStatus);
  // Obtener estilos de color según estado
  const statusStyle = getStatusColor(orderData.trackingStatus);
  // Calcular porcentaje de progreso según estado
  const progressPercentage = orderData.trackingStatus === 'Agendado' ? 33 :
    orderData.trackingStatus === 'En proceso' ? 66 :
      orderData.trackingStatus === 'Entregado' ? 100 : 33;

  // Determinar si mostrar botón de cancelación
  const showCancelButton = cancellationInfo?.isCancellable &&
    orderData.trackingStatus !== 'Entregado' &&
    orderData.trackingStatus !== 'Cancelado';

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Cancelar pedido"
        message="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
        remainingHours={cancellationInfo?.remainingHours}
        isLoading={cancelLoading}
      />

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

            {/* Mostrar botón de cancelación si es elegible */}
            {showCancelButton && (
              <div className="flex flex-col items-end">
                <button
                  className="px-2 sm:px-4 py-2 text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#E8ACD2', cursor: 'pointer' }}
                  onClick={handleCancelOrderClick}
                  disabled={cancelLoading}
                >
                  Cancelar pedido
                </button>
                {/* Mostrar tiempo restante para cancelación */}
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
          {/* Columna izquierda - Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sección de Estado del Pedido */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Estado del Pedido
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Fecha estimada de entrega: {formatDate(orderData.deliveryDate)}
              </p>

              {/* Barra de progreso del pedido */}
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

                {/* Pasos del tracking */}
                <div className="flex items-center justify-between mb-4">
                  {steps.map((step, index) => {
                    // Obtener componente de icono para el paso
                    const IconComponent = step.icon;
                    return (
                      <div key={step.id} className="flex flex-col items-center relative">
                        {/* Círculo del paso con icono */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${step.completed || step.current ? 'text-white' : 'bg-gray-400 text-gray-500'
                            }`}
                          style={{
                            backgroundColor: step.completed || step.current ? '#E8ACD2' : ''
                          }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {/* Etiqueta del paso */}
                        <span className={`mt-2 text-sm font-medium ${step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Información de cancelación */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Cancelable hasta: {getCancellableDate(orderData.createdAt)}</span>
                {/* Mostrar mensaje si ya no es cancelable */}
                {cancellationInfo && !cancellationInfo.isCancellable && (
                  <span className="text-red-500">Período de cancelación expirado</span>
                )}
              </div>
            </div>

            {/* Sección de Ubicación en tiempo real con React Leaflet */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Ubicación en tiempo real
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Sigue la ubicación de tu pedido en el mapa
              </p>

              {/* Contenedor del mapa interactivo */}
              <div className="rounded-lg h-64 overflow-hidden relative">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  {/* Capa de tiles del mapa */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Marcador de ubicación de entrega */}
                  <Marker position={mapCenter} icon={deliveryIcon}>
                    <Popup>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 mb-1">
                          Dirección de entrega
                        </div>
                        <div className="text-sm text-gray-600">
                          {orderData.deliveryAddress || 'San Salvador, El Salvador'}
                        </div>
                        {/* Mostrar punto de referencia si existe */}
                        {orderData.deliveryPoint && (
                          <div className="text-xs text-gray-500 mt-1">
                            Punto de referencia: {orderData.deliveryPoint}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>

                {/* Overlay con información del estado sobre el mapa */}
                <div className="absolute bottom-4 left-4 right-4 bg-gray-800 text-white p-3 rounded-lg bg-opacity-90 backdrop-blur-sm">
                  <p className="text-sm font-medium">
                    {/* Mensaje dinámico según estado del tracking */}
                    {orderData.trackingStatus === 'Entregado' ? 'Tu pedido ha sido entregado' :
                      orderData.trackingStatus === 'En proceso' ? 'Tu pedido está en proceso' :
                        orderData.trackingStatus === 'Cancelado' ? 'Tu pedido fue cancelado' :
                          'Tu pedido está siendo preparado'}
                  </p>
                  <p className="text-xs text-gray-300">
                    {/* Información adicional según estado */}
                    {orderData.trackingStatus === 'En proceso' ? 'Llegará en aproximadamente 25 minutos' :
                      orderData.trackingStatus === 'Agendado' ? 'Será enviado pronto' :
                        orderData.trackingStatus === 'Cancelado' ? 'Pedido cancelado' :
                          'Pedido completado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de Productos con diseño original y funcionalidad de personalización */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Productos
              </h2>

              <div className="space-y-4">
                {/* Verificar si existen productos para mostrar */}
                {productsData && productsData.length > 0 ? (
                  // Mapear cada producto en la lista
                  productsData.map((item, index) => {
                    // Detectar si es un producto personalizado
                    const isPersonalized = item.collection === 'CustomProducts' ||
                      (item.isPersonalized && item.collection !== 'Products') ||
                      item.type === 'personalizado' ||
                      item.customized === true ||
                      item.itemType === 'custom' ||
                      (item.referenceImage && !item.image) ||
                      (item.productToPersonalize) ||
                      (item.extraComments && item.totalPrice);

                    return (
                      <div key={index} className="flex items-center space-x-4">
                        {/* Imagen del producto con componente ProductImage */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ProductImage
                            src={item.referenceImage || item.image}
                            alt={item.name || 'Producto'}
                            className="w-full h-full object-cover rounded-lg"
                            isPersonalized={isPersonalized}
                            showError={true}
                          />
                        </div>
                        
                        {/* Información del producto con diseño original exacto */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.name || item.productToPersonalize || 'Producto sin nombre'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.description || item.extraComments || 'Sin descripción'}
                          </p>
                          {/* Mostrar cantidad si existe */}
                          {item.quantity && (
                            <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                          )}
                          {/* Mostrar detalles de personalización si es producto personalizado */}
                          {isPersonalized && item.extraComments && (
                            <div className="mt-2 text-xs text-purple-600">
                              <p>Detalles de personalización:</p>
                              <p className="text-gray-600 ml-2">{item.extraComments}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Precio del producto con diseño original */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.subtotal?.toFixed(2) || 
                               item.price?.toFixed(2) || 
                               item.totalPrice?.toFixed(2) || 
                               '0.00')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Mostrar mensaje cuando no hay productos
                  <div className="text-center py-4">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron productos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sección de Estado */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Estado</h2>
                {/* Badge de estado con colores dinámicos */}
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
                {/* Total del pedido */}
                <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      ${orderData.shoppingCart?.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de cancelación si existe */}
              {cancellationInfo && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Información de cancelación:</p>
                    <div className="space-y-1">
                      <p>Estado: <span className={cancellationInfo.isCancellable ? 'text-green-600' : 'text-red-600'}>
                        {cancellationInfo.isCancellable ? 'Cancelable' : 'No cancelable'}
                      </span></p>
                      {/* Mostrar tiempo restante si es cancelable */}
                      {cancellationInfo.isCancellable && cancellationInfo.remainingHours > 0 && (
                        <p>Tiempo restante: <span className="text-orange-600">{cancellationInfo.remainingHours} horas</span></p>
                      )}
                      <p>Límite: {formatDate(cancellationInfo.cancellableUntil)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección de Información de envío */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de envío
              </h2>

              <div className="space-y-4">
                {/* Ubicación de entrega */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación de entrega</p>
                    <p className="text-sm text-gray-500">
                      {orderData.deliveryAddress || 'Dirección no disponible'}
                    </p>
                    {/* Mostrar punto de referencia si existe */}
                    {orderData.deliveryPoint && (
                      <p className="text-sm text-gray-500 mt-1">
                        Punto de referencia: {orderData.deliveryPoint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fecha de entrega estimada */}
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

            {/* Sección de Información de contacto */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de contacto
              </h2>

              <div className="space-y-3">
                {/* Información del contacto */}
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
                    {/* Mostrar dirección registrada si existe */}
                    {customerData?.address && (
                      <p className="text-sm text-gray-500">
                        Dirección registrada: {customerData.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Información del pedido */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información del pedido
              </h2>

              <div className="space-y-3">
                {/* ID del pedido */}
                <div className="flex justify-between"></div>
                {/* Fecha de creación */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de creación:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(orderData.createdAt)}
                  </span>
                </div>
                {/* Método de pago */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Método de pago:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {orderData.paymentType || 'No especificado'}
                  </span>
                </div>
                {/* Última actualización */}
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

// Exportar componente como default
export default OrderDetail;
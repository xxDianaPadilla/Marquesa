import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import backIcon from '../images/backIcon.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Componente de mapa GRATUITO usando OpenStreetMap con Leaflet
const OpenStreetMapView = ({ mapRegion, markerCoordinate, orderData }) => {
  const [mapError, setMapError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // HTML con Leaflet (OpenStreetMap - 100% GRATIS)
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        body, html { height: 100%; width: 100%; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          // Inicializar mapa con coordenadas
          const map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true,
            tap: true
          }).setView([${markerCoordinate.latitude}, ${markerCoordinate.longitude}], 15);

          // Usar OpenStreetMap (GRATIS)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Agregar marcador personalizado
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #E8ACD2; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);"></div></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          });

          // Crear marcador
          const marker = L.marker([${markerCoordinate.latitude}, ${markerCoordinate.longitude}], {
            icon: customIcon
          }).addTo(map);

          // Agregar popup con información
          marker.bindPopup(\`
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <strong style="color: #E8ACD2; font-size: 14px;">📍 Dirección de entrega</strong><br/>
              <span style="font-size: 12px; color: #666; margin-top: 5px; display: block;">${orderData.deliveryAddress || 'Dirección no disponible'}</span>
            </div>
          \`).openPopup();

          // Ajustar vista después de cargar
          setTimeout(() => {
            map.invalidateSize();
          }, 100);

          // Notificar que el mapa cargó exitosamente
          window.ReactNativeWebView?.postMessage('MAP_LOADED');
        } catch (error) {
          console.error('Error inicializando mapa:', error);
          window.ReactNativeWebView?.postMessage('MAP_ERROR');
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    if (event.nativeEvent.data === 'MAP_LOADED') {
      setMapLoading(false);
      setMapError(false);
    } else if (event.nativeEvent.data === 'MAP_ERROR') {
      setMapLoading(false);
      setMapError(true);
    }
  };

  const handleError = () => {
    console.error('Error cargando WebView del mapa');
    setMapLoading(false);
    setMapError(true);
  };

  const handleLoadEnd = () => {
    // Timeout de seguridad por si no llega el mensaje
    setTimeout(() => {
      if (mapLoading) {
        setMapLoading(false);
      }
    }, 3000);
  };

  if (mapError) {
    return (
      <View style={styles.mapContainer}>
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorIcon}>📍</Text>
          <Text style={styles.mapErrorText}>No se pudo cargar el mapa</Text>
          <Text style={styles.mapErrorSubtext}>
            {orderData.deliveryAddress || 'Dirección no disponible'}
          </Text>
          <TouchableOpacity 
            style={styles.openExternalMapButton}
            onPress={() => {
              const encodedAddress = encodeURIComponent(
                `${orderData.deliveryAddress}, San Salvador, El Salvador`
              );
              const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
              Linking.openURL(url).catch(err => 
                console.error('Error abriendo mapa externo:', err)
              );
            }}
          >
            <Text style={styles.openExternalMapButtonText}>Abrir en Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      {mapLoading && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="small" color="#E8ACD2" />
          <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
        </View>
      )}
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        style={styles.map}
        onMessage={handleMessage}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Estados para manejo de datos
  const [orderData, setOrderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados específicos para el mapa con valores seguros por defecto
  const [mapRegion, setMapRegion] = useState({
    latitude: 13.692940, // San Salvador por defecto
    longitude: -89.218191,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 13.692940,
    longitude: -89.218191,
  });

  // Estados para carga de productos
  const [productsLoading, setProductsLoading] = useState(false);

  // Obtener datos del pedido de los parámetros de navegación
  const { orderId } = route.params || {};

  // Función para geocodificar dirección usando Nominatim con manejo robusto de errores
  const geocodeAddress = async (address) => {
    // Coordenadas por defecto para San Salvador
    const defaultCoords = { latitude: 13.692940, longitude: -89.218191 };

    try {
      if (!address || typeof address !== 'string' || address.trim() === '') {
        console.log('Dirección vacía, usando coordenadas por defecto');
        return defaultCoords;
      }

      const encodedAddress = encodeURIComponent(`${address}, San Salvador, El Salvador`);
      
      // Crear promesa con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=sv`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'MarquesaApp/1.0.0'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Respuesta no exitosa de geocodificación:', response.status);
        return defaultCoords;
      }

      const data = await response.json();

      if (data && Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Validar que las coordenadas sean números válidos
        if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
          console.log('Geocodificación exitosa:', { lat, lon, address });
          return { latitude: lat, longitude: lon };
        }
      }

      console.log('No se encontraron coordenadas válidas para:', address);
      return defaultCoords;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Timeout en geocodificación:', address);
      } else {
        console.error('Error en geocodificación:', error);
      }
      return defaultCoords;
    }
  };

  // Función mejorada para obtener datos de productos
  const getProductsFromOrder = async (order) => {
    try {
      setProductsLoading(true);
      console.log('=== Obteniendo productos del pedido ===');
      
      if (!order || !order.shoppingCart || !order.shoppingCart.items) {
        console.warn('No hay items en el carrito del pedido');
        setProductsData([]);
        return;
      }

      const items = order.shoppingCart.items;
      console.log(`Procesando ${items.length} items del carrito...`);

      // Procesar items directamente del carrito
      const processedProducts = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`Procesando item ${i + 1}:`, {
          itemType: item.itemType,
          hasItemId: !!item.itemId,
          quantity: item.quantity
        });

        try {
          let productData = null;

          // Si el item tiene itemId como objeto (producto poblado)
          if (item.itemId && typeof item.itemId === 'object') {
            console.log('Item con datos poblados encontrado');
            productData = {
              ...item.itemId,
              quantity: item.quantity || 1,
              subtotal: item.subtotal || (item.itemId.price * (item.quantity || 1))
            };
          } 
          // Si el item tiene itemId como string (necesita fetch)
          else if (item.itemId && typeof item.itemId === 'string') {
            console.log('Item con ID string, obteniendo datos...');
            
            let apiUrl = '';
            if (item.itemType === 'product') {
              apiUrl = `https://marquesa.onrender.com/api/products/${item.itemId}`;
            } else if (item.itemType === 'custom') {
              apiUrl = `https://marquesa.onrender.com/api/customproducts/${item.itemId}`;
            }

            if (apiUrl) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(apiUrl, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                  signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                  const result = await response.json();
                  if (result.data) {
                    productData = {
                      ...result.data,
                      quantity: item.quantity || 1,
                      subtotal: item.subtotal || (result.data.price * (item.quantity || 1))
                    };
                  }
                }
              } catch (fetchError) {
                console.warn(`Error obteniendo producto ${item.itemId}:`, fetchError);
              }
            }
          }

          // Si no se pudo obtener datos específicos, usar datos básicos del item
          if (!productData) {
            console.log('Usando datos básicos del item');
            productData = {
              _id: item.itemId || `item-${i}`,
              name: item.name || 'Producto sin nombre',
              description: item.description || 'Sin descripción',
              price: item.price || 0,
              quantity: item.quantity || 1,
              subtotal: item.subtotal || 0,
              itemType: item.itemType || 'product'
            };
          }

          // Asegurar que tenga la estructura correcta para mostrar
          const finalProduct = {
            _id: productData._id || productData.id || `product-${i}`,
            name: productData.name || productData.productToPersonalize || 'Producto sin nombre',
            description: productData.description || productData.extraComments || 'Sin descripción',
            price: productData.price || productData.totalPrice || 0,
            quantity: productData.quantity || 1,
            subtotal: productData.subtotal || (productData.price * productData.quantity) || 0,
            itemType: productData.itemType || item.itemType || 'product',
            
            // Manejo de imágenes
            image: productData.images?.[0]?.image || 
                   productData.images?.[0] || 
                   productData.image || 
                   productData.referenceImage || 
                   null,
                   
            // Datos adicionales para productos personalizados
            extraComments: productData.extraComments,
            referenceImage: productData.referenceImage,
            productToPersonalize: productData.productToPersonalize
          };

          processedProducts.push(finalProduct);
          console.log(`Producto ${i + 1} procesado:`, finalProduct.name);

        } catch (itemError) {
          console.error(`Error procesando item ${i + 1}:`, itemError);
          
          // Agregar producto con error pero datos básicos
          processedProducts.push({
            _id: `error-item-${i}`,
            name: 'Error al cargar producto',
            description: 'No se pudo cargar la información',
            price: 0,
            quantity: item.quantity || 1,
            subtotal: 0,
            itemType: item.itemType || 'product',
            image: null
          });
        }
      }

      console.log(`✅ Productos procesados exitosamente: ${processedProducts.length}`);
      setProductsData(processedProducts);

    } catch (error) {
      console.error('Error general obteniendo productos:', error);
      setProductsData([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Función para obtener detalles del pedido con manejo robusto de errores
  const getOrderDetails = async (saleId) => {
    try {
      setLoading(true);
      setError(null);

      if (!saleId) {
        throw new Error('ID de pedido no válido');
      }

      // Crear timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/details`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data) {
          // Asegurar que los datos existan antes de setearlos
          if (data.data.order) {
            setOrderData(data.data.order);
            
            // Obtener productos del pedido
            await getProductsFromOrder(data.data.order);
          }
          if (data.data.customer) {
            setCustomerData(data.data.customer);
          }

          // Geocodificar la dirección de entrega de forma segura
          if (data.data.order && data.data.order.deliveryAddress) {
            try {
              const coordinates = await geocodeAddress(data.data.order.deliveryAddress);
              setMapRegion(prev => ({
                ...prev,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              }));
              setMarkerCoordinate(coordinates);
            } catch (geoError) {
              console.warn('Error en geocodificación, usando coordenadas por defecto:', geoError);
            }
          }

          // Obtener información de cancelación de forma segura
          try {
            await getCancellationEligibility(saleId);
          } catch (cancelError) {
            console.warn('Error obteniendo información de cancelación:', cancelError);
          }
        } else {
          setError('Datos del pedido no válidos');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      
      if (error.name === 'AbortError') {
        setError('La petición tardó demasiado tiempo. Verifica tu conexión.');
      } else {
        setError('Error al cargar los detalles del pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar elegibilidad de cancelación con manejo de errores
  const getCancellationEligibility = async (saleId) => {
    try {
      if (!saleId) {
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/cancellationEligibility`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data) {
          setCancellationInfo(data.data);
        }
      }
    } catch (error) {
      console.warn('Error al obtener información de cancelación:', error);
      // No mostrar error al usuario, es información opcional
    }
  };

  // Función para cancelar pedido con manejo robusto de errores
  const handleConfirmCancel = async () => {
    try {
      setCancelLoading(true);

      if (!orderData || !orderData._id) {
        Alert.alert('Error', 'Datos del pedido no válidos');
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${orderData._id}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        Alert.alert('Éxito', 'Pedido cancelado exitosamente');
        setOrderData(prev => prev ? {
          ...prev,
          status: 'Cancelado',
          trackingStatus: 'Cancelado'
        } : null);
        setCancellationInfo(prev => prev ? {
          ...prev,
          isCancellable: false,
          status: 'no_cancellable_status'
        } : null);
        setShowConfirmModal(false);
      } else {
        Alert.alert('Error', data.message || 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'La operación tardó demasiado tiempo');
      } else {
        Alert.alert('Error', 'Error al cancelar el pedido');
      }
    } finally {
      setCancelLoading(false);
    }
  };

  // Effect para cargar datos cuando se monta el componente con manejo seguro
  useEffect(() => {
    try {
      if (route.params && route.params.orderData) {
        // Si se pasan datos directamente desde navegación
        const { orderData: order, customerData: customer, productsData: products } = route.params;
        
        if (order) {
          setOrderData(order);
          // Obtener productos del pedido
          getProductsFromOrder(order);
        }
        if (customer) {
          setCustomerData(customer);
        }
        if (products && Array.isArray(products) && products.length > 0) {
          setProductsData(products);
        }

        // Geocodificar la dirección de entrega de forma segura
        if (order && order.deliveryAddress) {
          geocodeAddress(order.deliveryAddress)
            .then(coordinates => {
              setMapRegion(prev => ({
                ...prev,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
              }));
              setMarkerCoordinate(coordinates);
            })
            .catch(error => {
              console.warn('Error en geocodificación inicial:', error);
            });
        }

        if (order && order._id) {
          getCancellationEligibility(order._id).catch(error => {
            console.warn('Error obteniendo elegibilidad de cancelación:', error);
          });
        }
      } else if (orderId) {
        // Si solo se pasa el ID, cargar desde API
        getOrderDetails(orderId);
      } else {
        setError('No se encontraron datos del pedido');
      }
    } catch (error) {
      console.error('Error en useEffect de OrderDetailsScreen:', error);
      setError('Error al inicializar la pantalla');
    }
  }, [route.params, orderId]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', error);
      return 'N/A';
    }
  };

  // Función para obtener fecha límite de cancelación
  const getCancellableDate = (createdAt) => {
    try {
      if (!createdAt) return 'N/A';
      const date = new Date(createdAt);
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      date.setDate(date.getDate() + 5);
      return formatDate(date);
    } catch (error) {
      console.warn('Error calculando fecha de cancelación:', error);
      return 'N/A';
    }
  };

  // Función para obtener fecha de inicio de cancelación
  const getCancellationStartDate = (createdAt) => {
    try {
      if (!createdAt) return 'N/A';
      const date = new Date(createdAt);
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      date.setDate(date.getDate() + 2);
      return formatDate(date);
    } catch (error) {
      console.warn('Error calculando fecha de inicio de cancelación:', error);
      return 'N/A';
    }
  };

  // Función para determinar información del botón de cancelación
  const getCancelButtonInfo = () => {
    try {
      if (!cancellationInfo ||
        !orderData ||
        orderData.trackingStatus === 'Entregado' ||
        orderData.trackingStatus === 'Cancelado') {
        return { show: false, enabled: false, text: '', reason: '' };
      }

      switch (cancellationInfo.status) {
        case 'waiting_period':
          return {
            show: true,
            enabled: false,
            text: 'Disponible pronto',
            reason: `Podrás cancelar a partir del ${getCancellationStartDate(orderData.createdAt)} (faltan ${cancellationInfo.remainingHours || 0} horas)`
          };
        case 'cancellable':
          return {
            show: true,
            enabled: true,
            text: 'Cancelar pedido',
            reason: `Tienes ${cancellationInfo.remainingHours || 0} horas para cancelar`
          };
        case 'expired':
          return {
            show: true,
            enabled: false,
            text: 'Período expirado',
            reason: 'Ya no es posible cancelar este pedido'
          };
        default:
          return { show: false, enabled: false, text: '', reason: '' };
      }
    } catch (error) {
      console.warn('Error obteniendo información del botón de cancelar:', error);
      return { show: false, enabled: false, text: '', reason: '' };
    }
  };

  const getStatusSteps = () => {
    try {
      const status = orderData?.trackingStatus || 'Agendado';
      return {
        aprobado: true,
        enProceso: status === 'En proceso' || status === 'Entregado',
        entregado: status === 'Entregado'
      };
    } catch (error) {
      console.warn('Error obteniendo pasos de estado:', error);
      return { aprobado: true, enProceso: false, entregado: false };
    }
  };

  const getStatusColor = (status) => {
    try {
      switch (status) {
        case 'Agendado':
          return '#F59E0B';
        case 'En proceso':
          return '#3B82F6';
        case 'Entregado':
          return '#10B981';
        case 'Cancelado':
          return '#EF4444';
        default:
          return '#6B7280';
      }
    } catch (error) {
      console.warn('Error obteniendo color de estado:', error);
      return '#6B7280';
    }
  };

  // Función mejorada para extraer URL de imagen con manejo seguro
  const getImageUrl = (item) => {
    try {
      if (!item) return null;

      // Lista de posibles ubicaciones de imagen en orden de prioridad
      const imagePaths = [
        item.referenceImage,
        item.referenceImage?.image,
        item.image?.image,
        item.image,
        item.images?.[0]?.image,
        item.images?.[0],
        item.productImage,
        item.imageUrl,
      ];

      // Buscar la primera URL válida
      for (const path of imagePaths) {
        if (path && typeof path === 'string' && path.trim() !== '') {
          // Verificar que sea una URL válida
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Error extrayendo URL de imagen:', error);
      return null;
    }
  };

  // Función mejorada para detectar productos personalizados
  const isProductPersonalized = (item) => {
    try {
      if (!item) return false;

      return (
        item.collection === 'CustomProducts' ||
        (item.isPersonalized && item.collection !== 'Products') ||
        item.type === 'personalizado' ||
        item.customized === true ||
        item.itemType === 'custom' ||
        (item.productToPersonalize && item.extraComments) ||
        (item.extraComments && item.totalPrice) ||
        (item.referenceImage && !item.image) ||
        (item.name && (
          item.name.toLowerCase().includes('personalizado') ||
          item.name.toLowerCase().includes('personalizar') ||
          item.name.toLowerCase().includes('custom')
        ))
      );
    } catch (error) {
      console.warn('Error detectando producto personalizado:', error);
      return false;
    }
  };

  // Componente ProductImage con manejo seguro de errores
  const ProductImage = ({ src, style, item }) => {
    try {
      const isPersonalized = isProductPersonalized(item);

      // Si no hay URL válida
      if (!src || (typeof src !== 'string') ||
        (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:'))) {

        // Si es un producto personalizado, mostrar emoji de paleta
        if (isPersonalized) {
          return (
            <View style={[style, styles.personalizedPlaceholder]}>
              <Text style={styles.personalizedEmoji}>🎨</Text>
              <Text style={styles.personalizedText}>Personalizado</Text>
            </View>
          );
        }

        // Si no es personalizado, mostrar placeholder genérico
        return (
          <View style={[style, styles.productPlaceholder]}>
            <Text style={styles.productPlaceholderText}>📦</Text>
          </View>
        );
      }

      // Mostrar imagen directamente
      return (
        <Image
          source={{ uri: src }}
          style={style}
          resizeMode="cover"
          onError={(error) => {
            console.warn('Error renderizando imagen:', src, error);
          }}
        />
      );
    } catch (error) {
      console.warn('Error en ProductImage:', error);
      return (
        <View style={[style, styles.productPlaceholder]}>
          <Text style={styles.productPlaceholderText}>📦</Text>
        </View>
      );
    }
  };

  // Modal de confirmación con manejo seguro
  const ConfirmationModal = () => {
    try {
      const cancelButtonInfo = getCancelButtonInfo();
      
      return (
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !cancelLoading && setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>⚠️</Text>
                </View>
                <Text style={styles.modalTitle}>Cancelar pedido</Text>
              </View>

              <Text style={styles.modalMessage}>
                ¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.
              </Text>

              {cancellationInfo?.remainingHours > 0 && (
                <View style={styles.modalWarning}>
                  <Text style={styles.modalWarningIcon}>🕒</Text>
                  <View style={styles.modalWarningContent}>
                    <Text style={styles.modalWarningText}>
                      {cancellationInfo.remainingHours > 24 
                        ? `Tienes ${Math.ceil(cancellationInfo.remainingHours / 24)} días para cancelar este pedido`
                        : `Tienes ${cancellationInfo.remainingHours} horas para cancelar este pedido`
                      }
                    </Text>
                    <Text style={styles.modalWarningSubtext}>
                      Recuerda: Solo puedes cancelar pedidos entre el día 3 y 5 después de haberlos realizado.
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalKeepButton}
                  onPress={() => setShowConfirmModal(false)}
                  disabled={cancelLoading}
                >
                  <Text style={styles.modalKeepText}>Mantener pedido</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={handleConfirmCancel}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <View style={styles.modalLoadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.modalCancelText}>Cancelando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.modalCancelText}>Sí, cancelar pedido</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.modalFooter}>
                Esta acción no se puede deshacer una vez confirmada
              </Text>
            </View>
          </View>
        </Modal>
      );
    } catch (error) {
      console.error('Error en ConfirmationModal:', error);
      return null;
    }
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8ACD2" />
          <Text style={styles.loadingText}>Cargando detalles del pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar estado de error
  if (error || !orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>{error || 'No se encontraron datos del pedido'}</Text>
          <TouchableOpacity
            style={styles.backToProfileButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToProfileText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  try {
    const steps = getStatusSteps();
    const cancelButtonInfo = getCancelButtonInfo();

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <ConfirmationModal />

        {/* Header simplificado */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={backIcon} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              Detalles del pedido #{(orderData._id || '').slice(-6) || 'N/A'}
            </Text>
            <Text style={styles.headerDate}>
              Realizado el {formatDate(orderData.createdAt)}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentInsetAdjustmentBehavior="automatic"
        >

          {/* Botón de cancelación debajo del header */}
          {cancelButtonInfo.show && (
            <View style={styles.cancelSection}>
              <TouchableOpacity
                style={[
                  styles.cancelButtonFullWidth,
                  { 
                    backgroundColor: cancelButtonInfo.enabled ? '#E8ACD2' : '#9CA3AF',
                  }
                ]}
                onPress={cancelButtonInfo.enabled ? () => setShowConfirmModal(true) : undefined}
                disabled={!cancelButtonInfo.enabled || cancelLoading}
              >
                <View style={styles.cancelButtonContent}>
                  <Text style={[
                    styles.cancelButtonText,
                    { opacity: cancelButtonInfo.enabled ? 1 : 0.7 }
                  ]}>
                    {cancelButtonInfo.text}
                  </Text>
                  {cancelButtonInfo.enabled && cancellationInfo?.remainingHours && (
                    <View style={styles.cancelButtonBadge}>
                      <Text style={styles.cancelButtonBadgeText}>
                        {cancellationInfo.remainingHours > 24 
                          ? `${Math.ceil(cancellationInfo.remainingHours / 24)}d`
                          : `${cancellationInfo.remainingHours}h`
                        }
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              {cancelButtonInfo.reason && (
                <View style={styles.cancelReasonContainer}>
                  <Text style={styles.cancelReasonText}>
                    {cancelButtonInfo.reason}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Estado del Pedido */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estado del Pedido</Text>
            <Text style={styles.estimatedDate}>
              Fecha estimada de entrega: {formatDate(orderData.deliveryDate)}
            </Text>

            <View style={styles.progressContainer}>
              {/* Barra de progreso */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: steps.entregado ? '100%' : steps.enProceso ? '66%' : '33%' }
                    ]}
                  />
                </View>
              </View>

              {/* Estados */}
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusDot,
                    steps.aprobado ? styles.statusCompleted : styles.statusPending
                  ]} />
                  <Text style={styles.statusText}>Agendado</Text>
                </View>

                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusDot,
                    steps.enProceso ? styles.statusCompleted : styles.statusPending
                  ]} />
                  <Text style={styles.statusText}>En proceso</Text>
                </View>

                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusDot,
                    steps.entregado ? styles.statusCompleted : styles.statusPending
                  ]} />
                  <Text style={styles.statusText}>Entregado</Text>
                </View>
              </View>
            </View>

            {/* Información de cancelación */}
            <View style={styles.cancellationInfoContainer}>
              <Text style={styles.cancellableText}>
                {cancellationInfo?.status === 'waiting_period' 
                  ? `Cancelable a partir del: ${getCancellationStartDate(orderData.createdAt)}`
                  : cancellationInfo?.status === 'cancellable'
                  ? `Cancelable hasta: ${getCancellableDate(orderData.createdAt)}`
                  : `Período de cancelación: ${getCancellationStartDate(orderData.createdAt)} - ${getCancellableDate(orderData.createdAt)}`
                }
              </Text>
              
              {/* Mensaje según el estado */}
              {cancellationInfo && cancellationInfo.status === 'expired' && (
                <Text style={styles.expiredText}>Período de cancelación expirado</Text>
              )}
              {cancellationInfo && cancellationInfo.status === 'no_cancellable_status' && (
                <Text style={styles.notCancellableText}>No cancelable por estado actual</Text>
              )}
            </View>
          </View>

          {/* Información del pedido */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Información del pedido</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValue}>
                ${(orderData.shoppingCart?.total || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método de pago:</Text>
              <Text style={styles.infoValue}>
                {orderData.paymentType || 'No especificado'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de creación:</Text>
              <Text style={styles.infoValue}>
                {formatDate(orderData.createdAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última actualización:</Text>
              <Text style={styles.infoValue}>
                {formatDate(orderData.updatedAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(orderData.trackingStatus) + '20' }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(orderData.trackingStatus) }
                ]}>
                  {orderData.trackingStatus}
                </Text>
              </View>
            </View>

            {/* Información detallada de cancelación */}
            {cancellationInfo && (
              <View style={styles.detailedCancellationInfo}>
                <Text style={styles.detailedCancellationTitle}>Información de cancelación:</Text>
                <View style={styles.cancellationDetailRow}>
                  <Text style={styles.infoLabel}>Estado:</Text>
                  <Text style={[
                    styles.infoValue,
                    { 
                      color: cancellationInfo.status === 'cancellable' ? '#10B981' :
                             cancellationInfo.status === 'waiting_period' ? '#F59E0B' :
                             cancellationInfo.status === 'expired' ? '#EF4444' :
                             '#6B7280'
                    }
                  ]}>
                    {cancellationInfo.status === 'cancellable' ? 'Cancelable ahora' :
                     cancellationInfo.status === 'waiting_period' ? 'En período de espera' :
                     cancellationInfo.status === 'expired' ? 'Período expirado' :
                     'No cancelable'}
                  </Text>
                </View>

                {cancellationInfo.status === 'waiting_period' && cancellationInfo.remainingHours > 0 && (
                  <View style={styles.cancellationDetailRow}>
                    <Text style={styles.infoLabel}>Disponible en:</Text>
                    <Text style={[styles.infoValue, { color: '#F59E0B' }]}>
                      {cancellationInfo.remainingHours} horas
                    </Text>
                  </View>
                )}
                
                {cancellationInfo.status === 'cancellable' && cancellationInfo.remainingHours > 0 && (
                  <View style={styles.cancellationDetailRow}>
                    <Text style={styles.infoLabel}>Tiempo restante:</Text>
                    <Text style={[styles.infoValue, { color: '#10B981' }]}>
                      {cancellationInfo.remainingHours} horas
                    </Text>
                  </View>
                )}
                
                <View style={styles.cancellationDetailRow}>
                  <Text style={styles.infoLabel}>Días desde creación:</Text>
                  <Text style={styles.infoValue}>
                    {cancellationInfo.daysFromCreation || 0} días
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Mapa GRATUITO con OpenStreetMap */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ubicación de entrega</Text>
            <Text style={styles.subtitle}>Dirección de entrega</Text>

            <View style={styles.addressContainer}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {orderData.deliveryAddress || 'Dirección no disponible'}
                </Text>
                {orderData.deliveryPoint && (
                  <Text style={styles.referenceText}>
                    Punto de referencia: {orderData.deliveryPoint}
                  </Text>
                )}
              </View>
            </View>

            <OpenStreetMapView
              mapRegion={mapRegion}
              markerCoordinate={markerCoordinate}
              orderData={orderData}
            />

            <View style={styles.contactContainer}>
              <Text style={styles.contactIcon}>👤</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {customerData?.fullName || orderData.receiverName || 'Nombre no disponible'}
                </Text>
                <Text style={styles.contactPhone}>
                  {customerData?.phone || orderData.receiverPhone || 'Teléfono no disponible'}
                </Text>
              </View>
            </View>
          </View>

          {/* Historial de seguimiento */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Historial de seguimiento</Text>

            <View style={styles.trackingItem}>
              <View style={styles.trackingDot} />
              <View style={styles.trackingContent}>
                <Text style={styles.trackingTitle}>Pedido recibido</Text>
                <Text style={styles.trackingDate}>
                  Pedido el {formatDate(orderData.createdAt)}
                </Text>
              </View>
            </View>

            {steps.enProceso && (
              <View style={styles.trackingItem}>
                <View style={styles.trackingDot} />
                <View style={styles.trackingContent}>
                  <Text style={styles.trackingTitle}>Preparando pedido</Text>
                  <Text style={styles.trackingDate}>En progreso...</Text>
                </View>
              </View>
            )}

            {steps.entregado && (
              <View style={styles.trackingItem}>
                <View style={styles.trackingDot} />
                <View style={styles.trackingContent}>
                  <Text style={styles.trackingTitle}>Pedido entregado</Text>
                  <Text style={styles.trackingDate}>
                    {formatDate(orderData.updatedAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Productos mejorados */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Productos</Text>

            {productsLoading ? (
              <View style={styles.productsLoadingContainer}>
                <ActivityIndicator size="small" color="#E8ACD2" />
                <Text style={styles.productsLoadingText}>Cargando productos...</Text>
              </View>
            ) : productsData && productsData.length > 0 ? (
              productsData.map((item, index) => {
                const imageUrl = getImageUrl(item);

                return (
                  <View key={index} style={styles.productItem}>
                    <ProductImage
                      src={imageUrl}
                      style={styles.productImage}
                      item={item}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.name || item.productToPersonalize || 'Producto sin nombre'}
                      </Text>
                      <Text style={styles.productDescription}>
                        {item.description || item.extraComments || 'Sin descripción'}
                      </Text>
                      {item.quantity && (
                        <Text style={styles.productQuantity}>
                          Cantidad: {item.quantity}
                        </Text>
                      )}
                      {isProductPersonalized(item) && item.extraComments && (
                        <Text style={styles.personalizationText}>
                          Detalles de personalización: {item.extraComments}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.productPrice}>
                      ${(item.subtotal?.toFixed(2) ||
                        (item.price * item.quantity)?.toFixed(2) ||
                        item.price?.toFixed(2) ||
                        item.totalPrice?.toFixed(2) ||
                        '0.00')}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noProductsContainer}>
                <Text style={styles.noProductsIcon}>📦</Text>
                <Text style={styles.noProductsText}>No se encontraron productos</Text>
                <Text style={styles.noProductsSubtext}>
                  Los productos pueden no estar disponibles en este momento
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  } catch (renderError) {
    console.error('Error renderizando OrderDetailsScreen:', renderError);
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Error al mostrar los detalles del pedido</Text>
          <TouchableOpacity
            style={styles.backToProfileButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToProfileText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

// Continúa con los estilos en el siguiente mensaje...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    bottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  backToProfileButton: {
    backgroundColor: '#E8ACD2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    top: 40,
    minHeight: 60,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#374151',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Poppins-SemiBold',
  },
  headerDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  cancelSection: {
    marginBottom: 16,
  },
  cancelButtonFullWidth: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cancelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  cancelButtonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  cancelButtonBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  cancelReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  cancelReasonText: {
    flex: 1,
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  content: {
    flex: 1,
    top: 40,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  estimatedDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E8ACD2',
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusCompleted: {
    backgroundColor: '#E8ACD2',
  },
  statusPending: {
    backgroundColor: '#D1D5DB',
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  cancellationInfoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancellableText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  expiredText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Poppins-Regular',
  },
  notCancellableText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Poppins-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  detailedCancellationInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailedCancellationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  cancellationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#212529',
    fontFamily: 'Poppins-Regular',
  },
  referenceText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  // Estilos del mapa con WebView
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mapLoadingText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  mapErrorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapErrorText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
    textAlign: 'center',
  },
  mapErrorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  openExternalMapButton: {
    backgroundColor: '#E8ACD2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  openExternalMapButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    fontFamily: 'Poppins-Medium',
  },
  contactPhone: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingDot: {
    width: 8,
    height: 8,
    backgroundColor: '#E8ACD2',
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  trackingContent: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  trackingDate: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  // Estilos para productos
  productsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  productsLoadingText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  personalizedPlaceholder: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ACD2',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  personalizedEmoji: {
    fontSize: 16,
    color: '#E8ACD2',
  },
  personalizedText: {
    fontSize: 8,
    color: '#E8ACD2',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    textAlign: 'center',
  },
  productPlaceholder: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  productPlaceholderText: {
    fontSize: 16,
    color: '#6c757d',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  productDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  productQuantity: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  personalizationText: {
    fontSize: 11,
    color: '#8B5CF6',
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Poppins-SemiBold',
  },
  noProductsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noProductsIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noProductsText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  noProductsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIcon: {
    fontSize: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Poppins-SemiBold',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    fontFamily: 'Poppins-Regular',
  },
  modalWarning: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalWarningIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  modalWarningContent: {
    flex: 1,
  },
  modalWarningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  modalWarningSubtext: {
    fontSize: 11,
    color: '#92400E',
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 12,
  },
  modalKeepButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalKeepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    fontFamily: 'Poppins-Medium',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  modalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalFooter: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default OrderDetailsScreen;
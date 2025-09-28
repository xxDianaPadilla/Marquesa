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
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import backIcon from '../images/backIcon.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  // Estados específicos para el mapa
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

  // Obtener datos del pedido de los parámetros de navegación
  const { orderId } = route.params || {};

  // Función para geocodificar dirección usando Nominatim
  const geocodeAddress = async (address) => {
    try {
      if (!address || address.trim() === '') {
        console.log('Dirección vacía, usando coordenadas por defecto');
        return { latitude: 13.692940, longitude: -89.218191 };
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
        return { latitude: lat, longitude: lon };
      } else {
        console.log('No se encontraron coordenadas para:', address);
        return { latitude: 13.692940, longitude: -89.218191 };
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return { latitude: 13.692940, longitude: -89.218191 };
    }
  };

  // Función para obtener detalles del pedido
  const getOrderDetails = async (saleId) => {
    try {
      setLoading(true);

      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/details`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
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
            setMapRegion(prev => ({
              ...prev,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }));
            setMarkerCoordinate(coordinates);
          }

          // Obtener información de cancelación
          await getCancellationEligibility(saleId);
        } else {
          setError('Error al cargar los detalles del pedido');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error de conexión con el servidor');
      }
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      setError('Error al cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar elegibilidad de cancelación
  const getCancellationEligibility = async (saleId) => {
    try {
      const response = await fetch(`https://marquesa.onrender.com/api/sales/${saleId}/cancellationEligibility`, {
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

  // Función para cancelar pedido
  const handleConfirmCancel = async () => {
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
        Alert.alert('Éxito', 'Pedido cancelado exitosamente');
        setOrderData(prev => ({
          ...prev,
          status: 'Cancelado',
          trackingStatus: 'Cancelado'
        }));
        setCancellationInfo(prev => ({
          ...prev,
          isCancellable: false,
          status: 'no_cancellable_status'
        }));
        setShowConfirmModal(false);
      } else {
        Alert.alert('Error', data.message || 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      Alert.alert('Error', 'Error al cancelar el pedido');
    } finally {
      setCancelLoading(false);
    }
  };

  // Effect para cargar datos cuando se monta el componente
  useEffect(() => {
    if (route.params && route.params.orderData) {
      // Si se pasan datos directamente desde navegación
      const { orderData: order, customerData: customer, productsData: products } = route.params;
      setOrderData(order);
      setCustomerData(customer);
      setProductsData(products || []);

      // Geocodificar la dirección de entrega
      if (order.deliveryAddress) {
        geocodeAddress(order.deliveryAddress).then(coordinates => {
          setMapRegion(prev => ({
            ...prev,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }));
          setMarkerCoordinate(coordinates);
        });
      }

      if (order._id) {
        getCancellationEligibility(order._id);
      }
    } else if (orderId) {
      // Si solo se pasa el ID, cargar desde API
      getOrderDetails(orderId);
    } else {
      setError('No se encontraron datos del pedido');
    }
  }, [route.params, orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // NUEVA FUNCIÓN: Obtener fecha límite de cancelación (cambio de 3 a 5 días)
  const getCancellableDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5); // Cambiar de 3 a 5 días como en la web
    return formatDate(date);
  };

  // NUEVA FUNCIÓN: Obtener fecha de inicio de cancelación
  const getCancellationStartDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 2); // 2 días de espera
    return formatDate(date);
  };

  // NUEVA FUNCIÓN: Determinar información del botón de cancelación
  const getCancelButtonInfo = () => {
    if (!cancellationInfo ||
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
          reason: `Podrás cancelar a partir del ${getCancellationStartDate(orderData.createdAt)} (faltan ${cancellationInfo.remainingHours} horas)`
        };
      case 'cancellable':
        return {
          show: true,
          enabled: true,
          text: 'Cancelar pedido',
          reason: `Tienes ${cancellationInfo.remainingHours} horas para cancelar`
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
  };

  const getStatusSteps = () => {
    const status = orderData?.trackingStatus || 'Agendado';
    return {
      aprobado: true,
      enProceso: status === 'En proceso' || status === 'Entregado',
      entregado: status === 'Entregado'
    };
  };

  const getStatusColor = (status) => {
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
  };

  // Función mejorada para extraer URL de imagen basada en la lógica web
  const getImageUrl = (item) => {
    console.log('=== Analizando item completo ===', JSON.stringify(item, null, 2));

    // Lista de posibles ubicaciones de imagen en orden de prioridad
    const imagePaths = [
      // Caso 1: referenceImage como string
      item.referenceImage,

      // Caso 2: referenceImage como objeto con image
      item.referenceImage?.image,

      // Caso 3: image como objeto anidado (tu estructura actual)
      item.image?.image,

      // Caso 4: image como string directo
      item.image,

      // Caso 5: images array, primer elemento con image
      item.images?.[0]?.image,

      // Caso 6: images array, primer elemento como string
      item.images?.[0],

      // Caso 7: productImage (por si acaso)
      item.productImage,

      // Caso 8: imageUrl (alternativo)
      item.imageUrl,
    ];

    // Buscar la primera URL válida
    for (const path of imagePaths) {
      if (path && typeof path === 'string' && path.trim() !== '') {
        // Verificar que sea una URL válida
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
          console.log('✅ URL encontrada:', path);
          return path;
        }
      }
    }

    console.log('❌ No se encontró URL válida');
    return null;
  };

  // Función mejorada para detectar productos personalizados basada en la lógica web
  const isProductPersonalized = (item) => {
    console.log('Detectando personalización para:', item.name || 'Sin nombre');

    // Lógica de detección basada en tu aplicación web
    const isPersonalized =
      // Por colección
      item.collection === 'CustomProducts' ||

      // Por flags específicos
      (item.isPersonalized && item.collection !== 'Products') ||
      item.type === 'personalizado' ||
      item.customized === true ||
      item.itemType === 'custom' ||

      // Por presencia de campos específicos de personalización
      (item.productToPersonalize && item.extraComments) ||
      (item.extraComments && item.totalPrice) ||

      // Por estructura de datos específica de productos personalizados
      (item.referenceImage && !item.image) ||

      // Detección por nombres específicos que indican personalización
      (item.name && (
        item.name.toLowerCase().includes('personalizado') ||
        item.name.toLowerCase().includes('personalizar') ||
        item.name.toLowerCase().includes('custom')
      ));

    console.log('¿Es personalizado?', isPersonalized);
    return isPersonalized;
  };

  // Componente ProductImage con lógica mejorada basada en la aplicación web
  const ProductImage = ({ src, style, item }) => {
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

      // Si no es personalizado, espacio transparente
      return <View style={[style, { backgroundColor: 'transparent' }]} />;
    }

    // Mostrar imagen directamente
    return (
      <Image
        source={{ uri: src }}
        style={style}
        resizeMode="cover"
        onError={() => {
          console.log('❌ Error renderizando imagen:', src);
        }}
        onLoad={() => {
          console.log('✅ Imagen cargada exitosamente:', src);
        }}
      />
    );
  };

  // Modal de confirmación MEJORADO con lógica de la web
  const ConfirmationModal = () => {
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
            Detalles del pedido #{orderData._id?.slice(-6) || 'N/A'}
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
                {cancelButtonInfo.enabled && (
                  <View style={styles.cancelButtonBadge}>
                    <Text style={styles.cancelButtonBadgeText}>
                      {cancellationInfo?.remainingHours > 24 
                        ? `${Math.ceil(cancellationInfo.remainingHours / 24)}d`
                        : `${cancellationInfo?.remainingHours}h`
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

        {/* Estado del Pedido MEJORADO */}
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

          {/* Información de cancelación ACTUALIZADA */}
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

        {/* Información del pedido MEJORADA */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información del pedido</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.infoValue}>
              ${orderData.shoppingCart?.total?.toFixed(2) || '0.00'}
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

        {/* Resto del contenido permanece igual... */}
        {/* Mapa */}
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

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={mapRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker
                coordinate={markerCoordinate}
                title="Dirección de entrega"
                description={orderData.deliveryAddress}
                pinColor="#E8ACD2"
              />
            </MapView>
          </View>

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

        {/* Productos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>

          {productsData && productsData.length > 0 ? (
            productsData.map((item, index) => {
              console.log(`=== PRODUCTO ${index} ===`);
              console.log('Item completo:', JSON.stringify(item, null, 2));

              const imageUrl = getImageUrl(item);
              console.log('URL final extraída:', imageUrl);

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
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

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
  // Estilos para la sección de cancelación
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
  cancelReasonIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
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
    paddingBottom: 40, // Reducido significativamente
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
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  map: {
    width: '100%',
    height: '100%',
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
  },
  // Estilos del Modal MEJORADOS
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
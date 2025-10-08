// OrderDetailsScreen.js - Versión simplificada para evitar crashes en APK
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import backIcon from '../images/backIcon.png';

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Estados simplificados
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función de inicialización simplificada y segura
  const initializeOrderData = () => {
    try {
      console.log('=== Inicializando OrderDetailsScreen ===');
      console.log('Route params:', JSON.stringify(route.params, null, 2));

      // Caso 1: Datos completos desde navegación
      if (route.params?.orderData) {
        console.log('✅ Usando datos desde navegación');
        setOrderData(route.params.orderData);
        return;
      }

      // Caso 2: Solo orderId disponible - crear datos básicos
      if (route.params?.orderId) {
        console.log('⚠️ Solo orderId disponible, creando datos básicos');
        setOrderData({
          _id: route.params.orderId,
          createdAt: new Date().toISOString(),
          trackingStatus: 'Agendado',
          status: 'Activo',
          shoppingCart: { total: 0, items: [] },
          deliveryAddress: 'Información no disponible',
          receiverName: 'No especificado',
          paymentType: 'No especificado'
        });
        return;
      }

      // Caso 3: Sin datos válidos
      throw new Error('No se encontraron datos del pedido');

    } catch (error) {
      console.error('❌ Error inicializando OrderDetailsScreen:', error);
      setError(error.message);
    }
  };

  // Effect simplificado
  useEffect(() => {
    initializeOrderData();
  }, []); // Sin dependencias para evitar re-renders

  // Funciones de utilidad simplificadas
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Agendado': '#F59E0B',
      'En proceso': '#3B82F6',
      'Entregado': '#10B981',
      'Cancelado': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusSteps = () => {
    const status = orderData?.trackingStatus || 'Agendado';
    return {
      aprobado: true,
      enProceso: status === 'En proceso' || status === 'Entregado',
      entregado: status === 'Entregado'
    };
  };

  // Renderizado de carga
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8ACD2" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado de error
  if (error || !orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || 'Error al cargar el pedido'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = getStatusSteps();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header simplificado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Pedido #{orderData._id?.slice(-6) || 'N/A'}
          </Text>
          <Text style={styles.headerDate}>
            Realizado el {formatDate(orderData.createdAt)}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Estado del Pedido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado del Pedido</Text>
          
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(orderData.trackingStatus) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(orderData.trackingStatus) }
            ]}>
              {orderData.trackingStatus || 'Estado desconocido'}
            </Text>
          </View>

          {/* Progreso simplificado */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: steps.entregado ? '100%' : steps.enProceso ? '66%' : '33%' }
                ]}
              />
            </View>

            <View style={styles.statusSteps}>
              <Text style={[styles.stepText, steps.aprobado && styles.stepActive]}>
                Agendado
              </Text>
              <Text style={[styles.stepText, steps.enProceso && styles.stepActive]}>
                En proceso
              </Text>
              <Text style={[styles.stepText, steps.entregado && styles.stepActive]}>
                Entregado
              </Text>
            </View>
          </View>
        </View>

        {/* Información del Pedido */}
        <View style={styles.card}>
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
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>
              {formatDate(orderData.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[
              styles.infoValue,
              { color: getStatusColor(orderData.trackingStatus) }
            ]}>
              {orderData.trackingStatus || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Información de Entrega */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de entrega</Text>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryIcon}>📍</Text>
            <Text style={styles.deliveryText}>
              {orderData.deliveryAddress || 'Dirección no disponible'}
            </Text>
          </View>

          {orderData.receiverName && (
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryIcon}>👤</Text>
              <Text style={styles.deliveryText}>
                {orderData.receiverName}
              </Text>
            </View>
          )}

          {orderData.receiverPhone && (
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryIcon}>📞</Text>
              <Text style={styles.deliveryText}>
                {orderData.receiverPhone}
              </Text>
            </View>
          )}
        </View>

        {/* Productos simplificado */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>
          
          {orderData.shoppingCart?.items?.length > 0 ? (
            <View>
              <Text style={styles.productCount}>
                {orderData.shoppingCart.items.length} producto(s) en este pedido
              </Text>
              <Text style={styles.productNote}>
                Los detalles específicos de productos se cargarán próximamente
              </Text>
            </View>
          ) : (
            <Text style={styles.noProducts}>
              No se encontró información de productos
            </Text>
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
  },
  backButton: {
    backgroundColor: '#E8ACD2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginTop: 40,
  },
  headerBackButton: {
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
  },
  headerDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E8ACD2',
    borderRadius: 2,
  },
  statusSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    fontSize: 12,
    color: '#6c757d',
  },
  stepActive: {
    color: '#E8ACD2',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  productCount: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 8,
  },
  productNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  noProducts: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default OrderDetailsScreen;
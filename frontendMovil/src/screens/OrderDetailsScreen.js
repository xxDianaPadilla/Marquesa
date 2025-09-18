import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import backIcon from '../images/backIcon.png';

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Obtener los datos del pedido pasados desde OrdersScreen
  const { orderData, customerData, productsData } = route.params || {};
  
  // Datos por defecto en caso de que no se pasen parámetros
  const order = orderData || {
    _id: '1234',
    formattedDate: '06/05/2025',
    status: 'Pagado',
    trackingStatusLabel: 'En proceso',
    deliveryDate: '2025-05-09T00:00:00.000Z',
    cancellableUntil: '2025-05-04T00:00:00.000Z'
  };

  const products = productsData || [
    {
      name: 'Ramo de flores secas lavanda',
      price: 10.00,
      quantity: 1,
      image: { image: 'https://via.placeholder.com/50' }
    },
    {
      name: 'Cuadro sencillo de hogar',
      price: 34.00,
      quantity: 1,
      image: { image: 'https://via.placeholder.com/50' }
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getStatusSteps = () => {
    const status = order.trackingStatusLabel;
    return {
      aprobado: true,
      enProceso: status === 'En proceso' || status === 'Entregado',
      entregado: status === 'Entregado'
    };
  };

  const steps = getStatusSteps();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Detalles del pedido #{order._id?.slice(-4) || '1234'}</Text>
          <Text style={styles.headerDate}>Realizado el {order.formattedDate}</Text>
        </View>
        
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar pedido</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Estado del Pedido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado del Pedido</Text>
          <Text style={styles.estimatedDate}>
            Fecha estimada de entrega: {formatDate(order.deliveryDate)}
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
          
          <Text style={styles.cancellableText}>
            🗓️ Cancelable hasta {formatDate(order.cancellableUntil)}
          </Text>
        </View>

        {/* Información del pedido */}
        <TouchableOpacity style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información del pedido</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Ubicación en tiempo real */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación en tiempo real</Text>
          <Text style={styles.subtitle}>Sigue la ubicación de tu pedido en el mapa</Text>
          
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <View style={styles.mapDot} />
            </View>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapText}>Tu pedido está en camino</Text>
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
              <Text style={styles.trackingDate}>Pedido el {order.formattedDate}</Text>
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
        </View>

        {/* Productos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>
          
          {products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <Image 
                source={{ uri: product.image?.image || 'https://via.placeholder.com/50' }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productQuantity}>Cantidad: {product.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>${product.price?.toFixed(2)}$</Text>
            </View>
          ))}
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  cancelButton: {
    backgroundColor: '#E8ACD2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  cancellableText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  subtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  chevron: {
    fontSize: 20,
    color: '#6c757d',
  },
  mapContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDot: {
    width: 8,
    height: 8,
    backgroundColor: '#E8ACD2',
    borderRadius: 4,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
  },
  mapText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
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
  productQuantity: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default OrderDetailsScreen;
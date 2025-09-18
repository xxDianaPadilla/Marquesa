import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const OrderDetailsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          {/* Aquí irá tu ícono de back */}
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Detalles del pedido #1234</Text>
          <Text style={styles.headerDate}>Realizado el 06/05/2025</Text>
        </View>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancelar pedido</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Estado del Pedido */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado del Pedido</Text>
          <Text style={styles.estimatedDate}>Fecha estimada de entrega: 09/05/2025</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.statusCompleted]} />
                <Text style={styles.statusText}>Aprobado</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.statusActive]} />
                <Text style={styles.statusText}>En proceso</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.statusPending]} />
                <Text style={styles.statusText}>Entregado</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.cancellableText}>🗓️ Cancelable hasta 04/05/2025</Text>
        </View>

        {/* Información del pedido */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Información del pedido</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Ubicación en tiempo real */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación en tiempo real</Text>
          <Text style={styles.subtitle}>Sigue la ubicación de tu pedido en el mapa</Text>
          
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              {/* Aquí irá tu componente de mapa */}
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
              <Text style={styles.trackingDate}>Pedido el 06/05/2025</Text>
            </View>
          </View>
          
          <View style={styles.trackingItem}>
            <View style={styles.trackingDot} />
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Preparando pedido</Text>
              <Text style={styles.trackingDate}>...</Text>
            </View>
          </View>
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
  backArrow: {
    fontSize: 20,
    color: '#6c757d',
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
  cancelButton: {
    backgroundColor: '#e9d5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cancelText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  estimatedDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#e9d5ff',
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#8b5cf6',
  },
  statusActive: {
    backgroundColor: '#8b5cf6',
  },
  statusPending: {
    backgroundColor: '#e9ecef',
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  cancellableText: {
    fontSize: 12,
    color: '#6c757d',
  },
  subtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 20,
    color: '#6c757d',
  },
  mapContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#e9ecef',
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
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
  },
  mapText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingDot: {
    width: 8,
    height: 8,
    backgroundColor: '#6c757d',
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
  },
  trackingDate: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default OrderDetailsScreen;
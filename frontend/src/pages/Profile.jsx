import React from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header/Header";
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/ButtonRosa';
import { FaEdit } from 'react-icons/fa';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import EditProfileModal from '../components/Profile/EditProfileModal';

// Componentes nuevos para el perfil
import UserInfo from '../components/Profile/UserInfo';
import UserSummary from '../components/Profile/UserSummary';

// Imágenes existentes para los tabs
import calendario from '../assets/calendario.png';

//Pantalla de perfil
const Perfil = () => {
  const navigate = useNavigate();
  const { logout, userInfo, user, isAuthenticated, loading } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // NUEVOS ESTADOS para códigos de descuento de la ruleta
  const [ruletaCodes, setRuletaCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  // DEBUG: Información del contexto de autenticación
  console.log('Profile - Estado del contexto:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    hasUserInfo: !!userInfo,
    user,
    userInfo
  });

  /**
   * NUEVA FUNCIÓN: Obtener códigos de descuento de la ruleta del usuario
   */
  const getUserRuletaCodes = async () => {
    try {
      console.log('Obteniendo códigos de ruleta del usuario...');
      setLoadingCodes(true);

      const response = await fetch('https://marquesa.onrender.com/api/clients/ruleta/codes', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta getUserRuletaCodes:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta completa getUserRuletaCodes:', data);

        if (data && data.success && data.codes) {
          console.log('Códigos de ruleta obtenidos exitosamente:', data.codes);
          setRuletaCodes(data.codes);
        } else {
          console.warn('Respuesta sin estructura esperada:', data);
          setRuletaCodes([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Error en respuesta del servidor:', response.status, errorText);
        setRuletaCodes([]);
      }
    } catch (error) {
      console.error('Error al obtener códigos de ruleta:', error);
      setRuletaCodes([]);
    } finally {
      setLoadingCodes(false);
    }
  };

  /**
   * NUEVA FUNCIÓN: Formatear fecha para mostrar
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  /**
   * NUEVA FUNCIÓN: Obtener texto del estado en español
   */
  const getStatusText = (status) => {
    const statusMap = {
      'active': 'Activo',
      'used': 'Utilizado',
      'expired': 'Caducado'
    };
    return statusMap[status] || status;
  };

  /**
   * NUEVA FUNCIÓN: Obtener color del estado para las tarjetas
   */
  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-700 border-green-300',
      'used': 'bg-gray-100 text-gray-400 border-gray-300',
      'expired': 'bg-red-100 text-red-400 border-red-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-400 border-gray-300';
  };

  /**
   * Función para obtener los pedidos del usuario
   */
  const getUserOrders = async (userId) => {
    try {
      console.log('Obteniendo pedidos para usuario:', userId);
      setLoadingOrders(true);

      if (!userId) {
        console.warn('No se proporcionó userId para obtener pedidos');
        return;
      }

      const response = await fetch(`https://marquesa.onrender.com/api/sales/user/${userId}/orders`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Status de respuesta getUserOrders:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Respuesta completa getUserOrders:', data);

        if (data && data.success && data.data) {
          console.log('Pedidos obtenidos exitosamente:', data.data);
          setUserOrders(data.data);
        } else {
          console.warn('Respuesta sin estructura esperada:', data);
          setUserOrders([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Error en respuesta del servidor:', response.status, errorText);
        setUserOrders([]);
      }
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  /**
   * Función para formatear fecha de pedidos
   */
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Función para calcular fecha de cancelación (3 días después de createdAt)
   */
  const getCancellableDate = (createdAt) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Función para mapear trackingStatus a etiquetas en español
   */
  const getTrackingStatusLabel = (trackingStatus) => {
    const statusMap = {
      'Agendado': 'Preparando',
      'En proceso': 'En proceso',
      'Entregado': 'Entregado'
    };
    return statusMap[trackingStatus] || trackingStatus;
  };

  /**
   * Función para obtener el color de la etiqueta según el estado
   */
  const getOrderStatusColor = (trackingStatus) => {
    const colorMap = {
      'Agendado': 'text-yellow-500 border-yellow-300',
      'En proceso': 'text-blue-500 border-blue-300',
      'Entregado': 'text-green-500 border-green-300'
    };
    return colorMap[trackingStatus] || 'text-gray-500 border-gray-300';
  };

  /**
   * Función para manejar el cierre de sesión
   */
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    } else {
      console.error('Error al cerrar sesión:', result.error);
    }
  };

  /**
   * Navegación a la página de detalles de pedidos
   */
  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/orderdetails');
  };

  /**
   * Maneja el éxito al actualizar el perfil
   */
  const handleEditSuccess = (message) => {
    toast.success(message || 'Perfil actualizado exitosamente');
  };

  const handleOrderDetails = async (pedido) => {
    try {
      // Obtener datos del cliente
      const customerResponse = await fetch(`https://marquesa.onrender.com/api/users/${pedido.shoppingCart.clientId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let customerData = null;
      if (customerResponse.ok) {
        const customerResult = await customerResponse.json();
        customerData = customerResult.data;
      }

      // Obtener datos de los productos del carrito
      let productsData = [];
      if (pedido.shoppingCart.items && pedido.shoppingCart.items.length > 0) {
        // Crear array de promesas para obtener detalles de cada producto
        const productPromises = pedido.shoppingCart.items.map(async (item) => {
          try {
            let productResponse;

            // Determinar el endpoint según el tipo de item
            if (item.itemType === 'product') {
              productResponse = await fetch(`https://marquesa.onrender.com/api/products/${item.itemId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              });
            } else if (item.itemType === 'custom') {
              productResponse = await fetch(`https://marquesa.onrender.com/api/customproducts/${item.itemId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              });
            }

            if (productResponse && productResponse.ok) {
              const productResult = await productResponse.json();
              const productData = productResult.data;

              return {
                ...item,
                name: productData.name || productData.productToPersonalize || 'Producto sin nombre',
                description: productData.description || productData.extraComments || 'Sin descripción',
                image: productData.images?.[0] || productData.referenceImage || null,
                price: productData.price || 0
              };
            } else {
              // Si no se puede obtener el producto, devolver datos básicos
              return {
                ...item,
                name: 'Producto no disponible',
                description: 'Información no disponible',
                image: null,
                price: 0
              };
            }
          } catch (error) {
            console.error('Error al obtener producto:', item.itemId, error);
            return {
              ...item,
              name: 'Error al cargar producto',
              description: 'No se pudo cargar la información',
              image: null,
              price: 0
            };
          }
        });

        // Esperar a que se resuelvan todas las promesas
        productsData = await Promise.all(productPromises);
      }

      // Navegar con todos los datos
      navigate('/orderdetails', {
        state: {
          orderData: pedido,
          customerData: customerData,
          productsData: productsData
        }
      });

    } catch (error) {
      console.error('Error al preparar datos para OrderDetail:', error);
      toast.error('Error al cargar los detalles del pedido');
      // Navegar sin datos adicionales como fallback
      navigate('/orderdetails');
    }
  };

  // Combinamos la información del usuario de ambas fuentes disponibles en AuthContext
  // Priorizar userInfo sobre user ya que tiene más detalles
  const userData = userInfo || user || {};

  console.log('Profile - Datos del usuario combinados:', userData);

  // Effect para cargar los pedidos cuando el usuario esté disponible
  useEffect(() => {
    if (userData && (userData._id || userData.id)) {
      const userId = userData._id || userData.id;
      getUserOrders(userId);
      // NUEVA LLAMADA: Cargar códigos de ruleta
      getUserRuletaCodes();
    }
  }, [userData]);

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <>
        <Header />
        <div className="p-4 md:p-10 bg-white min-h-screen font-poppins max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del usuario...</p>
          </div>
        </div>
      </>
    );
  }

  // Si no está autenticado, redirigir
  if (!isAuthenticated) {
    console.log('⚠️ Usuario no autenticado, redirigiendo...');
    navigate('/login');
    return null;
  }

  return (
    <>
      <Header />

      <div className="p-4 md:p-10 bg-white min-h-screen font-poppins max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Configuración</h1>
            <p className="text-sm text-gray-500 mt-2">Administra tu información personal y preferencias</p>
          </div>
          <Button
            onClick={() => setShowEditModal(true)}
            className="hover:bg-pink-400 text-white flex items-center text-sm px-4 py-2"
            style={{ backgroundColor: '#E8ACD2' }}
          >
            <FaEdit className="mr-2" /> Editar perfil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información personal - USANDO COMPONENTES NUEVOS */}
          <Card className="p-6">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4">Información personal</h2>

            {/* Componente de información del usuario */}
            <UserInfo user={userData} />

            {/* Componente de resumen estadístico */}
            <UserSummary />

            <div className="text-center mt-6">
              <Button style={{ backgroundColor: '#E8ACD2' }} className="hover:bg-pink-400 text-white w-full py-2 text-sm md:text-base" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </Card>

          {/* Tabs contenido - CON DATOS REALES INCLUYENDO CÓDIGOS DE RULETA */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <Tabs defaultValue="pedidos">
                <TabsList className="flex gap-2 bg-gray-100 rounded-md text-sm font-medium overflow-hidden w-full">
                  <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                  <TabsTrigger value="descuentos">Códigos de descuento</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="pedidos">
                    <p className="text-2xl md:text-3xl font-medium mb-2">Mis pedidos recientes</p>
                    <div className="text-right mb-2">
                      <Button variant="ghost" className="text-pink-400 hover:text-pink-600 text-sm">Ver todos {'>'}</Button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {loadingOrders ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Cargando pedidos...</p>
                        </div>
                      ) : userOrders.length > 0 ? (
                        userOrders.map((pedido, idx) => (
                          <Card key={idx} className="border border-gray-200">
                            <div className="p-4 space-y-2">
                              <div className="flex flex-col sm:flex-row justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-sm sm:text-base">
                                    Pedido #{pedido._id?.slice(-6) || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Realizado el {formatOrderDate(pedido.createdAt)}
                                  </p>
                                </div>
                                <span className={`border px-2 py-0.5 rounded-full text-xs h-fit ${getOrderStatusColor(pedido.trackingStatus)}`}>
                                  {getTrackingStatusLabel(pedido.trackingStatus)}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1">
                                <span>
                                  {pedido.shoppingCart?.items?.length || 0} productos ·
                                  Total: ${pedido.shoppingCart?.total?.toFixed(2) || '0.00'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <img src={calendario} alt="calendario" className="w-4 h-4" />
                                  Revisa la fecha de cancelación del pedido
                                </div>
                              </div>
                              <Button
                                className="w-full hover:bg-pink-400 text-white py-2 text-sm"
                                onClick={() => handleOrderDetails(pedido)} 
                                style={{ backgroundColor: '#E8ACD2' }}
                              >
                                Detalles pedidos
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No tienes pedidos recientes</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB DE CÓDIGOS DE DESCUENTO - ACTUALIZADO CON DATOS REALES */}
                  <TabsContent value="descuentos">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl md:text-3xl font-medium">Mis códigos de descuento</p>
                      <button
                        onClick={getUserRuletaCodes}
                        disabled={loadingCodes}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        style={{ cursor: 'pointer' }}
                      >
                        {loadingCodes ? '' : '↻ Actualizar'}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {loadingCodes ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Cargando códigos...</p>
                        </div>
                      ) : ruletaCodes.length > 0 ? (
                        ruletaCodes.map((codigo, index) => (
                          <Card key={codigo.codeId || index} className="p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-lg">{codigo.name}</p>
                                <p className="text-sm text-gray-500">Válido hasta: {formatDate(codigo.expiresAt)}</p>
                                <p className="text-sm text-gray-500">Código: {codigo.code}</p>
                                {codigo.status === 'used' && codigo.usedAt && (
                                  <p className="text-xs text-gray-400">Utilizado el {formatDate(codigo.usedAt)}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(codigo.status)}`}>
                                  {codigo.discount}
                                </span>
                                <span className="text-xs text-pink-500">{getStatusText(codigo.status)}</span>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🎰</div>
                          <p className="text-gray-500 text-lg mb-2">¡Aún no tienes códigos!</p>
                          <p className="text-gray-400 text-sm mb-4">Visita la ruleta para obtener descuentos exclusivos</p>
                          <Button
                            onClick={() => navigate('/ruleta')}
                            className="hover:bg-pink-400 text-white py-2 px-4"
                            style={{ backgroundColor: '#E8ACD2' }}
                          >
                            Ir a la ruleta
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Información sobre límites de códigos */}
                    {ruletaCodes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Códigos mostrados: {ruletaCodes.length}</span>
                          <span>Activos: {ruletaCodes.filter(c => c.status === 'active').length}/10</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de edición de perfil */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default Perfil;
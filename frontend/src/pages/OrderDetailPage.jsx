import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Package, User, Phone, Mail, Truck, Clock } from "lucide-react";

// Importación de componentes 
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const OrderDetail = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 0: Agendado, 1: En proceso, 2: Entregado

  //Navegación para atrás /profile
  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  const steps = [
    { id: 0, label: "Agendado", completed: true },
    { id: 1, label: "En proceso", completed: false, current: true },
    { id: 2, label: "Entregado", completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header personalizado de la página */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={handleSavesClick}>
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Detalles del pedido #1234
                </h1>
                <p className="text-sm text-gray-500">Realizado el 05/05/2025</p>
              </div>
            </div>
            <button className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#E8ACD2' }}>
              Cancelar pedido
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del Pedido */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Estado del Pedido
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Fecha estimada de entrega: 09/05/2025
              </p>
              
              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="flex items-center justify-between mb-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed ? 'text-white' : 
                        step.current ? 'text-white' : 'bg-gray-200 text-gray-500'
                      }`} style={{ backgroundColor: step.completed || step.current ? '#E8ACD2' : '' }}>
                        {step.completed ? '✓' : step.current ? '2' : '3'}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Progress line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
                  <div className="h-full transition-all duration-300" style={{ width: '50%', backgroundColor: '#E8ACD2' }}></div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <input type="checkbox" className="mr-3" />
                <span>Cancelable hasta: 04/05/2025</span>
              </div>
            </div>

            {/* Ubicación en tiempo real */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Ubicación en tiempo real
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Sigue la ubicación de tu pedido en el mapa
              </p>
              
              {/* Mapa placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative">
                <MapPin className="h-8 w-8 text-gray-400" />
                <div className="absolute bottom-4 left-4 right-4 bg-gray-800 text-white p-3 rounded-lg">
                  <p className="text-sm font-medium">Tu pedido está en camino</p>
                  <p className="text-xs text-gray-300">Llegará en aproximadamente 25 minutos</p>
                </div>
              </div>
            </div>

            {/* Historial de seguimiento */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Historial de seguimiento
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pedido recibido</p>
                    <p className="text-sm text-gray-500">Recibido el 02/05/2025</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Preparando pedido</p>
                    <p className="text-sm text-gray-500">Preparado el 04/05/2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Productos
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/api/placeholder/64/64" 
                      alt="Ramo de flores secas lavanda" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Ramo de flores secas lavanda
                    </p>
                    <p className="text-sm text-gray-500">Color: Lavanda</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">10,00$</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/api/placeholder/64/64" 
                      alt="Cuadro sencillo de hogar" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Cuadro sencillo de hogar
                    </p>
                    <p className="text-sm text-gray-500">Tamaño: Mediano</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">34,00$</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Estado</h2>
                <span className="text-sm" style={{ color: '#E8ACD2' }}>Preparando</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sub Total</span>
                  <span className="text-sm font-medium text-gray-900">134,00$</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Envío</span>
                  <span className="text-sm font-medium text-gray-900">10,00$</span>
                </div>
                <div className="border-t pt-3" style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">144,00$</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de envío
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Número del repartidor</p>
                    <p className="text-sm text-gray-500">+503 7403-8921</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ubicación de entrega</p>
                    <p className="text-sm text-gray-500">Veintinueve del hospital, calle bienestar casa 15A, San Salvador San Salvador</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de contacto
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bryan Miranda</p>
                    <p className="text-sm text-gray-500">bryanmiranda@gmail.com</p>
                    <p className="text-sm text-gray-500">+503 7888-0503</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetail;
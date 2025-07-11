import React, { useState } from "react";
// Imports de los íconos de Lucide
import {
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  User,
  Package,
  CreditCard,
  Clock,
} from "lucide-react";
// Importación de estilos
const SalesCard = ({ sale, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPaymentProof, setShowPaymentProof] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Agendado":
        return "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-yellow-100";
      case "En proceso":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100";
      case "Entregado":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100";
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 shadow-gray-100";
    }
  };
// Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Agendado":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm";
      case "En proceso":
        return "bg-blue-100 text-blue-700 border-blue-300 shadow-sm";
      case "Entregado":
        return "bg-green-100 text-green-700 border-green-300 shadow-sm";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 shadow-sm";
    }
  };
// Función para obtener el ícono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case "Agendado":
        return <Clock className="w-3 h-3" />;
      case "En proceso":
        return <Package className="w-3 h-3" />;
      case "Entregado":
        return <div className="w-3 h-3 bg-green-600 rounded-full"></div>;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };
// Función para obtener el ícono del tipo de pago
  const getPaymentTypeIcon = (paymentType) => {
    switch (paymentType) {
      case "Transferencia":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "Efectivo":
        return <div className="w-4 h-4 bg-green-600 rounded-full"></div>;
      case "Débito":
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case "Crédito":
        return <CreditCard className="w-4 h-4 text-red-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };
// Función para manejar el cambio de estado
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    const success = await onUpdateStatus(sale._id, newStatus);
    setIsUpdating(false);

    if (!success) {
      alert("Error al actualizar el estado");
    }
  };
// Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
// Función para formatear la hora
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div
        className={`rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getStatusColor(
          sale.trackingStatus
        )}`}
      >
        {/* Header con información del cliente */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5 gap-3 sm:gap-0">
          {/* Parte izquierda: avatar + datos */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {sale.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-gray-800 mb-1"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {sale.clientName}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-3 h-3" />
                  <span>{sale.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Ojito + Estado solo visibles abajo en móvil */}
            <div className="flex sm:hidden items-center gap-3 mt-1">
              <button
                onClick={() => setShowPaymentProof(true)}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 border border-gray-200"
                title="Ver comprobante de pago"
              >
                <Eye className="w-4 h-4 text-blue-600" />
              </button>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 max-w-full overflow-hidden ${getStatusBadgeColor(
                  sale.trackingStatus
                )}`}
              >
                {getStatusIcon(sale.trackingStatus)}
                <span className="truncate block whitespace-nowrap text-ellipsis overflow-hidden">
                  {sale.trackingStatus}
                </span>
              </span>
            </div>
          </div>

          {/* Ojito + Estado solo visibles a la derecha en desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setShowPaymentProof(true)}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 border border-gray-200"
              title="Ver comprobante de pago"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 max-w-full overflow-hidden ${getStatusBadgeColor(
                sale.trackingStatus
              )}`}
            >
              {getStatusIcon(sale.trackingStatus)}
              <span className="truncate block whitespace-nowrap text-ellipsis overflow-hidden">
                {sale.trackingStatus}
              </span>
            </span>
          </div>
        </div>

        {/* Información de productos */}
        <div className="mb-5 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Productos
          </h4>
          <div className="space-y-3">
            {sale.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-gray-800 font-medium text-sm">
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="text-gray-500 text-xs ml-2">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-green-600 font-semibold">
                  ${item.subtotal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Información de entrega */}
        <div className="mb-5 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Información de Entrega
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Destinatario:</span>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-gray-800">
                  {sale.receiverName}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Teléfono:</span>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-gray-800">{sale.receiverPhone}</span>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 font-medium">
                Punto de referencia:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-gray-800">{sale.deliveryPoint}</span>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 font-medium">
                Fecha de entrega:
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="font-semibold" style={{ color: "#FF6A5F" }}>
                  {formatDate(sale.deliveryDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total y método de pago */}
        <div className="flex justify-between items-center mb-5 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            {getPaymentTypeIcon(sale.paymentType)}
            <div>
              <span className="text-gray-500 text-sm">Método de pago:</span>
              <div className="font-semibold text-gray-800">
                {sale.paymentType}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-sm">Total:</span>
            <div className="text-2xl font-bold text-green-600">
              ${sale.total}
            </div>
          </div>
        </div>

        {/* Selector de estado */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Actualizar estado:
            </span>
            <select
              value={sale.trackingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white font-medium"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <option value="Agendado">Agendado</option>
              <option value="En proceso">En proceso</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
          {isUpdating && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Actualizando...</span>
            </div>
          )}
        </div>

        {/* Dirección */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-600">
                Dirección completa:
              </span>
              <p className="text-sm text-gray-800 mt-1">
                {sale.deliveryAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para mostrar comprobante de pago */}
      {showPaymentProof && (
        <div
          className="fixed inset-0 bg-grey flex items-center justify-center z-50 p-4"
          style={{ opacity: "-10px" }}
        >
          <div className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Comprobante de Pago
              </h3>
              <button
                onClick={() => setShowPaymentProof(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Cliente:</span>{" "}
                  {sale.clientName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Método de pago:</span>{" "}
                  {sale.paymentType}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Total:</span> ${sale.total}
                </p>
              </div>
              {sale.paymentProofImage ? (
                <div className="text-center">
                  <img
                    src={sale.paymentProofImage}
                    alt="Comprobante de pago"
                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-md"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div className="hidden p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <Eye className="w-12 h-12 mx-auto mb-2" />
                    </div>
                    <p className="text-gray-600">
                      No se pudo cargar la imagen del comprobante
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <Eye className="w-12 h-12 mx-auto mb-2" />
                  </div>
                  <p className="text-gray-600">
                    No hay comprobante de pago disponible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesCard;

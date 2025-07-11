
import React, { useState, useEffect } from "react"; // Importamos React, useState y useEffect
import AdminLayout from "../components/AdminLayout"; // Layout principal para la sección de administración
import SalesCard from "../components/SalesCard"; // Componente que representa una tarjeta de venta individual
import useSalesAdmin from "../components/Sales/Hooks/useSalesAdmin"; // Hook que gestiona la lógica de las ventas en el administrador

const SalesManager = () => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [filteredSales, setFilteredSales] = useState([]); // Estado para almacenar las ventas filtradas
  const [selectedStatus, setSelectedStatus] = useState("all"); // Estado para el estado seleccionado de las ventas
  const [stats, setStats] = useState({ // Estado para las estadísticas de ventas
    total: 0,
    agendadas: 0,
    enProceso: 0,
    entregadas: 0,
  });

  // Llamada al hook `useSalesAdmin`, que contiene las funciones necesarias para gestionar las ventas
  const {
    sales, // Lista de todas las ventas
    loading, // Estado de carga
    error, // Error que podría ocurrir durante la carga
    updateTrackingStatus, // Función para actualizar el estado de un pedido
    filterSalesByStatus, // Función para filtrar ventas por estado
    searchSales, // Función para realizar la búsqueda de ventas
  } = useSalesAdmin();

  // Efecto que se activa cada vez que se actualizan las ventas, el estado seleccionado o el término de búsqueda
  useEffect(() => {
    let filtered = sales;

    // Filtramos las ventas por el estado seleccionado
    if (selectedStatus !== "all") {
      filtered = filterSalesByStatus(selectedStatus);
    }

    // Filtramos las ventas por el término de búsqueda
    if (searchTerm.trim()) {
      filtered = searchSales(searchTerm);
    }

    // Actualizamos el estado de ventas filtradas
    setFilteredSales(filtered);
  }, [sales, selectedStatus, searchTerm, filterSalesByStatus, searchSales]);

  // Efecto para actualizar las estadísticas cada vez que cambian las ventas
  useEffect(() => {
    if (sales.length > 0) {
      // Filtramos las ventas por estado y contamos cuántas hay de cada tipo
      const agendadas = sales.filter(
        (sale) => sale.trackingStatus === "Agendado"
      ).length;
      const enProceso = sales.filter(
        (sale) => sale.trackingStatus === "En proceso"
      ).length;
      const entregadas = sales.filter(
        (sale) => sale.trackingStatus === "Entregado"
      ).length;

      // Actualizamos las estadísticas
      setStats({
        total: sales.length,
        agendadas,
        enProceso,
        entregadas,
      });
    }
  }, [sales]);

  // Función para cambiar el estado de seguimiento de una venta
  const handleStatusChange = async (saleId, newStatus) => {
    return await updateTrackingStatus(saleId, newStatus);
  };

  // Función para obtener el color asociado con el estado de una venta
  const getStatusColor = (status) => {
    switch (status) {
      case "Agendado":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "En proceso":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Entregado":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Si la carga está en progreso, mostramos un indicador de carga
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // Si hay un error, mostramos el mensaje de error
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Si no hay errores ni carga, renderizamos la interfaz de ventas
  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header de la página */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-4">
            <div className="w-full lg:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Ordenes de Marquesa
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona tus pedidos ordenados por fecha de entrega
              </p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
              {/* Campo de búsqueda */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por cliente, destinatario o punto de referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base w-full sm:w-80 lg:w-96 xl:w-[510px]"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Selector de filtro por estado */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base w-full sm:w-auto min-w-[180px]"
              >
                <option value="all">Todos los estados</option>
                <option value="Agendado">Agendado</option>
                <option value="En proceso">En proceso</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
          </div>

          {/* Estadísticas de ventas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 lg:mt-6">
            {/* Estadísticas individuales */}
            {["total", "agendadas", "enProceso", "entregadas"].map((key, index) => (
              <div key={index} className={`p-3 sm:p-4 rounded-lg border ${key === 'total' ? 'bg-gray-50' : key === 'agendadas' ? 'bg-yellow-50' : key === 'enProceso' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stats[key]}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1">{key === 'total' ? 'Total de Órdenes' : key.charAt(0).toUpperCase() + key.slice(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 text-lg mb-2">No se encontraron órdenes</div>
              <div className="text-gray-400 text-sm">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay órdenes para mostrar"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Tarjetas de ventas */}
              {filteredSales.map((sale) => (
                <SalesCard key={sale._id} sale={sale} onUpdateStatus={handleStatusChange} />
              ))}
            </div>
          )}
        </div>

        {/* Información adicional sobre los estados */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Estados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado de cada tipo */}
            {["Agendado", "En proceso", "Entregado"].map((status) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>{status}</div>
                <span className="text-sm text-gray-600">
                  {status === "Agendado" ? "Pedido confirmado, esperando preparación" : status === "En proceso" ? "Pedido en preparación" : "Pedido entregado al cliente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesManager;

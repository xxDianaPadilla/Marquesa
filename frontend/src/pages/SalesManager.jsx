import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import SalesCard from "../components/SalesCard";
import useSalesAdmin from "../components/Sales/Hooks/useSalesAdmin";

const SalesManager = () => {
  const {
    sales,
    loading,
    error,
    updateTrackingStatus,
    filterSalesByStatus,
    searchSales,
  } = useSalesAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    agendadas: 0,
    enProceso: 0,
    entregadas: 0,
  });

  useEffect(() => {
    let filtered = sales;

    if (selectedStatus !== "all") {
      filtered = filterSalesByStatus(selectedStatus);
    }

    if (searchTerm.trim()) {
      filtered = searchSales(searchTerm);
    }

    setFilteredSales(filtered);
  }, [sales, selectedStatus, searchTerm, filterSalesByStatus, searchSales]);

  useEffect(() => {
    if (sales.length > 0) {
      const agendadas = sales.filter(
        (sale) => sale.trackingStatus === "Agendado"
      ).length;
      const enProceso = sales.filter(
        (sale) => sale.trackingStatus === "En proceso"
      ).length;
      const entregadas = sales.filter(
        (sale) => sale.trackingStatus === "Entregado"
      ).length;

      setStats({
        total: sales.length,
        agendadas,
        enProceso,
        entregadas,
      });
    }
  }, [sales]);

  const handleStatusChange = async (saleId, newStatus) => {
    return await updateTrackingStatus(saleId, newStatus);
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

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

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-4">
            <div className="w-full lg:w-auto">
              <h1
                className="text-xl sm:text-2xl font-bold text-gray-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Ordenes de Marquesa
              </h1>
              <p
                className="text-gray-600 mt-1 text-sm sm:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Gestiona tus pedidos ordenados por fecha de entrega
              </p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
              {/* Buscador */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por cliente, destinatario o punto de referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base w-full sm:w-80 lg:w-96 xl:w-[510px]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                />
                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filtro por estado */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base w-full sm:w-auto min-w-[180px]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <option value="all">Todos los estados</option>
                <option value="Agendado">Agendado</option>
                <option value="En proceso">En proceso</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 lg:mt-6">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {stats.total}
              </div>
              <div
                className="text-xs sm:text-sm text-gray-600 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Total de Órdenes
              </div>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {stats.agendadas}
              </div>
              <div
                className="text-xs sm:text-sm text-yellow-600 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Agendadas
              </div>
            </div>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {stats.enProceso}
              </div>
              <div
                className="text-xs sm:text-sm text-blue-600 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                En Proceso
              </div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
              <div
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {stats.entregadas}
              </div>
              <div
                className="text-xs sm:text-sm text-green-600 mt-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Entregadas
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 text-lg mb-2">
                No se encontraron órdenes
              </div>
              <div className="text-gray-400 text-sm">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "No hay órdenes para mostrar"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSales.map((sale) => (
                <SalesCard
                  key={sale._id}
                  sale={sale}
                  onUpdateStatus={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Información de Estados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  "Agendado"
                )}`}
              >
                Agendado
              </div>
              <span className="text-sm text-gray-600">
                Pedido confirmado, esperando preparación
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  "En proceso"
                )}`}
              >
                En proceso
              </div>
              <span className="text-sm text-gray-600">Pedido en preparación</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  "Entregado"
                )}`}
              >
                Entregado
              </div>
              <span className="text-sm text-gray-600">Pedido entregado al cliente</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesManager;
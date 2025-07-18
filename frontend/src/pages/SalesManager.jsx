/**
 * Página de gestión de ventas para administradores
 * 
 * Funcionalidades principales:
 * - Listado de órdenes con filtros y búsqueda
 * - Estadísticas de ventas en tiempo real
 * - Actualización de estados de pedidos
 * - Información detallada de cada orden
 * 
 * Componentes utilizados:
 * - AdminLayout (existente)
 * - SalesCard (existente)
 * - useSalesAdmin (hook existente)
 * - SearchBar (nuevo)
 * - StatsCard (nuevo)
 * - LoadingSpinner (nuevo)
 * - EmptyState (nuevo)
 * - Badge (nuevo)
 * - Container (nuevo)
 */

import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import SalesCard from "../components/SalesCard";
import useSalesAdmin from "../components/Sales/Hooks/useSalesAdmin";

// Componentes nuevos reutilizables
import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import Container from "../components/Container";

const SalesManager = () => {
  // Estados locales para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    agendadas: 0,
    enProceso: 0,
    entregadas: 0,
  });

  // Hook personalizado para gestión de ventas
  const {
    sales,
    loading,
    error,
    updateTrackingStatus,
    filterSalesByStatus,
    searchSales,
  } = useSalesAdmin();

  /**
   * Efecto para filtrar ventas según búsqueda y estado seleccionado
   */
  useEffect(() => {
    let filtered = sales;

    // Filtrar por estado si no es 'all'
    if (selectedStatus !== "all") {
      filtered = filterSalesByStatus(selectedStatus);
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = searchSales(searchTerm);
    }

    setFilteredSales(filtered);
  }, [sales, selectedStatus, searchTerm, filterSalesByStatus, searchSales]);

  /**
   * Efecto para calcular estadísticas de ventas
   */
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

  /**
   * Maneja el cambio de estado de seguimiento de una venta
   */
  const handleStatusChange = async (saleId, newStatus) => {
    return await updateTrackingStatus(saleId, newStatus);
  };

  /**
   * Limpia el término de búsqueda
   */
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  /**
   * Obtiene el color apropiado para cada estado
   */
  const getStatusVariant = (status) => {
    switch (status) {
      case "Agendado":
        return "agendado";
      case "En proceso":
        return "en-proceso";
      case "Entregado":
        return "entregado";
      default:
        return "default";
    }
  };

  // Mostrar loading si está cargando
  if (loading) {
    return (
      <AdminLayout>
        <Container className="p-6">
          <LoadingSpinner 
            text="Cargando órdenes..."
            size="lg"
          />
        </Container>
      </AdminLayout>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <AdminLayout>
        <Container className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error: {error}
            </div>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header de la página */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-6 gap-4">
            {/* Información principal */}
            <div className="w-full lg:w-auto">
              <h1 
                className="text-xl sm:text-2xl font-bold text-gray-800"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Órdenes de Marquesa
              </h1>
              <p 
                className="text-gray-600 mt-1 text-sm sm:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Gestiona tus pedidos ordenados por fecha de entrega
              </p>
            </div>

            {/* Controles de filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
              {/* Barra de búsqueda usando componente reutilizable */}
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={handleClearSearch}
                placeholder="Buscar por cliente, destinatario o punto de referencia..."
                className="w-full sm:w-80 lg:w-96 xl:w-[510px]"
              />

              {/* Selector de filtro por estado */}
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

          {/* Estadísticas de ventas usando StatsCard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 lg:mt-6">
            <StatsCard
              title="Total de Órdenes"
              value={stats.total}
              color="#f9fafb"
              textColor="gray-800"
            />
            <StatsCard
              title="Agendadas"
              value={stats.agendadas}
              color="#fef3c7"
              textColor="yellow-800"
            />
            <StatsCard
              title="En Proceso"
              value={stats.enProceso}
              color="#dbeafe"
              textColor="blue-800"
            />
            <StatsCard
              title="Entregadas"
              value={stats.entregadas}
              color="#d1fae5"
              textColor="green-800"
            />
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            // Estado vacío usando componente reutilizable
            <EmptyState
              icon={
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
              title={searchTerm ? "No se encontraron órdenes" : "No hay órdenes para mostrar"}
              description={
                searchTerm 
                  ? "Intenta con otros términos de búsqueda" 
                  : "No hay órdenes disponibles en este momento"
              }
              actionText={searchTerm ? "Limpiar búsqueda" : undefined}
              onAction={searchTerm ? handleClearSearch : undefined}
            />
          ) : (
            // Grid de tarjetas de ventas
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

        {/* Información adicional sobre los estados */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Información de Estados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado Agendado */}
            <div className="flex items-center gap-3">
              <Badge variant="agendado" size="md">
                Agendado
              </Badge>
              <span 
                className="text-sm text-gray-600"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Pedido confirmado, esperando preparación
              </span>
            </div>
            
            {/* Estado En proceso */}
            <div className="flex items-center gap-3">
              <Badge variant="en-proceso" size="md">
                En proceso
              </Badge>
              <span 
                className="text-sm text-gray-600"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Pedido en preparación
              </span>
            </div>
            
            {/* Estado Entregado */}
            <div className="flex items-center gap-3">
              <Badge variant="entregado" size="md">
                Entregado
              </Badge>
              <span 
                className="text-sm text-gray-600"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Pedido entregado al cliente
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(searchTerm || selectedStatus !== "all") && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span 
                  className="text-sm font-medium text-blue-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Filtros activos:
                </span>
                
                {/* Mostrar filtros activos */}
                <div className="flex gap-2">
                  {searchTerm && (
                    <Badge variant="info" size="sm">
                      Búsqueda: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedStatus !== "all" && (
                    <Badge variant={getStatusVariant(selectedStatus)} size="sm">
                      Estado: {selectedStatus}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                style={{ fontFamily: "Poppins, sans-serif", cursor: "pointer" }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SalesManager;
// Importa React y los hooks useState, useEffect para el manejo de estados y efectos secundarios
import React, { useState, useEffect } from "react";

// Importa componentes de recharts para crear el gráfico de barras
import { BarChart, Bar, YAxis, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const StatisticsCharts = () => {
    // Definición de los estados locales del componente
    const [chartData, setChartData] = useState([]);  // Almacena los datos del gráfico
    const [loading, setLoading] = useState(true);    // Indica si los datos están siendo cargados
    const [error, setError] = useState(null);        // Almacena errores en caso de fallar la solicitud

    // useEffect para llamar a la función que obtiene los datos cuando el componente se monta
    useEffect(() => {
        fetchChartData();  // Llama a la función para obtener los datos
    }, []);  // El array vacío asegura que esto solo se ejecute una vez al montar el componente

    // Función para obtener los datos del gráfico de una API (simulada con datos mock)
    const fetchChartData = async () => {
        try {
            // Realiza la solicitud a la API para obtener datos de ventas
            const response = await fetch('http://localhost:4000/api/sales/dashboardStats');

            // Verifica si la respuesta es correcta, si no lanza un error
            if (!response.ok) {
                throw new Error('Error al obtener datos del gráfico');
            }

            // Datos mock en caso de que la solicitud sea exitosa
            const mockData = [
                { month: 'Marzo', income: 520, color: '#FFA8A8' },
                { month: 'Abril', income: 590, color: '#FFA8A8' },
                { month: 'Mayo', income: 700, color: '#FFA8A8' }
            ];

            // Establece los datos del gráfico
            setChartData(mockData);
        } catch (error) {
            // Maneja el error y lo guarda en el estado
            setError(error.message);
            console.error('Error fetching chart data: ', error);
        } finally {
            // Cambia el estado de loading a false, independientemente de si hubo error
            setLoading(false);
        }
    };

    // Componente personalizado para las barras del gráfico
    const CustomBar = (props) => {
        const { fill, ...rest } = props;
        return <Bar {...rest} fill="#FF8A8A" radius={[4, 4, 0, 0]} />;  // Personaliza el color y radio de las esquinas de las barras
    }

    // Componente personalizado para el tooltip del gráfico
    const CustomToolTip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        Ingresos: <span className="font-semibold text-green-600">${payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Si está cargando, se muestra un estado de carga visual
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    // Si hay un error, se muestra el mensaje de error
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total de ingresos trimestrales
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">Error: {error}</p>
                </div>
            </div>
        );
    }

    // Si los datos se cargaron correctamente, se muestra el gráfico
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Título y descripción del gráfico */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total de ingresos trimestrales
                </h3>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Resumen de los ingresos este último trimestre
                </p>
            </div>

            {/* Contenedor del gráfico */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}  // Datos del gráfico
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        barCategoryGap="25%"  // Espacio entre las barras
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"  // Muestra los meses en el eje X
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: '#6b7280',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fill: '#6b7280',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                            domain={[0, 800]}  // Establece el rango del eje Y
                            tickFormatter={(value) => `$${value}`}  // Formatea los valores como moneda
                        />
                        <CustomBar
                            dataKey="income"  // Muestra los ingresos en el gráfico
                            fill="#FF8A8A"
                            radius={[4, 4, 0, 0]}  // Aplica el radio de las esquinas de las barras
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Muestra los valores sobre las barras */}
            <div className="relative -mt-6 pointer-events-none">
                <div className="flex justify-around items-end h-64">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span
                                className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm"
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    transform: `translateY(-${(item.income / 800) * 200 + 20}px)`  // Ajusta la posición del valor sobre la barra
                                }}
                            >
                                ${item.income}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Exporta el componente como default para que pueda ser usado en otras partes de la aplicación
export default StatisticsCharts;

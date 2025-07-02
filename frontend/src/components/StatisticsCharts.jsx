import React, { useState, useEffect } from "react";
import { BarChart, Bar, YAxis, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const StatisticsCharts = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/sales/dashboard-stats');

            if (!response.ok) {
                throw new Error('Error al obtener datos del gráfico');
            }

            const mockData = [
                { month: 'Marzo', income: 520, color: '#FFA8A8' },
                { month: 'Abril', income: 590, color: '#FFA8A8' },
                { month: 'Mayo', income: 700, color: '#FFA8A8' }
            ];

            setChartData(mockData);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching chart data: ', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomBar = (props) => {
        const { fill, ...rest } = props;
        return <Bar {...rest} fill="#FF8A8A" radius={[4, 4, 0, 0]} />;
    }

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

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Total de ingresos trimestrales
                </h3>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Resumen de los ingresos este último trimestre
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        barCategoryGap="25%"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
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
                            domain={[0, 800]}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <CustomBar
                            dataKey="income"
                            fill="#FF8A8A"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Valores sobre las barras */}
            <div className="relative -mt-6 pointer-events-none">
                <div className="flex justify-around items-end h-64">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span
                                className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm"
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    transform: `translateY(-${(item.income / 800) * 200 + 20}px)`
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

export default StatisticsCharts;
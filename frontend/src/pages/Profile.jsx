import React from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header/Header";
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/ButtonRosa';
import { FaEdit } from 'react-icons/fa';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import SeparatorPerfil from '../components/SeparadorPerfil';

// Imágenes
import correo from '../assets/CorreoMarqueza.png';
import telefono from '../assets/TelefonoMarqueza.png';
import ubicacion from '../assets/ubicacion.png';
import regalo from '../assets/Regalo.png';
import relog from '../assets/relog.png';
import calendario from '../assets/calendario.png';
import cancelar from "../assets/cancelar.png";
//Pantalla de perfil
const Perfil = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    } else {
      console.error('Error al cerrar sesión:', result.error);
    }
  };

  const handleSavesClick = (e) => {
    e.preventDefault();
    navigate('/orderdetails');
  };

  return (
    <>
      <Header />

      <div className="p-4 md:p-10 bg-white min-h-screen font-poppins max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Configuración</h1>
            <p className="text-sm text-gray-500 mt-2">Administra tu información personal y preferencias</p>
          </div>
          <Button className="hover:bg-pink-400 text-white flex items-center text-sm px-4 py-2" style={{ backgroundColor: '#E8ACD2' }}>
            <FaEdit className="mr-2" /> Editar perfil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información personal */}
          <Card className="p-6">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4">Información personal</h2>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 mb-3"></div>
              <p className="font-bold">Bryan Miranda</p>
              <p className="text-xs text-gray-500 mb-3">Miembro desde 2024</p>
              <SeparatorPerfil />
              <div className="text-sm text-left w-full space-y-4 mt-4">
                <div className="flex items-start gap-2">
                  <img src={correo} alt="correo" className="w-5 h-5 mt-1" />
                  <p>bryanmiranda005@gmail.com</p>
                </div>
                <div className="flex items-start gap-2">
                  <img src={telefono} alt="telefono" className="w-5 h-5 mt-1" />
                  <p>+503 1234-0795</p>
                </div>
                <div className="flex items-start gap-2">
                  <img src={ubicacion} alt="ubicacion" className="w-5 h-5 mt-1" />
                  <p>Jardines del escorial, calle bienestar casa 15A, San Salvador San Salvador</p>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg md:text-xl">Resumen</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="text-center rounded-xl p-4 flex-1" style={{ backgroundColor: '#E8ACD2' }}>
                  <img src={regalo} alt="regalo" className="mx-auto w-6 mb-1" />
                  <p className="text-xs text-white">Pedidos totales</p>
                  <p className="text-white text-xl font-bold">12</p>
                </div>
                <div className="text-center rounded-xl p-4 flex-1" style={{ backgroundColor: '#E8ACD2' }}>
                  <img src={relog} alt="relog" className="mx-auto w-6 mb-1" />
                  <p className="text-xs text-white">Pedidos pendientes</p>
                  <p className="text-white text-xl font-bold">3</p>
                </div>
                <div className="text-center rounded-xl p-4 flex-1" style={{ backgroundColor: '#E8ACD2' }}>
                  <img src={cancelar} alt="cancelar" className="mx-auto w-6 mb-1" />
                  <p className="text-xs text-white">Pedidos cancelados</p>
                  <p className="text-white text-xl font-bold">5</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button style={{ backgroundColor: '#E8ACD2' }} className="hover:bg-pink-400 text-white w-full py-2 text-sm md:text-base" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </Card>

          {/* Tabs contenido */}
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
                      {[{
                        id: 1234,
                        date: '05/05/2025',
                        productos: 3,
                        total: '$144,00',
                        estado: 'Preparando',
                        cancelable: '07/05/2025'
                      }, {
                        id: 5692,
                        date: '02/05/2025',
                        productos: 6,
                        total: '$375,00',
                        estado: 'Entregado',
                        cancelable: '04/05/2025'
                      }, {
                        id: 5234,
                        date: '29/04/2025',
                        productos: 2,
                        total: '$120,00',
                        estado: 'En camino',
                        cancelable: '01/05/2025'
                      }].map((pedido, idx) => (
                        <Card key={idx} className="border border-gray-200">
                          <div className="p-4 space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm sm:text-base">Pedido #{pedido.id}</p>
                                <p className="text-xs text-gray-500">Realizado el {pedido.date}</p>
                              </div>
                              <span className="text-pink-500 border border-pink-300 px-2 py-0.5 rounded-full text-xs h-fit">
                                {pedido.estado}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1">
                              <span>{pedido.productos} productos · Total: {pedido.total}</span>
                              <div className="flex items-center gap-1">
                                <img src={calendario} alt="calendario" className="w-4 h-4" />
                                <span>Cancelable hasta: {pedido.cancelable}</span>
                              </div>
                            </div>
                            <Button className="w-full hover:bg-pink-400 text-white py-2 text-sm" onClick={handleSavesClick} style={{ backgroundColor: '#E8ACD2' }}>
                              Detalles pedidos
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="descuentos">
                    <p className="text-2xl md:text-3xl font-medium mb-4">Mis códigos de descuento</p>
                    <div className="flex flex-col gap-4">
                      {[
                        {
                          titulo: "Verano 2025",
                          descuento: "25% OFF",
                          estado: "Activo",
                          color: "bg-pink-100 text-pink-500",
                          codigo: "326985",
                          vence: "30 de agosto, 2025"
                        },
                        {
                          titulo: "Ruleta marquesa",
                          descuento: "10% OFF",
                          estado: "Utilizado",
                          color: "bg-gray-100 text-gray-400",
                          codigo: "842034",
                          vence: "8 de abril, 2025"
                        },
                        {
                          titulo: "Primavera 2025",
                          descuento: "10% OFF",
                          estado: "Caducado",
                          color: "bg-gray-100 text-gray-400",
                          codigo: "659274",
                          vence: "2 de abril, 2025"
                        }
                      ].map((cupon, index) => (
                        <Card key={index} className="p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-lg">{cupon.titulo}</p>
                              <p className="text-sm text-gray-500">Válido hasta: {cupon.vence}</p>
                              <p className="text-sm text-gray-500">Código: {cupon.codigo}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border border-pink-300 ${cupon.color}`}>
                                {cupon.descuento}
                              </span>
                              <span className="text-xs text-pink-500">{cupon.estado}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;

import Header from "../components/Header/Header";
import React, { useState, useEffect } from "react";
import { Card } from '../components/Card';
import { Button } from '../components/ButtonRosa';
import { FaEdit } from 'react-icons/fa';
import Tabs, { TabsList, TabsTrigger } from '../components/Tabs';
import SeparatorPerfil from '../components/SeparadorPerfil';

// Imágenes
import correo from '../assets/CorreoMarqueza.png';
import telefono from '../assets/TelefonoMarqueza.png';
import ubicacion from '../assets/ubicacion.png';
import regalo from '../assets/Regalo.png';
import relog from '../assets/relog.png';
import calendario from '../assets/calendario.png';
import cancelar from "../assets/cancelar.png"

const perfil = () => {
  return (
    <div className="p-6 md:p-10 bg-white min-h-screen font-sans max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Configuración</h1>
          <p className="text-sm text-gray-500">Administra tu información personal y preferencias</p>
        </div>
        <Button className="bg-pink-300 hover:bg-pink-400 text-white flex items-center">
          <FaEdit className="mr-2" /> Editar perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-4xl font-semibold mb-4">Información personal</h2>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gray-300 mb-3"></div>
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
                <p>Jardines del escorial, calle bienestar casa 15A, San Salvador San salvador</p>
              </div>
            </div>
          </div>

      
          <div className="mt-8">
            <h3 className="font-semibold text-gray-800 mb-3  text-lg" >Resumen</h3>
            <div className="flex gap-3">
              <div className="flex-1 text-center bg-pink-200 rounded-xl p-4">
                <img src={regalo} alt="regalo" className="mx-auto w-6 mb-1" />
                <p className="text-xs text-white">Pedidos totales</p>
                <p className="text-white text-xl font-bold">12</p>
              </div>
              <div className="flex-1 text-center bg-pink-200 rounded-xl p-4">
                <img src={relog} alt="relog" className="mx-auto w-6 mb-1" />
                <p className="text-xs text-white">Pedidos pendientes</p>
                <p className="text-white text-xl font-bold">3</p>
              </div>
              <div className="flex-1 text-center bg-pink-200 rounded-xl p-4">
                <img src={cancelar} alt="calendario" className="mx-auto w-6 mb-1" />
                <p className="text-xs text-white">Pedidos cancelados</p>
                <p className="text-white text-xl font-bold">5</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button className="bg-pink-300 hover:bg-pink-400 text-white w-full">Cerrar sesión</Button>
          </div>
        </Card>

        <div className="md:col-span-2">
          <Card className="p-6">
            <Tabs defaultValue="pedidos">
              <TabsList className="bg-gray-100 p-1 rounded-full w-fit mx-auto border border-pink-200">
                <TabsTrigger value="pedidos" className="px-5 py-2 rounded-full text-sm text-center font-medium data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                  Pedidos
                </TabsTrigger>
                <TabsTrigger value="descuentos" className="px-5 py-2 rounded-full text-center text-sm font-medium data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                  Códigos de descuento
                </TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <p className="text-3xl font-medium italic mb-2">Mis pedidos recientes</p>
                <div className="text-right mb-2">
                  <Button variant="ghost" className="text-pink-400 hover:text-pink-600">Ver todos {'>'}</Button>
                </div>
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
                  <Card key={idx} className="mb-4 border border-gray-200">
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">Pedido #{pedido.id}</p>
                          <p className="text-xs text-gray-500">Realizado el {pedido.date}</p>
                        </div>
                        <span className="text-pink-500 border border-pink-300 px-2 py-0.5 rounded-full text-xs h-fit mt-2">
                          {pedido.estado}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{pedido.productos} productos · Total: {pedido.total}</span>
                        <div className="flex items-center gap-1">
                          <img src={calendario} alt="calendario" className="w-4 h-4" />
                          <span>Cancelable hasta: {pedido.cancelable}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-pink-300 hover:bg-pink-400 text-white">
                        Detalles pedidos
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default perfil;

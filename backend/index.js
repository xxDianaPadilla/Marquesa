// Importa la aplicación principal desde el archivo app.js
import app from "./app.js";
 
// Importa y ejecuta la configuración de la base de datos
import "./database.js";
 
// Importa la configuración del servidor desde el archivo de configuración
import {config} from "./src/config.js";
 
// Importar dependencias para Socket.IO
import { createServer } from 'http';
import { Server } from 'socket.io';
 
// Importar la configuración de Socket.IO
import { setupSocketIO } from './src/utils/socketConfig.js';
 
// Función principal asíncrona que inicia el servidor
async function main(){
   try {
       // Crear servidor HTTP
       const httpServer = createServer(app);
       
       // ✅ CORRECCIÓN: Configurar Socket.IO con CORS corregido
       const io = new Server(httpServer, {
           cors: {
                // ✅ FIX CRÍTICO: URL corregida para coincidir con el frontend
                origin: ["https://marquesa.vercel.app", "http://localhost:3000"],
                credentials: true, // Permite envío de cookies entre dominios
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
                allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
           },
           // ✅ CORRECCIÓN: Configuración mejorada de transports
           transports: ['websocket', 'polling'],
           // ✅ NUEVO: Configuraciones adicionales para estabilidad
           pingTimeout: 60000,
           pingInterval: 25000,
           upgradeTimeout: 30000,
           maxHttpBufferSize: 1e6,
           // ✅ NUEVO: Configuración de conexión
           connectTimeout: 45000,
           // ✅ NUEVO: Permitir reconexión
           allowEIO3: true
       });
 
       // ✅ CORRECCIÓN: Configurar los eventos de Socket.IO con mejor logging
       console.log('🔧 Configurando Socket.IO...');
       setupSocketIO(io);
       
       // Hacer io accesible globalmente para uso en controladores
       app.set('io', io);
       
       // ✅ NUEVO: Logging mejorado para debugging
       io.engine.on("connection_error", (err) => {
           console.log('❌ Socket.IO connection error:', err.req);
           console.log('❌ Error code:', err.code);
           console.log('❌ Error message:', err.message);
           console.log('❌ Error context:', err.context);
       });
 
       // ✅ NUEVO: Monitoring de conexiones
       io.on('connection', (socket) => {
           console.log(`✅ Cliente conectado: ${socket.id}`);
           
           socket.on('disconnect', (reason) => {
               console.log(`❌ Cliente desconectado: ${socket.id}, razón: ${reason}`);
           });
       });
       
       // Inicia el servidor en el puerto especificado en la configuración
       httpServer.listen(config.server.port, () => {
           console.log("✅ Server on port " + config.server.port);
           console.log("✅ Socket.IO server running with CORS origin: https://marquesa.vercel.app");
           console.log("✅ Transports disponibles: websocket, polling");
       });
       
   } catch (error) {
       console.error('❌ Error iniciando servidor:', error);
       process.exit(1);
   }
}
 
// Ejecuta la función principal para iniciar el servidor
main();
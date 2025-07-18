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
       
       // Configurar Socket.IO con CORS
       const io = new Server(httpServer, {
           cors: {
               origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
               methods: ["GET", "POST", "PUT", "DELETE"],
               credentials: true
           },
           transports: ['websocket', 'polling']
       });

       // Configurar los eventos de Socket.IO
       setupSocketIO(io);
       
       // Hacer io accesible globalmente para uso en controladores
       app.set('io', io);
       
       // Inicia el servidor en el puerto especificado en la configuración
       httpServer.listen(config.server.port, () => {
           console.log("Server on port " + config.server.port);
           console.log("Socket.IO server running");
       });
       
   } catch (error) {
       console.error('Error iniciando servidor:', error);
       process.exit(1);
   }
}

// Ejecuta la función principal para iniciar el servidor
main();
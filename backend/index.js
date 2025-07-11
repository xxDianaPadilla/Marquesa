// Importa la aplicación principal desde el archivo app.js
import app from "./app.js";

// Importa y ejecuta la configuración de la base de datos
import "./database.js";

// Importa la configuración del servidor desde el archivo de configuración
import {config} from "./src/config.js";

// Función principal asíncrona que inicia el servidor
async function main(){
   // Inicia el servidor en el puerto especificado en la configuración
   app.listen(config.server.port);
   
   // Muestra un mensaje en la consola confirmando que el servidor está ejecutándose
   console.log("Server on port " + config.server.port);
}

// Ejecuta la función principal para iniciar el servidor
main();
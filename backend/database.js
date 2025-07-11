// Importa Mongoose para la conexión y manejo de MongoDB
import mongoose from "mongoose";

// Importa la configuración que contiene la URI de la base de datos
import {config} from './src/config.js';

// Establece la conexión a MongoDB usando la URI desde la configuración
mongoose.connect(config.db.uri);

// Obtiene la referencia a la conexión de la base de datos
const connection = mongoose.connection;

// Evento que se ejecuta una sola vez cuando la conexión se abre exitosamente
connection.once("open", () => {
   console.log("DB is connected");
});

// Evento que se ejecuta cuando la base de datos se desconecta
connection.on("disconnected", () => {
   console.log("DB is disconnected");
});

// Evento que se ejecuta cuando ocurre un error en la conexión
connection.on("error", (error) => {
   console.log("Error en la conexión", error);
});
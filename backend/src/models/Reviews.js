// Importamos Schema y model de mongoose para crear el modelo de base de datos
import { Schema, model } from "mongoose";

// Definimos el esquema para las reseñas de productos
const reviewsSchema = new Schema({
    // ID del cliente que hace la reseña
    clientId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    // Array de productos sobre los que se hace la reseña
    products: [
        {
            // Tipo de producto: regular o personalizado
            itemType: {
                type: String,
                enum: ["product", "custom"],
                required: true
            },
            // ID del producto específico
            itemId: {
                type: Schema.Types.ObjectId,
                required: true,
                refPath: "products.itemTypeRef"  // Referencia dinámica basada en itemTypeRef
            },
            // Nombre de la colección a la que hace referencia itemId
            itemTypeRef: {
                type: String,
                required: true,
                enum: ["products", "CustomProducts"]
            },
        }
    ],
    // Calificación del producto (1 a 5 estrellas)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    // Mensaje de la reseña del cliente (mínimo 10 caracteres)
    message: {
        type: String,
        required: true,
        minLength: 10
    },
    // Respuesta del negocio a la reseña (opcional, mínimo 10 caracteres si se proporciona)
    response: {
        type: String,
        default: null ,
        minLength: 10
    },
    // Estado de la reseña: pendiente o respondida
    status: {
        type: String,
        enum: ['pending', 'replied'],
        default: 'pending'
    }
}, {
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true,
    // Permite campos adicionales no definidos en el esquema
    strict: false
});

// Exportamos el modelo de reseñas
export default model("Reviews", reviewsSchema);
// Importamos Schema y model de mongoose para crear el modelo de base de datos
import { Schema, model } from "mongoose";

// Definimos el esquema para productos personalizados/customizados
const customProductsSchema = new Schema({
    // ID del cliente que solicita el producto personalizado
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "Clients",
        required: true
    },
    // Categoría del producto personalizado
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    // Array de productos base seleccionados para la personalización
    selectedItems: [
        {
            // ID del producto base a personalizar
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            // Cantidad del producto (opcional, mínimo 1 si se especifica)
            quantity: {
                type: Number,
                required: false,
                min: 1
            }
        }
    ],
    // Imagen de referencia para la personalización (opcional)
    referenceImage: {
        type: String,
        required: false
    },
    // Comentarios adicionales del cliente sobre la personalización (opcional, mínimo 10 caracteres)
    extraComments: {
        type: String,
        required: false,
        minLength: 10
    },
    // Precio total del producto personalizado (no puede ser negativo)
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "El total no puede ser negativo"]
    }
}, {
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true,
    // Permite campos adicionales no definidos en el esquema
    strict: false
});

// Exportamos el modelo de productos personalizados
export default model("CustomProducts", customProductsSchema);
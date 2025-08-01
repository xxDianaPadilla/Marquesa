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
    // Tipo de producto a personalizar (reemplaza categoryId)
    productToPersonalize: {
        type: String,
        required: true,
        enum: ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"]
    },
    // Array de materiales seleccionados para la personalización
    selectedMaterials: [
        {
            // ID del material personalizado seleccionado
            materialId: {
                type: Schema.Types.ObjectId,
                ref: "CustomProductsMaterial",
                required: true
            },
            // Cantidad del material (opcional, mínimo 1 si se especifica)
            quantity: {
                type: Number,
                required: false,
                min: 1,
                default: 1
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
    },
}, {
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true,
    // Permite campos adicionales no definidos en el esquema
    strict: false
});

export default model("CustomProducts", customProductsSchema);
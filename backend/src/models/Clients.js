// Importar Schema y model de mongoose para crear el modelo de base de datos
import { Schema, model } from "mongoose";

// Definir el esquema para la colección de clientes
const clientsSchema = new Schema({
    // Nombre completo del cliente - campo obligatorio con mínimo 10 caracteres
    fullName: {
        type: String,
        required: true,
        minLength: 10
    },
    // Número de teléfono del cliente - campo obligatorio con mínimo 9 caracteres
    phone: {
        type: String,
        required: true,
        minLength: 9
    },
    // Fecha de nacimiento del cliente - campo obligatorio
    birthDate: {
        type: Date,
        required: true
    },
    // Correo electrónico del cliente - campo obligatorio
    email: {
        type: String,
        required: true
    },
    // Contraseña del cliente - campo obligatorio con mínimo 8 caracteres
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    // Dirección del cliente - campo obligatorio con mínimo 10 caracteres
    address: {
        type: String,
        required: true,
        minLength: 10
    },
    // Array de productos favoritos del cliente
    favorites: [
        {
            // ID del producto favorito que hace referencia a la colección "products"
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: false
            }
        }
    ],
    // Descuento aplicable al cliente - campo opcional
    discount: {
        type: String,
        required: false
    },
    // URL o ruta de la foto de perfil del cliente - campo opcional
    profilePicture: {
        type: String,
        required: false
    },
    // NUEVO: Array de códigos de descuento generados por la ruleta
    ruletaCodes: [
        {
            // ID único del código generado
            codeId: {
                type: String,
                required: true
            },
            // Código alfanumérico de 6 dígitos
            code: {
                type: String,
                required: true
            },
            // Nombre descriptivo del descuento (ej: "Verano 2025")
            name: {
                type: String,
                required: true
            },
            // Porcentaje de descuento (ej: "25% OFF")
            discount: {
                type: String,
                required: true
            },
            // Color de fondo para mostrar en la UI
            color: {
                type: String,
                required: true
            },
            // Color del texto para la UI
            textColor: {
                type: String,
                required: true
            },
            // Estado del código: 'active', 'used', 'expired'
            status: {
                type: String,
                enum: ['active', 'used', 'expired'],
                default: 'active'
            },
            // Fecha de creación del código
            createdAt: {
                type: Date,
                default: Date.now
            },
            // Fecha de expiración del código
            expiresAt: {
                type: Date,
                required: true
            },
            // Fecha de uso del código (solo si status = 'used')
            usedAt: {
                type: Date,
                required: false
            },
            // ID del pedido donde se utilizó (solo si status = 'used')
            usedInOrderId: {
                type: Schema.Types.ObjectId,
                required: false
            }
        }
    ]
}, {
    // Agregar automáticamente campos createdAt y updatedAt
    timestamps: true,
    // Permitir campos que no están definidos en el esquema
    strict: false
});

// Exportar el modelo "Clients" basado en el esquema definido
export default model("Clients", clientsSchema);
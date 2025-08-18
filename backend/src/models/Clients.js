// Importación de Schema y model desde mongoose para definir el esquema de la base de datos
import { Schema, model } from "mongoose";

// Definición del esquema para la colección de clientes
const clientsSchema = new Schema({
    // Nombre completo del cliente
    fullName: {
        type: String,
        required: true,
        minLength: 10 // Mínimo 10 caracteres para asegurar nombre y apellido
    },
    // Número de teléfono del cliente
    phone: {
        type: String,
        required: true,
        minLength: 9 // Mínimo 9 dígitos para números telefónicos válidos
    },
    // Fecha de nacimiento del cliente
    birthDate: {
        type: Date,
        required: true
    },
    // Correo electrónico del cliente
    email: {
        type: String,
        required: true
    },
    // Contraseña del cliente (debe estar hasheada antes de guardar)
    password: {
        type: String,
        required: true,
        minLength: 8 // Mínimo 8 caracteres para seguridad
    },
    // Dirección física del cliente
    address: {
        type: String,
        required: true,
        minLength: 10 // Mínimo 10 caracteres para dirección completa
    },
    // Array de productos favoritos del cliente
    favorites: [
        {
            // ID del producto marcado como favorito
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products", // Referencia a la colección de productos
                required: false
            }
        }
    ],
    // Descuento general aplicable al cliente
    discount: {
        type: String,
        required: false
    },
    // URL o path de la imagen de perfil del cliente
    profilePicture: {
        type: String,
        required: false
    },
    // Array de códigos de la ruleta de descuentos
    ruletaCodes: [
        {
            // ID único del código de la ruleta
            codeId: {
                type: String,
                required: true,
                index: true // Índice para búsquedas rápidas
            },
            // Código alfanumérico generado por la ruleta
            code: {
                type: String,
                required: true,
                index: true // Índice para búsquedas rápidas
            },
            // Nombre descriptivo del premio/descuento
            name: {
                type: String,
                required: true
            },
            // Porcentaje o valor del descuento obtenido
            discount: {
                type: String,
                required: true
            },
            // Color de fondo del segmento de la ruleta
            color: {
                type: String,
                required: true
            },
            // Color del texto del segmento de la ruleta
            textColor: {
                type: String,
                required: true
            },
            // Estado actual del código
            status: {
                type: String,
                enum: ['active', 'used', 'expired'], // Solo permite estos 3 valores
                default: 'active',
                index: true // Índice para filtrar por estado
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
            // Fecha en que se utilizó el código (si aplica)
            usedAt: {
                type: Date,
                required: false
            },
            // ID de la orden en la que se utilizó el código
            usedInOrderId: {
                type: Schema.Types.Mixed, // Permite diferentes tipos de datos
                required: false
            }
        }
    ]
}, {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    strict: false     // Permite campos no definidos en el schema
});

// Índices compuestos para mejor performance en consultas
clientsSchema.index({ "ruletaCodes.codeId": 1, "ruletaCodes.status": 1 });
clientsSchema.index({ "ruletaCodes.code": 1, "ruletaCodes.status": 1 });

// ✅ NUEVO ÍNDICE para Google ID (autenticación con Google)
clientsSchema.index({ googleId: 1 }, { sparse: true }); // sparse: true ignora documentos sin googleId

// Exportación del modelo basado en el esquema
export default model("Clients", clientsSchema);
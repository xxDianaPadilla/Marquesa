// Importamos Schema y model de mongoose para crear el modelo de base de datos
import { Schema, model } from "mongoose";

// Definimos el esquema para las ventas
const salesSchema = new Schema({
    // Tipo de pago con opciones predefinidas
    paymentType: {
        type: String,
        enum: {
            values: ["Transferencia", "Débito", "Crédito"],
            message: "El método de pago debe ser 'Transferencia', 'Débito' o 'Crédito'"
        }
    },
    // Imagen del comprobante de pago (obligatorio menos en la opción de pago en credito y débito)
    paymentProofImage: {
        type: String,
        required: false,
        validate: { 
            validator: function(value) {
                // Solo es obligatorio si el tipo de pago no es 'Crédito' o 'Débito'
                return this.paymentType !== "Crédito" && this.paymentType !== "Débito" ? value != null : true;
            },
            message: "La imagen del comprobante de pago es obligatoria para Transferencia"
        }   
    },
    // Estado del pago de la venta, por defecto "Pendiente"
    status: {
        type: String,
        enum: {
            values: ["Pendiente", "Pagado"],
            message: "El estado de la venta debe 'Pendiente' o 'Pagado'"
        },
        default: "Pendiente",
    },
    // Estado de seguimiento del envío, por defecto "Agendado"
    trackingStatus: {
        type: String,
        enum: {
            values: ["Agendado", "En proceso", "Entregado"],
            message: "El estado de seguimiento de la venta debe 'Agendado', 'En proceso' o 'Entregado'"
        },
        default: "Agendado",
    },
    // Dirección de entrega (mínimo 20 caracteres)
    deliveryAddress: {
        type: String,
        required: true,
        minLength: 20
    },
    // Nombre de la persona que recibe el pedido (mínimo 12 caracteres)
    receiverName: {
        type: String,
        required: true,
        minLength: 12
    },
    // Teléfono del receptor (exactamente 9 dígitos)
    receiverPhone: {
        type: String,
        required: true,
        minLength: 9,
        maxLength: 9
    },
    // Punto de referencia para la entrega (mínimo 20 caracteres)
    deliveryPoint: {
        type: String,
        required: true,
        minLength: 20
    },
    // Fecha programada para la entrega
    deliveryDate: {
        type: Date,
        required: true
    },
    // Referencia al carrito de compras asociado a esta venta
    ShoppingCartId: {
        type: Schema.Types.ObjectId,
        ref: "ShoppingCart",
        required: true
    }
}, {
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true,
    // Permite campos adicionales no definidos en el esquema
    strict: false
});

// Exportamos el modelo de ventas
export default model("Sales", salesSchema);
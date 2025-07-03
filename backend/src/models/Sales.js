import { Schema, model } from "mongoose";

const salesSchema = new Schema({
    paymentType: {
        type: String,
        enum: {
            values: ["Transferencia", "Efectivo", "Débito", "Crédito"],
            message: "El método de pago debe ser 'Transferencia', 'Efectivo', 'Débito' o 'Crédito'"
        },
        default: "Efectivo",
    },
    paymentProofImage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["Pendiente", "Pagado"],
            message: "El estado de la venta debe 'Pendiente' o 'Pagado'"
        },
        default: "Pendiente",
    },
    trackingStatus: {
        type: String,
        enum: {
            values: ["Agendado", "En proceso", "Entregado"],
            message: "El estado de seguimiento de la venta debe 'Agendado', 'En proceso' o 'Entregado'"
        },
        default: "Agendado",
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    receiverPhone: {
        type: String,
        required: true
    },
    deliveryPoint: {
        type: String,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    ShoppingCartId: {
        type: Schema.Types.ObjectId,
        ref: "ShoppingCart",
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Sales", salesSchema);
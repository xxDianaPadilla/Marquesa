import { Schema, model } from "mongoose";
 
const clientsSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 10
    },
    phone: {
        type: String,
        required: true,
        minLength: 9
    },
    birthDate: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    address: {
        type: String,
        required: true,
        minLength: 10
    },
    favorites: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: false
            }
        }
    ],
    discount: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String,
        required: false
    },
    ruletaCodes: [
        {
            codeId: {
                type: String,
                required: true,
                index: true  
            },
            code: {
                type: String,
                required: true,
                index: true  
            },
            name: {
                type: String,
                required: true
            },
            discount: {
                type: String,
                required: true
            },
            color: {
                type: String,
                required: true
            },
            textColor: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ['active', 'used', 'expired'],
                default: 'active',
                index: true  
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                required: true
            },
            usedAt: {
                type: Date,
                required: false
            },
            usedInOrderId: {
                type: Schema.Types.Mixed,  
                required: false
            }
        }
    ]
}, {
    timestamps: true,
    strict: false
});
 
// Índices compuestos para mejor performance
clientsSchema.index({ "ruletaCodes.codeId": 1, "ruletaCodes.status": 1 });
clientsSchema.index({ "ruletaCodes.code": 1, "ruletaCodes.status": 1 });
 
// ✅ NUEVO ÍNDICE para Google ID
clientsSchema.index({ googleId: 1 }, { sparse: true });
 
export default model("Clients", clientsSchema);
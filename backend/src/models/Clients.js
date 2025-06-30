import {Schema, model} from "mongoose";

const clientsSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
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
        required: true
    },
    address: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Clients", clientsSchema);
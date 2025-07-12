import {Schema, model} from "mongoose";

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
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Clients", clientsSchema);
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../../types';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document { }

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    productImage: {
        type: String,
        required: true
    }
})

export default mongoose.model<IProductDocument>('Products', ProductSchema);
import mongoose from "mongoose";

export enum UserType {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    SUPERADMIN = 'SUPERADMIN'
}

export interface IUser {
    _id: string;
    type: UserType;
    email: string;
    password: string;
    products: string[];
    resetToken?: string;
    resetTokenExpiration?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export interface ISession {
    token: string;
    userId: string;
    expires: Date;
} 

export interface IProduct {
    name: string;
    price: string;
    description: string;
    seller?: mongoose.Schema.Types.ObjectId;
    productImage: string;
}
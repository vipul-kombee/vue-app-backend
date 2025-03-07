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
import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    isEmailVerified: boolean,
    isActive: boolean,
    loginAttempts: number,
    lockUntil?: Date,
    tokenVersion: number,
    lastLoginAt?: Date,
    isLocked: boolean,
    createdAt: Date,
    updatedAt: Date
}


const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
        },
        password: {
            type: String,
            select: false
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date
        },
        tokenVersion: {
            type: Number,
            default: 0
        },
        lastLoginAt: {
            type: Date,
        },
    }, {
    timestamps: true
}
)

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > new Date())
})
export const User = mongoose.model<IUser>("User", UserSchema);
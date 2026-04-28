import { User } from "../models/User.js"
import { LoginInput, RegisterInput, ResetPasswordInput } from "../modules/auth/auth.validation.js";
import AppError from "../utils/customError.js";
import { sendEmail } from "../utils/email.js";
import { hashing } from "../utils/hashing.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import crypto from "crypto";





export const registerUser = async (payload: RegisterInput) => {
    const { name, email, password } = payload;

    const exists = await User.findOne({ email });
    if (exists) throw new AppError("Email already registered", 409);

    const hashed = await hashPassword(password);
    return await User.create({ name, email, password: hashed });
}


export const loginUser = async (payload: LoginInput) => {
    const { email, password } = payload;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
        throw new AppError("Invalid email or password", 401);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
        throw new AppError("Account temporarily locked. Try again later.", 423);
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        const updated = await User.findOneAndUpdate(
            { _id: user._id },
            { $inc: { loginAttempts: 1 } },
            { new: true }
        );

        if (updated && updated.loginAttempts >= 5) {
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        lockUntil: new Date(Date.now() + 15 * 60 * 1000)
                    }
                }
            );
        }

        throw new AppError("Invalid email or password", 401);
    }

    await User.updateOne(
        { _id: user._id },
        {
            $set: { loginAttempts: 0, lastLoginAt: new Date() },
            $unset: { lockUntil: "" }
        }
    );

    const accessToken = generateAccessToken({ userId: user.id, tokenVersion: user.tokenVersion })
    const refreshToken = generateRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion })

    user.password = undefined;
    return { user, accessToken, refreshToken };
};


export const logoutUser = async (userId: string): Promise<void> => {
    await User.updateOne(
        { _id: userId },
        { $inc: { tokenVersion: 1 } }
    );
};


export const refreshToken = async (token: string) => {
    const { userId, tokenVersion } = verifyRefreshToken(token);

    const user = await User.findById(userId);

    if (!user) throw new AppError("User not found", 403);

    if (user.tokenVersion !== tokenVersion) throw new AppError("Token Revoked", 401);

    if (!user.isActive) throw new AppError("Account has been deactivated", 403)

    const accessToken = generateAccessToken({ userId: user.id, tokenVersion: user.tokenVersion });
    return { accessToken }
}


export const forgotPassword = async (email: string) => {
    const isEmailExist = await User.findOne({ email });

    if (!isEmailExist) return

    const token = crypto.randomBytes(32).toString("hex");



    const hashedToken = hashing(token);



    isEmailExist.passwordResetToken = hashedToken;
    isEmailExist.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await isEmailExist.save();
    console.log("Sending email to:", email);
    console.log("Token:", token);

    await sendEmail({ to: email, subject: "Password Reset", html: `<p> Reset your password ${token}</p>` });
}


export const resetPassword = async (payload: ResetPasswordInput) => {
    const { token, password } = payload;


    const hashedPassword = hashing(token);
    const user = await User.findOne({ passwordResetToken: hashedPassword });

    if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new AppError("Reset token has expired", 400);
    }

    user.password = await hashPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
}
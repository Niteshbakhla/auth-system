import { User } from "../models/User.js"
import { LoginInput, RegisterInput } from "../modules/auth/auth.validation.js";
import AppError from "../utils/customError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";





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
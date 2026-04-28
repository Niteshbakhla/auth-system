import { Request, Response } from "express"

import { forgotPassword, loginUser, logoutUser, refreshToken as refreshTokenService, registerUser, resetPassword } from "../services/auth.services.js"
import asyncHandler from "../utils/asynchHandler.js";
import AppError from "../utils/customError.js";






export const registerController = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await registerUser(req.body);
        res.status(201).json({ success: true, message: "Registered successfully", data: user })
    }
)

export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
        const { user, accessToken, refreshToken } = await loginUser(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user
        });
    }
)


export const logoutController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        await logoutUser(userId);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    }
)


export const refreshTokenController = asyncHandler(
    async (req, res, next) => {
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new AppError("Token not found", 401);
        }

        const { accessToken } = await refreshTokenService(token);
        res.status(200).json({ success: true, accessToken });
    }
)

export const forgetPassowrdController = asyncHandler(
    async (req, res, next) => {
        await forgotPassword(req.body.email)
        res.status(200).json({ message: "Link sent to your email" })
    }
)

export const resetPasswordController = asyncHandler(
    async (req, res, next) => {
        await resetPassword(req.body);
        res.status(200).json({ message: "Password updated successfully" })
    }
)
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/env.js";

export interface TokenPayload {
    userId: string;
    tokenVersion: number;
}

// Access Token
export const generateAccessToken = (payload: TokenPayload) => {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
        expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
};

// Refresh Token
export const generateRefreshToken = (payload: TokenPayload) => {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
};

// Verify Access Token
export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;

        return decoded as TokenPayload;
    } catch (error) {
        throw new Error("Invalid or expired access token");
    }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;

        return decoded as TokenPayload;
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};
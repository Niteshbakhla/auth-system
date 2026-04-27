import { Request, Response, NextFunction } from "express"
import AppError from "../utils/customError.js";
import { verifyAccessToken } from "../utils/token.js";


export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Unauthorized", 401)
        }

        const token = authHeader.split(" ")[1];


        const decoded = verifyAccessToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        next(error)
    }
}


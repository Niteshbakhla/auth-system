import { Request, Response } from "express"

import { loginUser, registerUser } from "../services/auth.services.js"
import asyncHandler from "../utils/asynchHandler.js";




export const registerController = asyncHandler(
    async (req: Request, res: Response) => {

        const user = await registerUser(req.body);

        res.status(201).json({ message: "Register successfully", data: user })
    }
)


export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await loginUser(req.body);

        res.status(200).json({ message: "Login successfully", user })
    }
)
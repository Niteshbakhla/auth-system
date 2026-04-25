import { Router } from "express";
import authRoute from "./auth.routes.js"

const router = Router();

router.use("/user", authRoute)


export default router;
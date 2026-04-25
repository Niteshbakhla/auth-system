import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../modules/auth/auth.validation.js";
import validate from "../utils/validate.js";
const router = Router();


router.route("/register").post(validate(registerSchema), registerController);
router.route("/login").post(validate(loginSchema), loginController);

export default router;


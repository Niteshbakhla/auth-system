import { Router } from "express";
import { loginController, logoutController, refreshTokenController, registerController } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../modules/auth/auth.validation.js";
import validate from "../utils/validate.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();


router.route("/register").post(validate(registerSchema), registerController);
router.route("/login").post(validate(loginSchema), loginController);
router.route("/logout").post(protect, logoutController);
router.route("/refresh-token").post( refreshTokenController);

export default router;


import express, { Application, Request, Response, NextFunction } from 'express';
import indexRoutes from "./routes/index.js"
import cookieParser from 'cookie-parser'
import AppError from './utils/customError.js'
import helmet from "helmet";
import cors from "cors";
import { config } from './config/env.js';
import rateLimit from 'express-rate-limit';


const app: Application = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many request" }
})

app.use(helmet());
app.use(limiter)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true
}));

// MVC Routes go here

app.use("/api", indexRoutes)





// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({ success: false, message: err.message });
});





export default app;

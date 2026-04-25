import express, { Application, Request, Response, NextFunction } from 'express';
import indexRoutes from "./routes/index.js"
import cookieParser from 'cookie-parser'
import AppError from './utils/customError.js'


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// MVC Routes go here

app.use("/api",indexRoutes)





// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({ success: false, message: err.message });
});





export default app;

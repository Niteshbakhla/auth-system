import express, { Application, Request, Response, NextFunction } from 'express';
import indexRoutes from "./routes/index"
import cookieParser from 'cookie-parser'


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// MVC Routes go here

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ success: false, message: err.message });
});


app.use("/",indexRoutes)



export default app;

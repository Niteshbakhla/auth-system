import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object(
    {
        PORT: z.string().default("3000"),
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        MONGO_URI: z.string().min(1, "MONGO_URI is required"),
        JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
        JWT_REFRESH_SECRET:z.string().min(1,"JWT_SECRET_REFRESH is required"),
        JWT_ACCESS_EXPIRES_IN:z.string().default("15m"),
        JWT_REFRESH_EXPIRES_IN:z.string().default("7d")
    }
)

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("❌ Invalid enviroment variables:")
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const config = Object.freeze(parsed.data);

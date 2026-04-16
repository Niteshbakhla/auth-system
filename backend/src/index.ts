
import connectDB from "./config/db.js";
import app from "./app.js";
import { config } from "./config/env.js";



const PORT = config.PORT;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();



import connectDB from "./config/db";
import app from "./app";
import { config } from "./config/env";



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


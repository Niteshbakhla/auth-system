import mongoose from 'mongoose';
import { config } from './env';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('Database Connected Successfully');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Database connection failed:', error.message);
        } else {
            console.error('Database connection failed:', String(error));
        }
        process.exit(1);
    }
};

export default connectDB;

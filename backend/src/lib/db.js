import mongoose from 'mongoose';
import { ENV } from './env.js';

const connectDB = async (dbURL) => {
    try {
        mongoose.connect(ENV.DB_URL)
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

export default connectDB;
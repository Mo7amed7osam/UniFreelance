const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI (or MONGODB_URI) is not set');
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.name}`);
    } catch (error) {
        const message = error && error.message ? error.message : 'Unknown error';
        console.error(`Error: ${message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

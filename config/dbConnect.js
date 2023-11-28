import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        const DB_OPTION = {
            dbName: "geekshop"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTION);
        console.log("Database Conneted Successfully");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB
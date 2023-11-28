import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connetDB from './config/dbConnect.js';
import userRouter from './routes/user.route.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors());

// Database Connection
connetDB(DATABASE_URL);

// JSON
app.use(express.json());

// Load Routes
app.use("/api/user", userRouter);


app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`);
})
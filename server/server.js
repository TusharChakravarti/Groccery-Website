
import 'dotenv/config'; 
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = process.env.PORT || 8000;



// Initialize AI with your Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Connect to Services
await connectDB();
await connectCloudinary();

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://khaofresh-eta.vercel.app'];

// Stripe Webhook (must be before express.json)
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Middleware Configuration
app.use(express.json()); 
app.use(cookieParser());
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});


app.get('/', (req, res) => res.send('API is working!'));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

app.listen(port, () => {
    console.log(`PORT connected on ${port}`);
});


const { GoogleGenerativeAI } = require("@google/generative-ai");



app.post('/api/ai/recipe', async (req, res) => {
    try {
        const { ingredients } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        const prompt = `I have these ingredients: ${ingredients}. Suggest one simple Indian recipe I can make. Keep it short.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, recipe: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "AI is thinking..." });
    }
});
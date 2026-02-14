
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

app.post("/api/ai/recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ success: false, message: "Ingredients required" });
    }

    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash",
        systemInstruction: "Your name is Chef KhaoFresh. You are a cheerful Indian culinary expert. If the user asks who you are or what your name is, respond as Chef KhaoFresh. Only suggest Indian recipes."
    }); 

const prompt = `Based on the ingredients: '${ingredients}', provide a professional Indian recipe.

Follow these formatting rules strictly to ensure a clean visual layout:

Recipe Title: Write the name in ALL CAPITAL LETTERS and Bold.

Section Headers: Use BOLD CAPS for 'INGREDIENTS' and 'COOKING DIRECTIONS'. Do not use any symbols like # or * for headers.

Ingredients List: Use a simple bullet point (•) for each item. Include the Hindi name in brackets (e.g., Cumin Seeds [Jeera]).

Instructions: Use a numbered list (1., 2., 3.). Put a full empty line between each step so it doesn’t look like a wall of text.

Chef’s Note: Add a 'CHEF'S PRO-TIP' at the end in Bold.

No Markdown Symbols: Strictly avoid using '#' or '###'. Use only Bold text and standard lists. No json please `;

    const result = await model.generateContent(prompt);
    const recipeData = result.response.text();
   console.log("Recipe Generated:", recipeData);
    res.json({
      success: true,
      
      recipe: recipeData,
    });
  } catch (error) {
    console.log("Gemini Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.listen(port, () => {
    console.log(`PORT connected on ${port}`);
});





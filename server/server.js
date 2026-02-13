
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

const prompt = `The user provided these ingredients: "${ingredients}". 
    If these are valid ingredients, provide a short Indian recipe.
    Give the response in more formal way lie a chef in bullets wherever required. 
     Return the response STRICTLY as a JSON object with these keys: 
  "name", "prepTime", "ingredients" (array), and "instructions" (array).
  Do not include any markdown formatting like \`\`\`json. `;

    const result = await model.generateContent(prompt);
    const recipeData = JSON.parse(result.response.text());
   console.log(result.response.text());
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





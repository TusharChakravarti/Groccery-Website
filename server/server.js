
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
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

    const { message, history, images } = req.body; 

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }


    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `Your name is Chef KhaoFresh. You are a cheerful Indian culinary expert. 
      CRITICAL RULE:
      - Analyze any images provided. If it is a packaged food like Maggi, suggest a creative recipe using it.
     - If you are providing a recipe, you MUST return ONLY a JSON object. 
  - Do NOT include any intro text like "Acha-ji" or "Here is your recipe" inside the same message as a recipe.
  - Use these keys: "name", "prepTime", "ingredients", "instructions".
  - For ingredients, start each with '•' and put on a new line.
  - For instructions, number them and put double new lines between steps.
  
  - If the user is just chatting or asking a follow-up question, respond conversationally WITHOUT JSON.`
    }); 

    // Initialize the chat with the history received from the frontend
    const chat = model.startChat({
      history: history || [],
    });

    let payload = [];
    if (images && images.length>0) {

     images.forEach(img => {
        payload.push({
          inlineData: {
            data: img.data, 
            mimeType: img.mimeType
          }
        });
      });
        payload.push(message);
    } else {
   payload = message;
      
    }
    const result = await chat.sendMessage(payload);
    const responseText = result.response.text();


    let finalData;
    const cleanText = responseText.replace(/```json|```/g, "").trim();

    try {

      finalData = JSON.parse(cleanText);
    } catch (e) {
     
      finalData = cleanText;
    }

    res.json({
      success: true,
      recipe: finalData, 
    });

  } catch (error) {
    console.log("Gemini Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.listen(port, () => {
    console.log(`PORT connected on ${port}`);
});





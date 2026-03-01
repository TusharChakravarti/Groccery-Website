import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RecipeAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ 
    role: 'model', 
    text: "Namaste! 🧑‍🍳 I'm Chef KhaoFresh, your personal Indian culinary guide. Tell me what ingredients you have, and I'll help you whip up something delicious!",
    isRecipe: false 
  }]); 
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);


const [selectedImages, setSelectedImages] = useState([]); // To store the file for preview
const fileInputRef = useRef(null); // To trigger the hidden file input

// Helper to convert file to base64
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      data: reader.result.split(',')[1], // Extract raw base64
      mimeType: file.type
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

  const handleSend = async () => {
  if (!input.trim()&& !selectedImages) return;

 
  const currentInput = input;
  const currentImages = [...selectedImages];
  const finalMessageText = currentInput.trim() || "What can I make with this?";
  const userMsg = { role: "user", text: finalMessageText,imagePreview: currentImages.map(img => URL.createObjectURL(img))};
  const updatedMessages = [...messages, userMsg];

  setMessages(updatedMessages);
  setInput('');
  setSelectedImages([]);
  setLoading(true);

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
let imagePayload = [];
    if (currentImages.length>0) {
      imagePayload = await fileToGenerativePart(currentImages);
    }
  
    const firstUserIndex = updatedMessages.findIndex(m => m.role === 'user');

   
   const apiHistory = firstUserIndex !== -1 
        ? messages.slice(firstUserIndex).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: typeof m.text === 'object' ? JSON.stringify(m.text) : m.text }]
          }))
        : [];
    const { data } = await axios.post(`${backendUrl}/api/ai/recipe`, {
      message: finalMessageText, 
      history: apiHistory,
      images: imagePayload
    });

    let rawContent = data.recipe;
    let parsedRecipe = null;
    let isRecipe = false;

    if (typeof rawContent === 'string') {
      try {
        const cleanJson = rawContent.replace(/```json|```/g, "").trim();
        parsedRecipe = JSON.parse(cleanJson);
        isRecipe = true;
      } catch (e) {
        isRecipe = false;
      }
    } else if (typeof rawContent === 'object' && rawContent !== null) {
      parsedRecipe = rawContent;
      isRecipe = true;
    }

    setMessages(prev => [...prev, { 
      role: "model", 
      text: isRecipe ? parsedRecipe : rawContent,
      isRecipe: isRecipe
    }]);
  } catch (error) {
    console.error("Gemini Error:", error);
  } finally {
    setLoading(false);
  }
};

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);


  const [showBubble, setShowBubble] = useState(true);


  return (
    <>
     
<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
  
  
 
  {showBubble && !isOpen && (
    <div className="bg-white border border-green-100 text-gray-800 px-4 py-2 rounded-2xl shadow-xl text-sm font-medium animate-bounce-slow relative">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span>Namaste! Ask Chef KhaoFresh?</span>
        <button 
       
          onClick={(e) => { 
            e.stopPropagation();
            setShowBubble(false);
           }}
          className="text-gray-400 hover:text-gray-600 text-xl "
        >
          &times;
        </button>
      </div>
      {/* Small Triangle for the bubble */}
      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-white border-b-[6px] border-b-transparent"></div>
    </div>
  )}

  
  <button
    onClick={() => {
      setIsOpen(!isOpen)
      setShowBubble(false);
    }}
    className="p-4 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-700 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center group"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="28" r="12" fill="#F2C9A0"/>
      <path d="M20 22c-3 0-6-2.5-6-6s3-6 6-6c1-3 4-5 7-5 2 0 4 1 5 2.5C33 6 35 5 37 5c3 0 6 2 7 5 3 0 6 2.5 6 6s-3 6-6 6H20z" fill="white" stroke="#ddd" strokeWidth="2"/>
      <rect x="20" y="22" width="24" height="8" rx="2" fill="white" stroke="#ddd" strokeWidth="2"/>
      <path d="M18 54c0-8 6-14 14-14h0c8 0 14 6 14 14v4H18v-4z" fill="#4F46E5"/>
      <path d="M26 40l6 6 6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>

      {/* 2. OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* 3. CONVERSATIONAL SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-2xl transition-all duration-300 flex flex-col ${
          isOpen ? 'translate-x-0 w-full md:w-[400px] lg:w-[30%]' : 'translate-x-full w-0'
        }`}
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* Header */}
        <div className="p-4 bg-green-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧑‍🍳</span>
            <h2 className="text-lg font-bold">Chef KhaoFresh</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 text-sm italic">
              "Namaste! Type your ingredients to start cooking."
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
                {msg.imagePreview && msg.imagePreviews.length > 0 &&(
         <div className="flex flex-wrap gap-2 mb-2">
                    {msg.imagePreviews.map((previewUrl, i) => (
                      <img 
                        key={i}
                        src={previewUrl} 
                        className="w-full max-w-[48%] h-24 object-cover rounded-lg border border-black/10" 
                        alt={`Uploaded by user ${i}`} 
                      />
                    ))}
                  </div>
        )}
               {msg.isRecipe ? (
  <div className="animate-fadeIn">
   
    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
      {msg.text.name}
    </h2>
    
    <div className="bg-orange-50 p-2 rounded-lg mb-4 flex items-center">
      <span className="text-xs font-bold text-orange-700 uppercase">
        ⏱ PREP TIME : {msg.text.prepTime}
      </span>
    </div>

    <div className="space-y-4">
      <div>
        <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Ingredients</h3>
        <div className="whitespace-pre-line text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-green-500">
         
          {Array.isArray(msg.text.ingredients) 
            ? msg.text.ingredients.map(i => `${i}`).join('\n') 
            : msg.text.ingredients}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Instructions</h3>
        <div className="whitespace-pre-line text-sm text-gray-600 leading-relaxed">
           {Array.isArray(msg.text.instructions) 
            ? msg.text.instructions.map((step, i) => `${step}`).join('\n\n') 
            : msg.text.instructions}
        </div>
      </div>
    </div>
  </div>
) : (
  <div className="whitespace-pre-line">{msg.text}</div>
)}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-gray-400 animate-pulse ml-2">Chef is thinking...</div>}
        </div>





        {/* Input Bar */}
        <div className="p-4 border-t bg-white shrink-0">
          
          <div className="flex gap-2">

      <div className="flex flex-col border-2 border-gray-200 focus-within:border-green-500 rounded-2xl bg-white w-full max-w-2xl overflow-hidden transition-colors shadow-sm">
  
  {/* TOP ROW: Image Preview (Only shows if image exists) */}
  {selectedImages.length>0 && (
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
     {selectedImages.map((img, index) => (
      <div key={index} className="relative w-16 h-16 flex-shrink-0">
        <img 
          src={URL.createObjectURL(img)} 
          className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" 
          alt={`preview-${index}`}
        />
        <button 
          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition-colors"
        >
          &times;
        </button>
      </div>
     ))}
    </div>
  )}

  {/* BOTTOM ROW: Input Controls */}
  <div className="flex items-center px-2 sm:px-2 py-2">
    
    {/* Hidden File Input */}
    <input 
      type="file" 
      accept="image/*" 
      multiple
      ref={fileInputRef} 
onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 3);
                    setSelectedImages(prev => [...prev, ...files].slice(0, 3));
                  }}
      className="hidden" 
    />
    
    {/* Upload Button */}
    <button 
      onClick={() => fileInputRef.current.click()}
      className="p-2 text-gray-500 hover:text-green-600 transition-colors outline-none flex-shrink-0"
    >
      📷
    </button>

    {/* Vertical Divider */}
    <div className="h-6 w-[2px] bg-gray-200 mx-2"></div>

    {/* Text Input */}
    <input 
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      placeholder="Ask Chef KhaoFresh..."
      className="flex-1 min-w-0 p-2 outline-none text-sm bg-transparent"
    />

    {/* Send Button */}
    <button 
      onClick={handleSend}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl disabled:bg-gray-300 ml-1 sm:ml-2 flex-shrink-0 transition-colors shadow-sm"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
    
  </div>
</div>
              
           
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeAI;
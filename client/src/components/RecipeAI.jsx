import React, { useState } from 'react';
import axios from 'axios';

const RecipeAI = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const getRecipe = async () => {
    setLoading(true);
    try {
    
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      

       const { data } = await axios.post(`${backendUrl}/api/ai/recipe`, {
      ingredients,
    });

    setRecipe(data.recipe);

    } catch (error) {
        
        
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="p-6 border rounded-lg shadow-md bg-green-50 mt-10" style={{ fontFamily: "Outfit, sans-serif" }}>

      <h2 className="text-2xl font-bold text-primary mb-4">🧑‍🍳 Chef KhaoFresh</h2>
      <p className="mb-2 text-gray-600">Enter ingredients you have (e.g., Potato, Spinach):</p>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="What's in your fridge?"
        />
        <button 
          onClick={getRecipe}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Cooking..." : "Ask AI"}
        </button>
      </div>
{recipe && (
  <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
    
   
    <h2 className="text-2xl font-bold text-green-800 uppercase tracking-wide border-b-2 border-green-100 pb-2">
      {recipe.name}
    </h2>


    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-tighter">
      ⏱ Prep Time: {recipe.prepTime}
    </div>

 
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-tight">
        Ingredients
      </h3>
      <div className="whitespace-pre-line text-gray-700 leading-relaxed pl-1 border-l-4 border-green-500 bg-gray-50 p-4 rounded-r-lg">
        {recipe.ingredients}
      </div>
    </div>


    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-tight">
        Cooking Instructions
      </h3>
      <div className="whitespace-pre-line text-gray-700 leading-loose space-y-4">
        {recipe.instructions}
      </div>
    </div>

   
    <div className="mt-8 pt-4 border-t border-gray-100 text-center text-gray-400 italic text-sm">
      Authentic Indian Flavors • Prepared by Chef KhaoFresh.
    </div>
  </div>
)}
    </div>
  );
};

export default RecipeAI;





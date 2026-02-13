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
  <div className="mt-4 p-4 bg-white rounded border">
  

    <p className="text-lg font-semibold text-green-700">{recipe.name}</p>
    <p className="text-sm text-gray-500 mb-2">⏱ Prep Time: {recipe.prepTime}</p>

    <h4 className="font-semibold mt-3">Ingredients:</h4>
    <p className="whitespace-pre-line text-gray-700">{recipe.ingredients}</p>

    <h4 className="font-semibold mt-3">Instructions:</h4>
    <p className="whitespace-pre-line text-gray-700">{recipe.instructions}</p>
  </div>
)}
    </div>
  );
};

export default RecipeAI;





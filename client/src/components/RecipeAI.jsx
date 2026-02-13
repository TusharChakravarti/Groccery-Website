import React, { useState } from 'react';
import axios from 'axios';

// const RecipeAI = () => {
//   const [ingredients, setIngredients] = useState('');
//   const [recipe, setRecipe] = useState('');
//   const [loading, setLoading] = useState(false);

//   const getRecipe = async () => {
//     setLoading(true);
//     try {
    
//       const backendUrl = import.meta.env.VITE_BACKEND_URL;
//       axios.post(`${backendUrl}/api/user/login`, data);

//       setRecipe(data.recipe);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };


const getRecipe = async () => {
    if (!ingredients.trim()) return;

    setLoading(true);
    setRecipe(""); 

    try {
      // ✅ Use 'response' instead of destructuring { data } immediately
      const response = await axios.post(`${backendUrl}/api/ai/recipe`, { ingredients });

      // ✅ Now check if response and response.data exist
      if (response && response.data && response.data.success) {
        setRecipe(response.data.recipe);
      }
    } catch (error) {
      // ❌ REMOVE any line here that says: console.log(data) 
      // Because 'data' does not exist if the code reaches this catch block.
      
      console.error("Recipe Error:", error.response ? error.response.data : error.message);
      
      if (error.response?.status === 400) {
        alert("The server received no ingredients. Please type something!");
      } else {
        alert("Chef is having trouble. Please check the console.");
      }
    } finally {
      setLoading(false);
    }
  

  return (
    <div className="p-6 border rounded-lg shadow-md bg-green-50 mt-10">
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
          <h3 className="font-bold mb-2">Suggested Recipe:</h3>
         
          <p className="whitespace-pre-line text-gray-700">{recipe}</p>
        </div>
      )}
    </div>
  );
};

export default RecipeAI;





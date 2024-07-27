"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AddRecipePage() {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [calories, setCalories] = useState(0);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.from("recipes").insert([
      {
        name,
        ingredients: ingredients.split("\n").map((i) => i.trim()),
        instructions: instructions.split("\n").map((i) => i.trim()),
        difficulty,
        rating,
        image_url: imageUrl,
        calories,
      },
    ]);

    if (error) {
      console.error("Error adding recipe:", error);
      alert("Failed to add recipe. Please try again.");
    } else {
      alert("Recipe added successfully!");
      router.push("/recipes");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Recipe</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ingredients" className="block mb-2">
            Ingredients (one per line)
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full p-2 border rounded"
            rows={5}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="instructions" className="block mb-2">
            Instructions (one step per line)
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border rounded"
            rows={5}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="difficulty" className="block mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="rating" className="block mb-2">
            Rating (0-5)
          </label>
          <input
            type="number"
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            min="0"
            max="5"
            step="0.1"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="imageUrl" className="block mb-2">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="calories" className="block mb-2">
            Calories
          </label>
          <input
            type="number"
            id="calories"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Recipe
        </button>
      </form>
    </div>
  );
}

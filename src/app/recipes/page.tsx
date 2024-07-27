// app/recipes/page.tsx

"use client";

import { useState, useEffect } from "react";
import RecipeGenerator, { GeneratedRecipe } from "@/components/RecipeGenerator";
import RecipeCard from "@/components/RecipeCard";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Recipe = {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  rating: number;
  difficulty: string;
  image_url: string;
  calories: number;
  cuisine: string;
  time: number;
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const fetchRecipes = async () => {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch recipes.",
        variant: "destructive",
      });
    } else {
      setRecipes(recipes || []);
    }
  };

  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    try {
      const { data, error } = await supabase.from("recipes").insert([
        {
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          cuisine: recipe.cuisine,
          time: recipe.time,
        },
      ]);

      if (error) {
        console.error("Error saving recipe:", error);
        toast({
          title: "Error",
          description: "Failed to save recipe.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Recipe saved successfully!",
        });
        fetchRecipes(); // Refresh the recipes list
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const openModal = () => {
    const dialog = document.getElementById("recipeModal") as HTMLDialogElement;
    dialog.showModal();
  };

  const closeModal = () => {
    const dialog = document.getElementById("recipeModal") as HTMLDialogElement;
    dialog.close();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-center font-bold mb-6">Our Recipes</h1>
      <Button
        onClick={openModal}
        className="bg-pink-500 hover:bg-pink-600 text-white mb-6"
      >
        Generate New Recipe
      </Button>
      <dialog
        id="recipeModal"
        className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate a New Recipe</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <RecipeGenerator onSave={handleSaveRecipe} />
      </dialog>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

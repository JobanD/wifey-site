// app/recipes/page.tsx or components/Recipes.tsx

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";

// Define the type for the generated recipe
type GeneratedRecipe = {
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

export default function Recipes() {
  const [params, setParams] = useState({
    cuisine: "",
    difficulty: "",
    time: "",
  });
  const [generatedRecipe, setGeneratedRecipe] =
    useState<GeneratedRecipe | null>(null);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const generateRecipe = async () => {
    console.log("Request parameters:", params);
    try {
      const response = await fetch("/api/recipe-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Failed to fetch generated recipe");
      }
      const data = await response.json();
      console.log("Response data:", data);
      setGeneratedRecipe(data);
    } catch (error) {
      console.error("Error generating recipe:", error);
    }
  };

  const saveRecipe = async () => {
    if (!generatedRecipe) return;

    console.log("Saving recipe:", generatedRecipe);
    try {
      const response = await fetch("/api/insert-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedRecipe),
      });
      console.log("Save response status:", response.status);
      if (response.ok) {
        alert("Recipe saved successfully!");
        setGeneratedRecipe(null);
        fetchRecipes(); // Refresh the recipes table
      } else {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Failed to save recipe");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe.");
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("Fetch recipes status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch recipes error text:", errorText);
        throw new Error("Failed to fetch recipes");
      }
      const data = await response.json();
      console.log("Fetched recipes:", data);
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="p-8 bg-pink-50 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl text-pink-600 mb-6">Recipe Generator</h1>
      <Card className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
        <CardHeader>
          <CardTitle className="text-pink-500 mb-4">Input Parameters</CardTitle>
          <CardDescription>
            Fill in the details to generate a new recipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(params).map(([key, value]) => (
            <Input
              key={key}
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="mb-4"
            />
          ))}
          <Button
            onClick={generateRecipe}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            Generate Recipe
          </Button>
        </CardContent>
      </Card>

      {generatedRecipe && (
        <Card className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
          <CardHeader>
            <CardTitle className="text-pink-500 mb-4">
              Generated Recipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Name:</strong> {generatedRecipe.name}
            </p>
            <p className="mb-2">
              <strong>Ingredients:</strong>{" "}
              {generatedRecipe.ingredients.join(", ")}
            </p>
            <p className="mb-2">
              <strong>Instructions:</strong>{" "}
              {generatedRecipe.instructions.join(", ")}
            </p>
            <p className="mb-2">
              <strong>Rating:</strong> {generatedRecipe.rating}
            </p>
            <p className="mb-2">
              <strong>Difficulty:</strong> {generatedRecipe.difficulty}
            </p>
            <p className="mb-2">
              <strong>Calories:</strong> {generatedRecipe.calories}
            </p>
            <p className="mb-2">
              <strong>Cuisine:</strong> {generatedRecipe.cuisine}
            </p>
            <p className="mb-2">
              <strong>Time:</strong> {generatedRecipe.time} minutes
            </p>
            <img
              src={generatedRecipe.image_url}
              alt="Recipe Image"
              className="mb-4"
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={saveRecipe}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              Save This Recipe
            </Button>
          </CardFooter>
        </Card>
      )}

      <h2 className="text-2xl text-pink-600 mb-4">Recipes</h2>
      <Table className="w-full max-w-4xl bg-white shadow-md rounded-lg">
        <TableHeader>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Ingredients</TableCell>
            <TableCell>Instructions</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Difficulty</TableCell>
            <TableCell>Calories</TableCell>
            <TableCell>Cuisine</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Image</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{recipe.id}</TableCell>
              <TableCell>{recipe.name}</TableCell>
              <TableCell>{recipe.ingredients.join(", ")}</TableCell>
              <TableCell>{recipe.instructions.join(", ")}</TableCell>
              <TableCell>{recipe.rating}</TableCell>
              <TableCell>{recipe.difficulty}</TableCell>
              <TableCell>{recipe.calories}</TableCell>
              <TableCell>{recipe.cuisine}</TableCell>
              <TableCell>{recipe.time} minutes</TableCell>
              <TableCell>
                <img
                  src={recipe.image_url}
                  alt="Recipe Image"
                  className="w-16 h-16 object-cover"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

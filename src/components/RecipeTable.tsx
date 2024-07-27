// components/RecipeTable.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import Image from "next/image";

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

export default function RecipeTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <Table className="w-full bg-white shadow-md rounded-lg">
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
              <Image
                src={recipe.image_url}
                alt="Recipe Image"
                className="w-16 h-16 object-cover"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

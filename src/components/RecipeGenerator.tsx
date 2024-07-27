// components/RecipeGenerator.tsx

"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type RecipeParams = {
  name: string;
  ingredients: string[];
  difficulty: string;
  calories: number | null;
  cuisine: string;
  time: number | string;
};

export type GeneratedRecipe = {
  name: string;
  ingredients: string[];
  instructions: string[];
  difficulty: string;
  calories: number;
  cuisine: string;
  time: number | string;
};

type RecipeGeneratorProps = {
  onSave: (recipe: GeneratedRecipe) => void;
};

export default function RecipeGenerator({ onSave }: RecipeGeneratorProps) {
  const [params, setParams] = useState<RecipeParams>({
    name: "",
    ingredients: [""],
    difficulty: "",
    calories: null,
    cuisine: "",
    time: "",
  });

  const [generatedRecipe, setGeneratedRecipe] =
    useState<GeneratedRecipe | null>(null);
  const [ingredients, setIngredients] = useState("");
  const { toast } = useToast();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleIngredientsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const ingredientsText = e.target.value;
    setIngredients(ingredientsText);
    setParams((prevParams) => ({
      ...prevParams,
      ingredients: ingredientsText
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean),
    }));
  };

  const generateRecipe = async () => {
    try {
      const response = await fetch("/api/recipe-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const content = await response.json();
      console.log("Raw content received from OpenAI:", content);
      setGeneratedRecipe(content);
    } catch (error) {
      console.error("Error generating recipe:", error);
    }
  };

  const saveRecipe = () => {
    if (generatedRecipe) {
      onSave(generatedRecipe);
      setGeneratedRecipe(null);
      setIngredients("");
      toast({
        title: "Success",
        description: "Recipe saved successfully!",
      });
    }
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-6">
      <CardHeader>
        <CardTitle className="text-pink-500 mb-4">
          Generate a New Recipe
        </CardTitle>
        <CardDescription>
          Fill in the details to generate a new recipe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          name="cuisine"
          value={params.cuisine}
          onChange={handleInputChange}
          placeholder="Cuisine"
          className="mb-4"
        />
        <Input
          type="text"
          name="difficulty"
          value={params.difficulty}
          onChange={handleInputChange}
          placeholder="Difficulty"
          className="mb-4"
        />
        <Input
          type="text"
          name="time"
          value={params.time}
          onChange={handleInputChange}
          placeholder="Time"
          className="mb-4"
        />
        <Textarea
          name="ingredients"
          value={ingredients}
          onChange={handleIngredientsChange}
          placeholder="Ingredients (one per line)"
          className="mb-4"
          rows={5}
        />
        <Button
          onClick={generateRecipe}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
        >
          Generate Recipe
        </Button>
      </CardContent>
      {generatedRecipe && (
        <>
          <CardHeader>
            <CardTitle className="text-pink-500 mb-4">
              Generated Recipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Name:</strong> {generatedRecipe.name}
            </p>
            <div className="mb-2">
              <strong>Ingredients:</strong>
              <ul className="list-disc list-inside">
                {generatedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <strong>Instructions:</strong>
              <ul className="list-inside">
                {generatedRecipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
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
          </CardContent>
          <CardFooter>
            <Button
              onClick={saveRecipe}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              Save This Recipe
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

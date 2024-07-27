// components/RecipeCard.tsx

import Image from "next/image";
import Link from "next/link";

interface Recipe {
  id: number;
  name: string;
  image_url: string;
  difficulty: string;
  calories: number;
  cuisine: string;
  time: number;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Image
          src={recipe.image_url || "/placeholder-image.jpg"}
          alt={recipe.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Difficulty: {recipe.difficulty || "N/A"}</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Calories: {recipe.calories || "N/A"}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Cuisine: {recipe.cuisine || "N/A"}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Time: {recipe.time || "N/A"} minutes
          </div>
        </div>
      </div>
    </Link>
  );
}

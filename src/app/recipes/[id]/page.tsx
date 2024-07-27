import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function RecipePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Error fetching recipe:", error);
    return <div>Error loading recipe</div>;
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{recipe.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
              No image available
            </div>
          )}
          <div className="mt-4 flex justify-between text-gray-600">
            <span>Difficulty: {recipe.difficulty || "N/A"}</span>
            <span>Calories: {recipe.calories || "N/A"}</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-6 mb-6">
            {recipe.ingredients &&
              recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="pl-6">
            {recipe.instructions &&
              recipe.instructions.map((step: string, index: number) => (
                <li key={index} className="mb-2">
                  {step}
                </li>
              ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

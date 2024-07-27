import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredients, difficulty, calories, cuisine, time } =
      await request.json();

    const prompt = `Generate a delicious recipe using the given ingredients and provide step-by-step instructions.
    Ingredients: ${ingredients ? ingredients.join(", ") : "Any"}
    ${difficulty ? `Difficulty: ${difficulty}` : ""}
    ${calories ? `Calories: less than ${calories}` : ""}
    ${cuisine ? `Cuisine: ${cuisine}` : ""}
    ${time ? `Time: ${time} minutes` : ""}
    
    Provide the response in the following JSON format:
    {
      "name": "Name of the recipe",
      "ingredients": ["List of ingredients"],
      "instructions": ["Step-by-step instructions"],
      "difficulty": "Estimated difficulty",
      "calories": "Estimated calories as an (int value)",
      "cuisine": "Type of cuisine",
      "time": "Estimated length to make in minutes (int value)"
    }`;

    console.log(prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    let content = completion.choices[0].message.content;

    console.log("Raw content received from OpenAI:", content);

    if (content === null) {
      throw new Error("No content generated");
    }

    content = content.replace(/```json\s*|\s*```/g, "").trim();

    let generatedRecipe;
    try {
      generatedRecipe = JSON.parse(content);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.error("Invalid JSON response:", content);
      throw new Error("Invalid JSON response from OpenAI API");
    }

    return NextResponse.json(generatedRecipe, { status: 200 });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { location, timeOfDay, vibe, budget, duration, season } =
      await request.json();

    const prompt = `Generate a unique and creative date idea for a couple in their 20s. 
    ${location ? `Location: ${location}` : ""}
    ${timeOfDay ? `Time of day: ${timeOfDay}` : ""}
    ${vibe ? `Vibe: ${vibe}` : ""}
    ${budget ? `Budget: ${budget}` : ""}
    ${duration ? `Duration: ${duration}` : ""}
    ${season ? `Season: ${season}` : ""}
    
    Provide the response in the following JSON format:
    {
      "idea": "Brief description of the date idea",
      "location": "Specific location or type of place",
      "time_of_day": "Suggested time of day",
      "vibe": "Overall vibe or atmosphere",
      "estimated_cost": "Approximate cost in dollars",
      "duration": "Expected duration",
      "season": "Best season for this date"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Note: Ensure this model name is correct
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      top_p: 1,
      max_tokens: 200,
    });

    const content = completion.choices[0].message.content;

    if (content === null) {
      throw new Error("No content generated");
    }

    const generatedIdea = JSON.parse(content);

    return NextResponse.json(generatedIdea, { status: 200 });
  } catch (error) {
    console.error("Error generating date idea:", error);
    return NextResponse.json(
      { error: "Failed to generate date idea" },
      { status: 500 }
    );
  }
}

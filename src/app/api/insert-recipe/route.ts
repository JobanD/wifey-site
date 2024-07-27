import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      ingredients,
      instructions,
      rating,
      difficulty,
      image_url,
      calories,
      cuisine,
      time,
    } = await request.json();

    const { data, error } = await supabase
      .from("recipes")
      .insert([
        {
          name,
          ingredients,
          instructions,
          rating,
          difficulty,
          image_url,
          calories,
          cuisine,
          time,
        },
      ]);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error inserting recipe:", error);
    return NextResponse.json(
      { error: "Failed to insert recipe" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { message: "Method GET Not Allowed" },
    { status: 405 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const dateIdea = await request.json();

    const { data, error } = await supabase
      .from("date_ideas")
      .insert([dateIdea]);

    if (error) throw error;

    return NextResponse.json(
      { message: "Date idea saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving date idea:", error);
    return NextResponse.json(
      { error: "Failed to save date idea" },
      { status: 500 }
    );
  }
}

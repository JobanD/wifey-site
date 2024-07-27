import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const dateIdea = await request.json();

    const supabase = createClient();

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

export function GET() {
  return NextResponse.json(
    { message: "Method GET Not Allowed" },
    { status: 405 }
  );
}

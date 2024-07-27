// pages/api/insert-recipe.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name, ingredients, instructions, rating, difficulty, image_url, calories, cuisine, time } = req.body;

    const { data, error } = await supabase
      .from("recipes")
      .insert([{ name, ingredients, instructions, rating, difficulty, image_url, calories, cuisine, time }])
      .select();

    if (error) {
      console.error("Error inserting recipe:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

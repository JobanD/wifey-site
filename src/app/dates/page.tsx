// app/date-generator/page.tsx or components/DateGenerator.tsx

"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Separator } from "@/components/ui/separator";

type DateIdea = {
  id: number;
  idea: string;
  location: string;
  time_of_day: string;
  vibe: string;
  estimated_cost: string;
  duration: string;
  season: string;
};

// Define the type for the generated idea
type GeneratedIdea = {
  idea: string;
  location: string;
  time_of_day: string;
  vibe: string;
  estimated_cost: string;
  duration: string;
  season: string;
};

export default function DateGenerator() {
  const [params, setParams] = useState({
    location: "",
    timeOfDay: "",
    vibe: "",
    budget: "",
    duration: "",
    season: "",
  });
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(
    null
  );
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchDateIdeas();
  }, []);

  const fetchDateIdeas = async () => {
    const { data, error } = await supabase
      .from("date_ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching date ideas:", error);
      toast({
        title: "Error",
        description: "Failed to fetch date ideas.",
        variant: "destructive",
      });
    } else {
      setDateIdeas(data || []);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const generateIdea = async () => {
    console.log("Request parameters:", params);
    try {
      const response = await fetch("/api/date-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Failed to fetch generated idea");
      }
      const data = await response.json();
      console.log("Response data:", data);
      setGeneratedIdea(data);
    } catch (error) {
      console.error("Error generating idea:", error);
    }
  };

  const saveIdea = async () => {
    if (!generatedIdea) return;

    console.log("Saving idea:", generatedIdea);
    try {
      const response = await fetch("/api/insert-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedIdea),
      });
      console.log("Save response status:", response.status);
      if (response.ok) {
        toast({
          title: "Success",
          description: "Date idea saved successfully!",
        });
        setGeneratedIdea(null);
        fetchDateIdeas(); // Refresh the list of date ideas
      } else {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error("Failed to save date idea");
      }
    } catch (error) {
      console.error("Error saving idea:", error);
      toast({
        title: "Error",
        description: "Failed to save date idea.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <h1 className="text-4xl text-pink-600 mb-6 text-center">
        Romantic Date Idea Generator
      </h1>

      <div className="flex flex-col items-center justify-center md:flex-row gap-6 mb-8">
        <Card className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-6">
          <CardHeader>
            <CardTitle className="text-pink-500 mb-4">
              Input Parameters
            </CardTitle>
            <CardDescription>
              Fill in the details to generate a romantic date idea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(params).map(([key, value]) => (
              <Input
                key={key}
                type="text"
                name={key}
                value={value}
                onChange={handleInputChange}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                className="mb-4"
              />
            ))}
            <Button
              onClick={generateIdea}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              Generate Idea
            </Button>
          </CardContent>
        </Card>

        {generatedIdea && (
          <Card className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-pink-500 mb-4">
                Generated Date Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Idea:</strong> {generatedIdea.idea}
              </p>
              <p className="mb-2">
                <strong>Location:</strong> {generatedIdea.location}
              </p>
              <p className="mb-2">
                <strong>Time of Day:</strong> {generatedIdea.time_of_day}
              </p>
              <p className="mb-2">
                <strong>Vibe:</strong> {generatedIdea.vibe}
              </p>
              <p className="mb-2">
                <strong>Estimated Cost:</strong> {generatedIdea.estimated_cost}
              </p>
              <p className="mb-2">
                <strong>Duration:</strong> {generatedIdea.duration}
              </p>
              <p className="mb-2">
                <strong>Season:</strong> {generatedIdea.season}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={saveIdea}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                Save This Idea
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Separator />

      <h2 className="text-2xl text-pink-600 mb-4 text-center">
        Saved Date Ideas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dateIdeas.map((idea) => (
          <Card
            key={idea.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <CardHeader>
              <CardTitle className="text-pink-500">{idea.idea}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Location:</strong> {idea.location}
              </p>
              <p>
                <strong>Time of Day:</strong> {idea.time_of_day}
              </p>
              <p>
                <strong>Vibe:</strong> {idea.vibe}
              </p>
              <p>
                <strong>Estimated Cost:</strong> {idea.estimated_cost}
              </p>
              <p>
                <strong>Duration:</strong> {idea.duration}
              </p>
              <p>
                <strong>Season:</strong> {idea.season}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

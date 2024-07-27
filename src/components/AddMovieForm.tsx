// components/AddMovieForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddMovieFormProps = {
  onSubmit: (title: string) => void;
};

export function AddMovieForm({ onSubmit }: AddMovieFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="movieTitle">Movie Title</Label>
        <Input
          id="movieTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter movie title"
          required
        />
      </div>
      <Button type="submit">Add Movie</Button>
    </form>
  );
}

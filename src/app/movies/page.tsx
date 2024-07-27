"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getMovieDetails } from "@/utils/external-api/tmdb";
import { AddMovieForm } from "@/components/AddMovieForm";
import { RatingForm } from "@/components/RatingForm";
import Image from "next/image";

type Movie = {
  id: number;
  title: string;
  watched: boolean;
  joban_rating: number | null;
  jasleen_rating: number | null;
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMovieDialogOpen, setIsAddMovieDialogOpen] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching movies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch movies.",
        variant: "destructive",
      });
    } else {
      setMovies(data || []);
    }
  };

  const toggleWatched = async (id: number, watched: boolean) => {
    const { error } = await supabase
      .from("movies")
      .update({ watched: !watched })
      .eq("id", id);

    if (error) {
      console.error("Error updating movie:", error);
      toast({
        title: "Error",
        description: "Failed to update movie status.",
        variant: "destructive",
      });
    } else {
      fetchMovies();
      toast({
        title: "Success",
        description: "Movie status updated.",
      });
    }
  };

  const openMovieDetails = async (movie: Movie) => {
    const details = await getMovieDetails(movie.title);
    setSelectedMovie({
      ...details,
      localId: movie.id,
      joban_rating: movie.joban_rating, // Include local ratings
      jasleen_rating: movie.jasleen_rating, // Include local ratings
    });
    setIsDialogOpen(true);
  };

  const handleAddMovie = async (title: string) => {
    const { error } = await supabase
      .from("movies")
      .insert([{ title, watched: false }]);

    if (error) {
      console.error("Error adding movie:", error);
      toast({
        title: "Error",
        description: "Failed to add movie.",
        variant: "destructive",
      });
    } else {
      fetchMovies();
      setIsAddMovieDialogOpen(false);
      toast({
        title: "Success",
        description: "Movie added successfully.",
      });
    }
  };

  const handleRatingUpdate = async (
    movieId: number,
    jobanRating: number | null,
    jasleenRating: number | null
  ) => {
    console.log("Updating movie with ID:", movieId);
    console.log("New Joban Rating:", jobanRating);
    console.log("New Jasleen Rating:", jasleenRating);

    const { data, error } = await supabase
      .from("movies")
      .update({
        joban_rating: jobanRating,
        jasleen_rating: jasleenRating,
        watched: true,
      })
      .eq("id", movieId);

    if (error) {
      console.error("Error updating ratings:", error);
      toast({
        title: "Error",
        description: "Failed to update ratings.",
        variant: "destructive",
      });
    } else {
      console.log("Update response:", data);
      fetchMovies();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Ratings updated successfully.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-600">
        Our Movie Watchlist
      </h1>
      <div className="mb-6 text-center">
        <Button onClick={() => setIsAddMovieDialogOpen(true)}>
          Add New Movie
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Card
            key={movie.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {movie.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                Status: {movie.watched ? "Watched" : "Unwatched"}
              </p>
              {movie.watched && (
                <div>
                  <p>Joban&apos;s Rating: {movie.joban_rating}/10</p>
                  <p>Jasleen&apos;s Rating: {movie.jasleen_rating}/10</p>
                </div>
              )}
              <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button onClick={() => toggleWatched(movie.id, movie.watched)}>
                  {movie.watched ? "Mark Unwatched" : "Mark Watched"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openMovieDetails(movie)}
                >
                  More Info
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedMovie && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMovie.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  width={500}
                  height={750}
                  layout="responsive"
                  className="rounded-lg shadow-md"
                />
                <div>
                  <DialogDescription>
                    {selectedMovie.overview}
                  </DialogDescription>
                  <p className="mt-2">
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Runtime:</strong> {selectedMovie.runtime} minutes
                  </p>
                  <p>
                    <strong>Genres:</strong>{" "}
                    {selectedMovie.genres?.map((g: any) => g.name).join(", ")}
                  </p>
                  <p>
                    <strong>Director:</strong>{" "}
                    {
                      selectedMovie.credits?.crew.find(
                        (c: any) => c.job === "Director"
                      )?.name
                    }
                  </p>
                  <p>
                    <strong>Cast:</strong>{" "}
                    {selectedMovie.credits?.cast
                      .slice(0, 5)
                      .map((c: any) => c.name)
                      .join(", ")}
                  </p>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Rate This Movie</h3>
                    <RatingForm
                      movieId={selectedMovie.localId} // Use the local database ID
                      jobanRating={selectedMovie.joban_rating}
                      jasleenRating={selectedMovie.jasleen_rating}
                      onSubmit={(jobanRating, jasleenRating) =>
                        handleRatingUpdate(
                          selectedMovie.localId, // Use the local database ID
                          jobanRating,
                          jasleenRating
                        )
                      }
                    />
                  </div>
                  {selectedMovie.videos?.results.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Trailer</h3>
                      <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${selectedMovie.videos.results[0].key}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddMovieDialogOpen}
        onOpenChange={setIsAddMovieDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Movie</DialogTitle>
          </DialogHeader>
          <AddMovieForm onSubmit={handleAddMovie} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

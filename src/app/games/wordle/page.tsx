"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { useTimer } from "@/utils/hooks/useTimer";

interface WordlePuzzle {
  id: number;
  date: string;
  word: string;
}

export default function WordleGame() {
  const [solution, setSolution] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""));
  const [submittedGuesses, setSubmittedGuesses] = useState<string[]>([]);
  const [guessIndex, setGuessIndex] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showCongratulations, setShowCongratulations] =
    useState<boolean>(false);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());

  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const timer = useTimer(gameOver);

  useEffect(() => {
    fetchTodaysWord();
  }, []);

  async function fetchTodaysWord() {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("wordle_puzzles")
      .select("*")
      .eq("date", today)
      .single();

    if (error) {
      console.error("Error fetching word:", error);
      toast({
        title: "Error",
        description: "Failed to load today's word. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const puzzleData = data as WordlePuzzle;
    setSolution(puzzleData.word.toUpperCase());
    setStartTime(new Date());
  }

  function handleKeyPress(key: string) {
    if (gameOver || guessIndex > 5) return;

    if (key === "ENTER") {
      const currentGuess = guesses[guessIndex];
      if (currentGuess.length === 5) {
        setGuessedLetters(
          (prev) => new Set([...prev, ...currentGuess.split("")])
        );
        setSubmittedGuesses((prev) => [...prev, currentGuess]);
        if (currentGuess === solution) {
          saveScore();
          setGameOver(true);
          setShowCongratulations(true);
          setEndTime(new Date());
          console.log("Game won, calling saveScore");
        } else if (guessIndex === 5) {
          setGameOver(true);
          toast({
            title: "Game Over",
            description: `The word was ${solution}. Try again tomorrow!`,
            variant: "destructive",
          });
        }
        setGuessIndex((prevIndex) => prevIndex + 1);
      }
    } else if (key === "BACKSPACE") {
      setGuesses((prevGuesses) => {
        const newGuesses = [...prevGuesses];
        newGuesses[guessIndex] = newGuesses[guessIndex].slice(0, -1);
        return newGuesses;
      });
    } else if (/^[A-Z]$/.test(key)) {
      setGuesses((prevGuesses) => {
        const newGuesses = [...prevGuesses];
        if (newGuesses[guessIndex].length < 5) {
          newGuesses[guessIndex] += key;
        }
        return newGuesses;
      });
    }
  }

  function getLetterColor(
    letter: string,
    index: number,
    guess: string
  ): string {
    if (!submittedGuesses.includes(guess)) {
      return "";
    }
    if (guess[index] === solution[index]) {
      return "bg-green-600 text-white";
    } else if (solution.includes(letter)) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-gray-400 text-white";
    }
  }

  function getKeyboardLetterColor(letter: string): string {
    if (!guessedLetters.has(letter)) return "bg-gray-200";

    const isGreen = submittedGuesses.some((guess) =>
      guess.split("").some((l, i) => l === letter && solution[i] === letter)
    );

    if (isGreen) return "bg-green-600 text-white";
    if (solution.includes(letter)) return "bg-yellow-500 text-white";
    return "bg-gray-600 text-white";
  }

  async function saveScore() {
    console.log("saveScore function called");
    if (!startTime) {
      console.log("startTime is null", { startTime });
      return;
    }

    console.log("Timer value:", timer);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      toast({
        title: "Error",
        description: "Unable to save score. Please log in.",
        variant: "destructive",
      });
      return;
    }

    console.log("User retrieved:", user.id);

    const today = new Date().toISOString().split("T")[0];

    // Check if an entry already exists for this user and date
    const { data: existingScore, error: existingScoreError } = await supabase
      .from("wordle_scores")
      .select("*")
      .eq("user_id", user.id)
      .eq("puzzle_date", today)
      .single();

    if (existingScoreError && existingScoreError.code !== "PGRST116") {
      console.error("Error checking existing score:", existingScoreError);
      toast({
        title: "Error",
        description: "Failed to check existing score. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (existingScore) {
      console.log("Score already exists for today:", existingScore);
      toast({
        title: "Info",
        description: "You've already submitted a score for today's puzzle.",
        variant: "default",
      });
      return;
    }

    const scoreData = {
      user_id: user.id,
      puzzle_date: today,
      time_seconds: timer,
      guesses: (guessIndex + 1).toString(), // Add 1 to guessIndex and convert to string
    };

    console.log("Attempting to insert score:", scoreData);

    const { data, error } = await supabase
      .from("wordle_scores")
      .insert(scoreData);

    if (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: "Failed to save your score. Please try again.",
        variant: "destructive",
      });
    } else {
      console.log("Score saved successfully:", data);
      toast({
        title: "Success",
        description: "Your score has been saved!",
        variant: "default",
      });
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-lg bg-pink-100 min-h-screen">
      {showCongratulations && (
        <div className="fixed inset-0 flex flex-col items-center justify-center text-center bg-green-500 text-white text-3xl font-bold z-50">
          <div>Congratulations! You guessed the word!</div>
          <div className="mt-2 text-2xl">
            Time: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </div>
          <div className="mt-2 text-2xl">Guesses: {guessIndex}</div>
          <Link
            href="/games"
            className="bg-white text-green-500 p-2 rounded mt-4"
          >
            Go Back to Games
          </Link>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Daily Wordle</h1>
      <div className="mb-4">
        Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-rows-6 gap-2 mb-4">
          {guesses.map((guess, i) => (
            <div key={i} className="flex justify-center">
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className={`w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-bold ${
                    submittedGuesses.length > i
                      ? getLetterColor(guess[j], j, guess)
                      : ""
                  }`}
                >
                  {guess[j] || ""}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-10 gap-1 mb-2">
          {[..."QWERTYUIOP"].map((letter) => (
            <button
              key={letter}
              className={`p-2 rounded text-sm sm:text-base ${getKeyboardLetterColor(
                letter
              )}`}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1 mb-2">
          {[..."ASDFGHJKL"].map((letter) => (
            <button
              key={letter}
              className={`p-2 rounded text-sm sm:text-base ${getKeyboardLetterColor(
                letter
              )}`}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-1">
          <button
            className="bg-gray-200 p-2 rounded col-span-2 text-sm sm:text-base"
            onClick={() => handleKeyPress("ENTER")}
          >
            Enter
          </button>
          {[..."ZXCVBNM"].map((letter) => (
            <button
              key={letter}
              className={`p-2 rounded text-sm sm:text-base ${getKeyboardLetterColor(
                letter
              )}`}
              onClick={() => handleKeyPress(letter)}
            >
              {letter}
            </button>
          ))}
          <button
            className="bg-gray-200 p-2 rounded col-span-2 text-sm sm:text-base"
            onClick={() => handleKeyPress("BACKSPACE")}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

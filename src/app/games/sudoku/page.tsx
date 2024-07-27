"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";

type SudokuCell = number | null;
type SudokuGrid = SudokuCell[][];

interface SudokuPuzzle {
  id: number;
  date: string;
  puzzle: string;
  solution: string;
}

export default function SudokuGame() {
  const [puzzle, setPuzzle] = useState<SudokuGrid>([]);
  const [solution, setSolution] = useState<SudokuGrid>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(
    null
  );
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timer, setTimer] = useState(() => {
    const savedTimer = localStorage.getItem("sudokuTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 0;
  });
  const [numberCounts, setNumberCounts] = useState<number[]>(Array(10).fill(0));
  const [completedNumbers, setCompletedNumbers] = useState<boolean[]>(
    Array(10).fill(false)
  );
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(
    null
  );
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTodaysPuzzle();
    if (timerIntervalId) clearInterval(timerIntervalId);
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        const newTimer = prev + 1;
        localStorage.setItem("sudokuTimer", newTimer.toString());
        return newTimer;
      });
    }, 1000);
    setTimerIntervalId(timerInterval);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (showCongratulations) {
      if (timerIntervalId) clearInterval(timerIntervalId);
      localStorage.removeItem("sudokuTimer");
    }
  }, [showCongratulations, timerIntervalId]);

  async function fetchTodaysPuzzle() {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("sudoku_puzzles")
      .select("*")
      .eq("date", today)
      .single();

    if (error) {
      console.error("Error fetching puzzle:", error);
      toast({
        title: "Error",
        description: "Failed to load today's puzzle. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const puzzleData = data as SudokuPuzzle;
    setPuzzle(stringToGrid(puzzleData.puzzle));
    setSolution(stringToGrid(puzzleData.solution));
    setStartTime(new Date());
    updateNumberCounts(stringToGrid(puzzleData.puzzle));
  }

  function stringToGrid(str: string): SudokuGrid {
    return str.split("").reduce((grid, char, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      if (!grid[row]) grid[row] = [];
      grid[row][col] = char === "0" ? null : parseInt(char, 10);
      return grid;
    }, [] as SudokuGrid);
  }

  function updateNumberCounts(grid: SudokuGrid) {
    const counts = Array(10).fill(0);
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell !== null) counts[cell]++;
      })
    );
    setNumberCounts(counts);
    setCompletedNumbers(counts.map((count) => count === 9));
  }

  function handleCellClick(row: number, col: number) {
    setSelectedCell([row, col]);
    setHighlightedNumber(puzzle[row][col]);
  }

  function handleNumberInput(number: number) {
    if (!selectedCell || completedNumbers[number]) return;

    const [row, col] = selectedCell;
    const newPuzzle = puzzle.map((rowContent, rowIndex) =>
      rowContent.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return number;
        }
        return cell;
      })
    );

    if (solution[row][col] === number) {
      setPuzzle(newPuzzle);
      updateNumberCounts(newPuzzle);

      if (isPuzzleComplete(newPuzzle)) {
        setEndTime(new Date());
        setShowCongratulations(true);
        if (timerIntervalId) clearInterval(timerIntervalId); // Clear the interval
        console.log("Removing timer from localStorage"); // Debug log
        localStorage.removeItem("sudokuTimer"); // Clear the timer from localStorage
        saveScore();
      }
    } else {
      setMistakes((prev) => prev + 1);
      toast({
        title: "Mistake",
        description: `That's not correct. Mistakes: ${mistakes + 1}/3`,
        variant: "destructive",
      });

      if (mistakes + 1 >= 3) {
        toast({
          title: "Game Over",
          description: "You've made 3 mistakes. Try again tomorrow!",
          variant: "destructive",
        });
        setTimeout(() => {
          console.log("Removing timer from localStorage"); // Debug log
          localStorage.removeItem("sudokuTimer"); // Clear the timer from localStorage
          router.push("/games");
        }, 3000);
      }
    }
  }

  function isPuzzleComplete(puzzle: SudokuGrid) {
    return puzzle.every((row, rowIndex) =>
      row.every(
        (cell, colIndex) =>
          cell !== null && cell === solution[rowIndex][colIndex]
      )
    );
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
      .from("sudoku_scores")
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
      mistakes: mistakes, // Assuming you have a 'mistakes' state variable
    };

    console.log("Attempting to insert score:", scoreData);

    const { data, error } = await supabase
      .from("sudoku_scores")
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

  function fillPuzzleWithSolution() {
    setPuzzle(solution);
    setShowCongratulations(true);
    if (timerIntervalId) clearInterval(timerIntervalId); // Clear the interval
  }

  return (
    <div className="container mx-auto p-4 max-w-lg relative">
      {showCongratulations && (
        <div className="fixed inset-0 flex flex-col items-center justify-center text-center bg-green-500 text-white text-3xl font-bold z-50">
          <div>Congratulations! You completed the puzzle!</div>
          <div className="mt-2 text-2xl">
            Time: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </div>
          <div className="mt-2 text-2xl">Mistakes: {mistakes}</div>
          <Link
            href="/games"
            className="bg-white text-green-500 p-2 rounded mt-4"
          >
            Go Back to Games
          </Link>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Daily Sudoku</h1>
      <div className="flex justify-between items-center mb-4">
        <div>
          Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </div>
        <div>Mistakes: {mistakes}</div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-9 gap-px mb-4 relative z-10">
          {puzzle.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-10 h-10 sm:w-16 sm:h-16 border border-gray-300 ${
                  selectedCell?.[0] === rowIndex &&
                  selectedCell?.[1] === colIndex
                    ? "bg-blue-200"
                    : highlightedNumber && cell === highlightedNumber
                    ? "bg-yellow-200"
                    : "bg-white"
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell || ""}
              </button>
            ))
          )}
        </div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {[1, 2].map((i) => (
            <div
              key={`h-line-${i}`}
              className="absolute left-0 w-full bg-black z-20"
              style={{
                top: `calc(${((i * 3) / 9) * 100}% - 2px)`,
                height: "4px",
              }} // Center and thicken the lines
            />
          ))}
          {[1, 2].map((i) => (
            <div
              key={`v-line-${i}`}
              className="absolute top-0 h-full bg-black z-20"
              style={{
                left: `calc(${((i * 3) / 9) * 100}% - 4px)`,
                width: "4px",
              }} // Center and thicken the lines
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            className={`bg-gray-200 p-2 rounded ${
              completedNumbers[number]
                ? "line-through text-gray-500 cursor-not-allowed"
                : ""
            }`}
            onClick={() => handleNumberInput(number)}
            disabled={completedNumbers[number]}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        className="bg-blue-500 text-white p-2 rounded mt-4"
        onClick={fillPuzzleWithSolution}
      >
        Fill Puzzle with Solution (Dev Only)
      </button>
    </div>
  );
}

// useSudokuTimer.ts
"use client";

import { useState, useEffect } from "react";

export function useSudokuTimer(gameOver: boolean) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return; // Guard for server-side rendering

    const savedTimer = localStorage.getItem("sudokuTimer");
    if (savedTimer) {
      setTimer(parseInt(savedTimer, 10));
    }

    let timerInterval: NodeJS.Timeout;

    if (!gameOver) {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev + 1;
          localStorage.setItem("sudokuTimer", newTimer.toString());
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (gameOver) localStorage.removeItem("sudokuTimer");
    };
  }, [gameOver]);

  return timer;
}

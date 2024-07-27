import { useState, useEffect } from "react";

export function useTimer(gameOver: boolean) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return; // Guard for server-side rendering

    const savedTimer = localStorage.getItem("wordleTimer");
    if (savedTimer) {
      setTimer(parseInt(savedTimer, 10));
    }

    let timerInterval: NodeJS.Timeout;

    if (!gameOver) {
      timerInterval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev + 1;
          localStorage.setItem("wordleTimer", newTimer.toString());
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (gameOver) localStorage.removeItem("wordleTimer");
    };
  }, [gameOver]);

  return timer;
}

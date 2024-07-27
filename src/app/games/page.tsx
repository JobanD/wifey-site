import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function GamesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <div className="w-full bg-pink-300 p-8 rounded-lg mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">❤️ Games ❤️</h1>
        <p className="text-lg text-gray-700">
          Where we practice our skills for our future family game nights
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/games/sudoku" passHref>
          <Card className="transform transition-transform hover:scale-105">
            <CardHeader>
              <CardTitle className="text-yellow-500">Sudoku 🧩</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                You think you can beat me in Sudoku 🥱
              </p>
            </CardContent>
            <CardFooter>
              <Button color="yellow">Play Now</Button>
            </CardFooter>
          </Card>
        </Link>
        <Link href="/games/wordle" passHref>
          <Card className="transform transition-transform hover:scale-105">
            <CardHeader>
              <CardTitle className="text-green-500">Wordle 📝</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                NYT Games got nothing on us fr ong 💯💯💯
              </p>
            </CardContent>
            <CardFooter>
              <Button color="green">Play Now</Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
}

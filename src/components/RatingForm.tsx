import { useState } from "react";
import { Button } from "@/components/ui/button";

type RatingFormProps = {
  movieId: number;
  jobanRating: number | null;
  jasleenRating: number | null;
  onSubmit: (jobanRating: number | null, jasleenRating: number | null) => void;
};

export const RatingForm = ({
  movieId,
  jobanRating = null,
  jasleenRating = null,
  onSubmit,
}: RatingFormProps) => {
  const [joban, setJoban] = useState<string>(
    jobanRating !== null ? jobanRating.toString() : ""
  );
  const [jasleen, setJasleen] = useState<string>(
    jasleenRating !== null ? jasleenRating.toString() : ""
  );

  const handleSubmit = () => {
    const jobanValue = joban ? parseInt(joban, 10) : null;
    const jasleenValue = jasleen ? parseInt(jasleen, 10) : null;
    onSubmit(jobanValue, jasleenValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label
          htmlFor="joban-rating"
          className="text-sm font-medium text-gray-700 mb-2"
        >
          Joban&apos;s Rating
        </label>
        <input
          id="joban-rating"
          type="number"
          value={joban}
          onChange={(e) => setJoban(e.target.value)}
          min="0"
          max="10"
          className="p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="jasleen-rating"
          className="text-sm font-medium text-gray-700 mb-2"
        >
          Jasleen&apos;s Rating
        </label>
        <input
          id="jasleen-rating"
          type="number"
          value={jasleen}
          onChange={(e) => setJasleen(e.target.value)}
          min="0"
          max="10"
          className="p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <Button onClick={handleSubmit} className="mt-4">
        Submit Ratings
      </Button>
    </div>
  );
};

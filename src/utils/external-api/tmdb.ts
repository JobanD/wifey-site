// lib/tmdb.ts
import axios from "axios";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function getMovieDetails(title: string) {
  try {
    const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title,
      },
    });

    if (searchResponse.data.results.length > 0) {
      const movieId = searchResponse.data.results[0].id;
      const detailsResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: "credits,videos",
        },
      });

      return detailsResponse.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

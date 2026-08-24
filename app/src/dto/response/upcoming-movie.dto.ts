// app/src/dto/response/upcoming-movie.dto.ts

export interface UpcomingMovieDto {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  genres: string[];
  classification: string;
  duration: number;
  trailerUrl: string;
  synopsis: string;
  daysUntil: number;
}

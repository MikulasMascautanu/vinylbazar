import { Vinyl } from "./vinyl";

/**
 * Generic API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

/**
 * API response for vinyls endpoint
 */
export type VinylsResponse = ApiResponse<Vinyl[]>;

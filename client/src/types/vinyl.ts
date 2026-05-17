/**
 * Represents a vinyl record from the database
 */
export interface Vinyl {
  id: number;
  title: string;
  artist: string | null;
  price: number | null;
  image_url: string | null;
  product_url: string;
  category: string | null;
  scraped_at: string;
}

/**
 * Available sort options for vinyl records
 */
export type SortOption =
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "title-desc"
  | "date-asc"
  | "date-desc";

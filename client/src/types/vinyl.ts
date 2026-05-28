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
	created_at: string;
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

/**
 * Check if a vinyl record is newly added (less than 7 days old)
 * Uses created_at to determine true new records, not just updated ones
 */
export const isNewRecord = (vinyl: Vinyl): boolean => {
	const createdDate = new Date(vinyl.created_at);
	const now = new Date();
	const daysDiff =
		(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
	return daysDiff < 1;
};

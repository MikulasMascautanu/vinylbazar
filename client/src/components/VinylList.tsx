import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Vinyl, SortOption } from "../types/vinyl";
import { VinylsResponse } from "../types/api";
import VinylCard from "./VinylCard";
import SearchBar from "./SearchBar";
import SortControls from "./SortControls";
import Pagination from "./Pagination";
import "./VinylList.css";

const ITEMS_PER_PAGE = 20;

const VinylList: React.FC = () => {
	const [vinyls, setVinyls] = useState<Vinyl[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<SortOption>("date-desc");
	const [currentPage, setCurrentPage] = useState<number>(1);

	// Fetch data on mount
	useEffect(() => {
		const fetchVinyls = async () => {
			try {
				setLoading(true);
				const response = await axios.get<VinylsResponse>("/api/vinyls");
				if (response.data.success) {
					setVinyls(response.data.data);
				} else {
					throw new Error("Failed to fetch vinyls");
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to load vinyl records";
				setError(errorMessage);
				console.error("Error fetching vinyls:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchVinyls();
	}, []);

	// Filter vinyls based on search query
	const filteredVinyls = useMemo(() => {
		if (!searchQuery.trim()) {
			return vinyls;
		}

		const query = searchQuery.toLowerCase();
		return vinyls.filter((vinyl) => {
			const titleMatch = vinyl.title?.toLowerCase().includes(query);
			const artistMatch = vinyl.artist?.toLowerCase().includes(query);
			return titleMatch || artistMatch;
		});
	}, [vinyls, searchQuery]);

	// Sort filtered vinyls
	const sortedVinyls = useMemo(() => {
		const sorted = [...filteredVinyls];

		switch (sortBy) {
			case "price-asc":
				return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
			case "price-desc":
				return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
			case "title-asc":
				return sorted.sort((a, b) => a.title.localeCompare(b.title));
			case "title-desc":
				return sorted.sort((a, b) => b.title.localeCompare(a.title));
			case "date-asc":
				return sorted.sort(
					(a, b) =>
						new Date(a.scraped_at).getTime() - new Date(b.scraped_at).getTime(),
				);
			case "date-desc":
			default:
				return sorted.sort(
					(a, b) =>
						new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime(),
				);
		}
	}, [filteredVinyls, sortBy]);

	// Paginate sorted vinyls
	const paginatedVinyls = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return sortedVinyls.slice(startIndex, endIndex);
	}, [sortedVinyls, currentPage]);

	const totalPages = Math.ceil(sortedVinyls.length / ITEMS_PER_PAGE);

	const handleSearchChange = (query: string): void => {
		setSearchQuery(query);
		setCurrentPage(1); // Reset to page 1 when search changes
	};

	const handleSortChange = (newSortBy: SortOption): void => {
		setSortBy(newSortBy);
		setCurrentPage(1); // Reset to page 1 when sort changes
	};

	const handlePageChange = (page: number): void => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (loading) {
		return (
			<div className="vinyl-list-container">
				<div className="loading-state">
					<div className="loading-spinner"></div>
					<p>Loading vinyl records...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="vinyl-list-container">
				<div className="error-state">
					<p>⚠️ {error}</p>
					<button onClick={() => window.location.reload()}>Retry</button>
				</div>
			</div>
		);
	}

	return (
		<div className="vinyl-list-container">
			<div className="vinyl-list-header">
				<h1 className="vinyl-list-title">🎵 Vinyl Bazar</h1>
				<p className="vinyl-list-subtitle">
					{sortedVinyls.length.toLocaleString()} vinyl records available
				</p>
			</div>

			<SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

			<div className="vinyl-list-controls">
				<SortControls sortBy={sortBy} onSortChange={handleSortChange} />
			</div>

			{sortedVinyls.length === 0 ? (
				<div className="empty-state">
					<p>No vinyl records found matching &quot;{searchQuery}&quot;</p>
					<button onClick={() => setSearchQuery("")}>Clear search</button>
				</div>
			) : (
				<>
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>

					<div className="vinyl-grid">
						{paginatedVinyls.map((vinyl) => (
							<VinylCard key={vinyl.id} vinyl={vinyl} />
						))}
					</div>

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</>
			)}
		</div>
	);
};

export default VinylList;

import "./SearchBar.css";

interface SearchBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
	searchQuery,
	onSearchChange,
}) => {
	return (
		<div className="search-bar">
			<div className="search-input-container">
				<svg
					className="search-icon"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
				>
					<circle cx="11" cy="11" r="8" strokeWidth="2" />
					<path
						d="m21 21-4.35-4.35"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
				<input
					type="text"
					className="search-input"
					placeholder="Search by title or artist..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
				{searchQuery && (
					<button
						className="search-clear"
						onClick={() => onSearchChange("")}
						aria-label="Clear search"
					>
						×
					</button>
				)}
			</div>
		</div>
	);
};

export default SearchBar;

import { SortOption } from "../types/vinyl";
import "./SortControls.css";

interface SortControlsProps {
	sortBy: SortOption;
	onSortChange: (sortBy: SortOption) => void;
}

const SortControls: React.FC<SortControlsProps> = ({
	sortBy,
	onSortChange,
}) => {
	return (
		<div className="sort-controls">
			<label htmlFor="sort-select" className="sort-label">
				Sort by:
			</label>
			<select
				id="sort-select"
				className="sort-select"
				value={sortBy}
				onChange={(e) => onSortChange(e.target.value as SortOption)}
			>
				<option value="date-desc">Newest First</option>
				<option value="date-asc">Oldest First</option>
				<option value="price-asc">Price: Low to High</option>
				<option value="price-desc">Price: High to Low</option>
				<option value="title-asc">Title: A to Z</option>
				<option value="title-desc">Title: Z to A</option>
			</select>
		</div>
	);
};

export default SortControls;

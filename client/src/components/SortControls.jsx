import PropTypes from 'prop-types';
import './SortControls.css';

const SortControls = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-controls">
      <label htmlFor="sort-select" className="sort-label">
        Sort by:
      </label>
      <select 
        id="sort-select"
        className="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
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

SortControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default SortControls;

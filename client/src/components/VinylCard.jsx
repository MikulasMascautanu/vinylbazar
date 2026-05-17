import PropTypes from 'prop-types';
import './VinylCard.css';

const VinylCard = ({ vinyl }) => {
  const formatPrice = (price) => {
    return price ? `${price.toFixed(0)} Kč` : 'N/A';
  };

  return (
    <div className="vinyl-card">
      <a href={vinyl.product_url} target="_blank" rel="noopener noreferrer" className="vinyl-card-link">
        <div className="vinyl-card-image-container">
          {vinyl.image_url ? (
            <img 
              src={vinyl.image_url} 
              alt={vinyl.title}
              className="vinyl-card-image"
              loading="lazy"
            />
          ) : (
            <div className="vinyl-card-no-image">
              <span>🎵</span>
            </div>
          )}
        </div>
        <div className="vinyl-card-content">
          <h3 className="vinyl-card-title">{vinyl.title}</h3>
          {vinyl.artist && (
            <p className="vinyl-card-artist">{vinyl.artist}</p>
          )}
          <div className="vinyl-card-footer">
            <span className="vinyl-card-price">{formatPrice(vinyl.price)}</span>
            {vinyl.category && (
              <span className="vinyl-card-category">{vinyl.category}</span>
            )}
          </div>
        </div>
      </a>
    </div>
  );
};

VinylCard.propTypes = {
  vinyl: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string,
    price: PropTypes.number,
    image_url: PropTypes.string,
    product_url: PropTypes.string.isRequired,
    category: PropTypes.string,
    scraped_at: PropTypes.string,
  }).isRequired,
};

export default VinylCard;

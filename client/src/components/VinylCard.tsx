import { Vinyl, isNewRecord } from "../types/vinyl";
import "./VinylCard.css";

interface VinylCardProps {
	vinyl: Vinyl;
}

const VinylCard: React.FC<VinylCardProps> = ({ vinyl }) => {
	const formatPrice = (price: number | null): string => {
		return price ? `${price.toFixed(0)} Kč` : "N/A";
	};

	const isNew = isNewRecord(vinyl);

	return (
		<div className={`vinyl-card ${isNew ? "vinyl-card-new" : ""}`}>
			<a
				href={vinyl.product_url}
				target="_blank"
				rel="noopener noreferrer"
				className="vinyl-card-link"
			>
				{isNew && <div className="vinyl-card-new-badge">NEW</div>}
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
					{vinyl.artist && <p className="vinyl-card-artist">{vinyl.artist}</p>}
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

export default VinylCard;

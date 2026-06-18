import { Percent } from "lucide-react";

function OfferCard({ offer }) {
  return (
    <article className="offer-card">
      <div className="offer-visual">
        <Percent size={42} />
      </div>

      <div>
        <h3>{offer.name}</h3>
        <p>{offer.desc}</p>
        <strong>{offer.price}</strong>
      </div>
    </article>
  );
}

export default OfferCard;
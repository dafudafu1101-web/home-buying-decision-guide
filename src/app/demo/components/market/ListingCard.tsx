import { DemoListing } from "@/lib/types";
import { StatusBadge } from "../ui/Badge";

export function ListingCard({ listing }: { listing: DemoListing }) {
  return (
    <div className="listing">
      <div className="listing-head">
        <span className="listing-price">{listing.priceManYen.toLocaleString()}万円</span>
        <StatusBadge status={listing.status} />
      </div>
      <div className="listing-meta">
        {listing.area} ・ 徒歩{listing.walkMinutes}分 ・ {listing.sizeSqm}㎡ ・ {listing.builtYear}年築
      </div>
      {listing.note && <div className="tiny muted" style={{ marginTop: 4 }}>{listing.note}</div>}
    </div>
  );
}

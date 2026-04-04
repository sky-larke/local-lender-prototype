import type { Listing } from '../types/listing';
import { formatCurrency } from '../utilities/formatCurrency';

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onQuickRequest: (listing: Listing) => void;
  onDirectMessage: (listing: Listing) => void;
}

export const ListingModal = ({
  listing,
  onClose,
  onQuickRequest,
  onDirectMessage,
}: ListingModalProps) => {
  if (!listing) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close listing modal"
          className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow"
        >
          Close
        </button>

        <div className="aspect-[16/9] w-full bg-slate-100">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No photo
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {listing.category}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{listing.title}</h2>
              <p className="mt-2 text-sm text-slate-500">Owned by {listing.ownerName}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                listing.isAvailable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {listing.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">{listing.description}</p>

          <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{listing.locationText}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatCurrency(listing.pricePerDay)}/day
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                onDirectMessage(listing);
              }}
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Direct message owner
            </button>
            <button
              type="button"
              onClick={() => {
                onQuickRequest(listing);
              }}
              disabled={!listing.isAvailable}
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Quick request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

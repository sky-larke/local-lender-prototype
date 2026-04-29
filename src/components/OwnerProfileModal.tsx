import { useMemo } from 'react';
import { useListItems, useListReviews } from '../dataconnect/react';
import { ListingCard } from './ListingCard';
import type { Listing } from '../types/listing';
import type { ListItemsData } from '../dataconnect';

interface OwnerProfileModalProps {
  lenderId?: string;
  lenderName?: string;
  onClose: () => void;
  onListingClick: (listing: Listing) => void;
}

function mapItem(item: ListItemsData['items'][0]): Listing {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    createdAt: item.createdAt,
    status: (item.status as Listing['status']) || 'available',
    price: item.price ?? 0,
    imageUrl: item.imageUrl ?? '',
    locationDetails: item.locationDetails ?? '',
    category: item.category ?? '',
    lenderId: item.lender?.uid ?? '',
    lenderName: item.lender?.displayName ?? '',
    condition: (item.condition as Listing['condition']) || 'good',
  };
}

export const OwnerProfileModal = ({ lenderId, lenderName, onClose, onListingClick }: OwnerProfileModalProps) => {
  if (!lenderId || !lenderName) return null;

  const { data: itemsData, isLoading: itemsLoading } = useListItems();
  const { data: reviewsData, isLoading: reviewsLoading } = useListReviews();

  const ownerListings = useMemo(() => {
    if (!itemsData?.items) return [];
    return itemsData.items
      .filter((item) => item.lender?.uid === lenderId)
      .map(mapItem);
  }, [itemsData, lenderId]);

  const ownerReviews = useMemo(() => {
    if (!reviewsData?.reviews) return [];
    return reviewsData.reviews.filter((review) => review.reviewedUser?.uid === lenderId);
  }, [reviewsData, lenderId]);

  const averageRating = useMemo(() => {
    if (ownerReviews.length === 0) return undefined;
    const total = ownerReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / ownerReviews.length;
  }, [ownerReviews]);

  const ratingLabel = typeof averageRating === 'number' 
    ? `${averageRating.toFixed(1)} ★` 
    : 'No Rating Yet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div 
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile modal"
          className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow"
        >
          Close
        </button>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
              {lenderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{lenderName}</h2>
              <p className="text-sm text-slate-500">
                {ratingLabel} · {ownerReviews.length} review{ownerReviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Listings ({ownerListings.length})
            </h3>
            {itemsLoading ? (
              <p className="mt-2 text-sm text-slate-500">Loading listings...</p>
            ) : ownerListings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No listings yet.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {ownerListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    ownerRating={averageRating}
                    onClick={onListingClick}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Reviews ({ownerReviews.length})
            </h3>
            {reviewsLoading ? (
              <p className="mt-2 text-sm text-slate-500">Loading reviews...</p>
            ) : ownerReviews.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No reviews yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {ownerReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{'Anonymous'}</p>
                      <div className="flex items-center gap-1">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
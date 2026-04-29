import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  useListMyItems,
  useUpdateItem,
  useUpdateItemStatus,
  useDeleteItem,
  useListReviews,
} from '../dataconnect/react';
import type { ListMyItemsData } from '../dataconnect';
import { ListingCard } from '../components/ListingCard';
import { useAppContext } from '../context/AppContext';
import type { Listing, ListingFormValues } from '../types/listing';

type SDKItem = ListMyItemsData['items'][0];

function mapItem(item: SDKItem, currentUser: any): Listing {
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
    lenderId: currentUser?.uid ?? '',
    lenderName: currentUser?.displayName ?? '',
    condition: (item.condition as Listing['condition']) || 'good',
  };
}

export const ListingsPage = () => {
  const { currentUser } = useAppContext();

  const { data: myItemsData } = useListMyItems();
  const { data: reviewsData } = useListReviews();

  const { mutateAsync: updateItem } = useUpdateItem();
  const { mutateAsync: updateItemStatus } = useUpdateItemStatus();
  const { mutateAsync: deleteItem } = useDeleteItem();

  const reviews = useMemo(() => reviewsData?.reviews ?? [], [reviewsData]);

  const ownerRatings = useMemo(() => {
    const ratingMap = new Map<string, { total: number; count: number }>();

    reviews.forEach((review) => {
      const revieweeName = review.reviewedUser?.displayName;
      if (!revieweeName) return;

      const existing = ratingMap.get(revieweeName);

      if (existing) {
        ratingMap.set(revieweeName, {
          total: existing.total + review.rating,
          count: existing.count + 1,
        });
      } else {
        ratingMap.set(revieweeName, {
          total: review.rating,
          count: 1,
        });
      }
    });

    return new Map(
      Array.from(ratingMap.entries()).map(([name, data]) => [
        name,
        data.total / data.count,
      ]),
    );
  }, [reviews]);

  const serverListings = useMemo(
    () => (myItemsData?.items ?? []).map((item) => mapItem(item, currentUser)),
    [myItemsData, currentUser],
  );

  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    setMyListings(serverListings);
  }, [serverListings]);

  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const [editValues, setEditValues] = useState<ListingFormValues>({
    title: '',
    description: '',
    price: 0,
    locationDetails: '',
    category: 'Tools',
    imageUrl: '',
    condition: 'good',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [actionError, setActionError] = useState('');

  const handleEditClick = (listing: Listing) => {
    setEditingListing(listing);

    setEditValues({
      title: listing.title,
      description: listing.description,
      price: listing.price ?? 0,
      locationDetails: listing.locationDetails ?? '',
      category: listing.category ?? 'Tools',
      imageUrl: listing.imageUrl ?? '',
      condition: listing.condition ?? 'good',
    });

    setImagePreview(listing.imageUrl ?? '');
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImagePreview(result);
      setEditValues((v) => ({ ...v, imageUrl: result }));
    };

    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (event: { preventDefault(): void }) => {
    event.preventDefault();
    if (!editingListing) return;

    setActionError('');

    const previousListings = myListings;
    const previousEditingListing = editingListing;

    const updatedListing: Listing = {
      ...editingListing,
      title: editValues.title,
      description: editValues.description,
      price: editValues.price,
      imageUrl: editValues.imageUrl || imagePreview || '',
      locationDetails: editValues.locationDetails,
      category: editValues.category,
      condition: editValues.condition,
    };

    setMyListings((current) =>
      current.map((listing) =>
        listing.id === editingListing.id ? updatedListing : listing,
      ),
    );

    setEditingListing(null);

    try {
      await updateItem({
        id: editingListing.id,
        title: editValues.title,
        description: editValues.description,
        price: editValues.price,
        imageUrl: editValues.imageUrl || imagePreview || null,
        locationDetails: editValues.locationDetails,
        category: editValues.category,
        condition: editValues.condition,
      });
    } catch {
      setMyListings(previousListings);
      setEditingListing(previousEditingListing);
      setActionError('Could not save your changes. Please try again.');
    }
  };

  const handleToggleAvailability = async (listing: Listing) => {
    setActionError('');

    const previousListings = myListings;
    const nextStatus: Listing['status'] =
      listing.status === 'available' ? 'unavailable' : 'available';

    setMyListings((current) =>
      current.map((item) =>
        item.id === listing.id ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      await updateItemStatus({
        id: listing.id,
        status: nextStatus,
      });
    } catch {
      setMyListings(previousListings);
      setActionError('Could not update availability. Please try again.');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    setActionError('');

    const previousListings = myListings;

    setMyListings((current) =>
      current.filter((listing) => listing.id !== listingId),
    );

    try {
      await deleteItem({ id: listingId });
    } catch {
      setMyListings(previousListings);
      setActionError('Could not delete that listing. Please try again.');
    }
  };

  if (!currentUser) {
    return (
      <main className="mx-auto flex max-w-sm flex-col items-center gap-6 px-4 py-24">
        <h1 className="text-2xl font-bold text-slate-900">
          Sign in to LocalLender
        </h1>
        <p className="text-center text-sm text-slate-600">
          Sign in with your Google account to manage your listings.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Your listings</h1>
        <span className="text-sm text-slate-500">
          Edit, toggle availability, or delete
        </span>
      </div>

      {actionError ? (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      ) : null}

      {myListings.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
          You haven't listed anything yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myListings.map((listing) => (
            <div key={listing.id} className="space-y-3">
              {editingListing?.id === listing.id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit listing
                  </h3>

                  <div className="mt-4 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                      Title
                      <input
                        required
                        value={editValues.title}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            title: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                      />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Description
                      <textarea
                        required
                        rows={3}
                        value={editValues.description}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            description: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Price per day
                        <input
                          required
                          min={0}
                          type="number"
                          value={editValues.price}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              price: Number(e.target.value),
                            }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                        />
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Category
                        <select
                          value={editValues.category}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              category: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                        >
                          {[
                            'Tools',
                            'Home',
                            'Outdoor',
                            'Electronics',
                            'Sports',
                            'Other',
                          ].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block text-sm font-medium text-slate-700">
                      Location
                      <input
                        required
                        value={editValues.locationDetails}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            locationDetails: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                      />
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Condition
                      <select
                        value={editValues.condition}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            condition: e.target
                              .value as ListingFormValues['condition'],
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                      >
                        <option value="new">New</option>
                        <option value="like_new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700"
                      />
                    </label>

                    {imagePreview ? (
                      <div className="overflow-hidden rounded-3xl border border-slate-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="submit"
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Save changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingListing(null)}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <ListingCard
                    listing={listing}
                    ownerRating={ownerRatings.get(listing.lenderName)}
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleEditClick(listing)}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(listing)}
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mark{' '}
                      {listing.status === 'available'
                        ? 'unavailable'
                        : 'available'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteListing(listing.id)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
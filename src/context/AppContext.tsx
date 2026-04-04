import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Listing, ListingFormValues } from '../types/listing';
import type { Review, ReviewFormValues } from '../types/review';

interface AppContextValue {
  currentUserName: string;
  listings: Listing[];
  reviews: Review[];
  addListing: (values: ListingFormValues) => void;
  updateListing: (listingId: string, values: ListingFormValues) => void;
  updateListingAvailability: (listingId: string) => void;
  deleteListing: (listingId: string) => void;
  addReview: (values: ReviewFormValues) => void;
}

const initialListings: Listing[] = [
  {
    id: 'listing-1',
    ownerName: 'Jordan',
    title: 'Cordless Drill',
    description: 'Compact drill with charger and two batteries.',
    pricePerDay: 8,
    locationText: 'Near Hyde Park',
    category: 'Tools',
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'listing-2',
    ownerName: 'Priya',
    title: 'Basketball',
    description: 'Indoor-outdoor basketball in great condition.',
    pricePerDay: 4,
    locationText: 'Near South Loop',
    category: 'Sports',
    isAvailable: true,
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'listing-3',
    ownerName: 'Alex',
    title: 'Projector',
    description: 'Portable projector with HDMI cable included.',
    pricePerDay: 15,
    locationText: 'Near Pilsen',
    category: 'Electronics',
    isAvailable: false,
    imageUrl:
      'https://images.unsplash.com/photo-1528395874238-34ebe249b3f2?auto=format&fit=crop&w=900&q=80',
  },
];

const initialReviews: Review[] = [
  {
    id: 'review-1',
    reviewerName: 'Maya',
    revieweeName: 'Jordan',
    rating: 5,
    comment: 'Easy pickup and return. The drill worked perfectly.',
  },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const currentUserName = 'Maya';

  const addListing = (values: ListingFormValues) => {
    const nextListing: Listing = {
      id: `listing-${crypto.randomUUID()}`,
      ownerName: currentUserName,
      title: values.title,
      description: values.description,
      pricePerDay: values.pricePerDay,
      locationText: values.locationText,
      category: values.category,
      isAvailable: true,
      imageUrl: values.imageUrl,
    };

    setListings((current) => [nextListing, ...current]);
  };

  const updateListing = (listingId: string, values: ListingFormValues) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              title: values.title,
              description: values.description,
              pricePerDay: values.pricePerDay,
              locationText: values.locationText,
              category: values.category,
              imageUrl: values.imageUrl,
            }
          : listing,
      ),
    );
  };

  const updateListingAvailability = (listingId: string) => {
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId
          ? { ...listing, isAvailable: !listing.isAvailable }
          : listing,
      ),
    );
  };

  const deleteListing = (listingId: string) => {
    setListings((current) => current.filter((listing) => listing.id !== listingId));
  };

  const addReview = (values: ReviewFormValues) => {
    const nextReview: Review = {
      id: `review-${crypto.randomUUID()}`,
      reviewerName: values.reviewerName,
      revieweeName: values.revieweeName,
      rating: values.rating,
      comment: values.comment,
    };

    setReviews((current) => [nextReview, ...current]);
  };

  const value = useMemo(
    () => ({
      currentUserName,
      listings,
      reviews,
      addListing,
      updateListing,
      updateListingAvailability,
      deleteListing,
      addReview,
    }),
    [listings, reviews],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};

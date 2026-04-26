export type ItemStatus = 'available' | 'lent' | 'unavailable';

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: ItemStatus;
  price: number;
  imageUrl: string;
  locationDetails: string;
  category: string;
  lenderId: string;
  lenderName: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  price: number;
  locationDetails: string;
  category: string;
  imageUrl: string;
  condition: ListingCondition;
}

export interface Listing {
  id: string;
  ownerName: string;
  title: string;
  description: string;
  pricePerDay: number;
  locationText: string;
  category: string;
  isAvailable: boolean;
  imageUrl: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  pricePerDay: number;
  locationText: string;
  category: string;
  imageUrl: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  revieweeName: string;
  rating: number;
  comment: string;
}

export interface ReviewFormValues {
  reviewerName: string;
  revieweeName: string;
  rating: number;
  comment: string;
}

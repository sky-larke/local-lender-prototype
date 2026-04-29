import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateReview, useUpdateUserRating } from '../dataconnect/react';
import { useAppContext } from '../context/AppContext';

interface ReviewFormProps {
  revieweeUid: string;
  revieweeName: string;
  revieweeRating?: number | null;
  revieweeReviewCount?: number | null;
  onSubmitted?: () => void;
}

export const ReviewForm = ({
  revieweeUid,
  revieweeName,
  revieweeRating,
  revieweeReviewCount,
  onSubmitted,
}: ReviewFormProps) => {
  const { currentUser } = useAppContext();
  const queryClient = useQueryClient();
  const { mutateAsync: createReview, isPending } = useCreateReview();
  const { mutateAsync: updateUserRating } = useUpdateUserRating();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Should never happen if placed correctly, but guard anyway
  if (!currentUser || currentUser.uid === revieweeUid) return null;

  if (submitted) {
    return (
      <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Review submitted for {revieweeName}.
      </p>
    );
  }

  const handleSubmit = async (event: { preventDefault(): void }) => {
    event.preventDefault();
    setError('');

    try {
      await createReview({ reviewedUserUid: revieweeUid, rating, comment });

      // Incrementally update stored average
      const oldCount = revieweeReviewCount ?? 0;
      const oldAvg = revieweeRating ?? 0;
      const newCount = oldCount + 1;
      const newAvg = (oldAvg * oldCount + rating) / newCount;
      await updateUserRating({ uid: revieweeUid, averageRating: newAvg, reviewCount: newCount });

      await queryClient.invalidateQueries();
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError('Could not submit your review. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Leave a review for <span className="font-semibold">{revieweeName}</span></p>

      <label className="block text-sm text-slate-600">
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>{v} stars</option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-slate-600">
        Comment
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share how the interaction went"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
};

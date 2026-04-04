import { useState, type FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';

export const ReviewForm = () => {
  const { addReview, currentUserName } = useAppContext();
  const [revieweeName, setRevieweeName] = useState('Jordan');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addReview({
      reviewerName: currentUserName,
      revieweeName,
      rating,
      comment,
    });

    setComment('');
    setRating(5);
    setStatus('Review submitted.');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Leave a review</h2>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Who are you reviewing?
        <input
          value={revieweeName}
          onChange={(event) => {
            setRevieweeName(event.target.value);
          }}
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Rating
        <select
          value={rating}
          onChange={(event) => {
            setRating(Number(event.target.value));
          }}
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Comment
        <textarea
          rows={4}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
          }}
          placeholder="Share how the interaction went"
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
        />
      </label>

      <button
        type="submit"
        className="mt-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Submit review
      </button>

      {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
    </form>
  );
};

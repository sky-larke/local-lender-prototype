import { useEffect, useMemo, useState } from 'react';
import { useListMyReviews } from '../dataconnect/react';
import type { ListMyReviewsData } from '../dataconnect';
import { useAppContext } from '../context/AppContext';

type SDKReview = ListMyReviewsData['reviews'][0];

export const AccountPage = () => {
  const { currentUser, signIn, signOut } = useAppContext();

  const { data: reviewsData } = useListMyReviews();

  const serverReviews: SDKReview[] = useMemo(() => reviewsData?.reviews ?? [], [reviewsData]);
  const [myReviews, setMyReviews] = useState<SDKReview[]>([]);

  useEffect(() => {
    setMyReviews(serverReviews);
  }, [serverReviews]);

  const averageRating = useMemo(() => {
    if (myReviews.length === 0) return undefined;
    const total = myReviews.reduce((sum, r) => sum + r.rating, 0);
    return total / myReviews.length;
  }, [myReviews]);

  if (!currentUser) {
    return (
      <main className="mx-auto flex max-w-sm flex-col items-center gap-6 px-4 py-24">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to LocalLender</h1>
        <p className="text-center text-sm text-slate-600">
          Sign in with your Google account to manage your listings and account.
        </p>
        <button
          type="button"
          onClick={signIn}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
            <path fill="#FBBC05" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.8 36.8 27 37.8 24 37.8c-6.1 0-11.3-4.1-13.2-9.7l-7 5.4C7.5 41.5 15.1 46 24 46z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 2.8-2.9 5.1-5.3 6.6l6.7 5.5C41.8 37.3 44.5 31.1 44.5 24c0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {currentUser.displayName}
          </h1>
          <button
            type="button"
            onClick={signOut}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">Manage your listings and keep your trust profile strong.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Reviews received</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{myReviews.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Average rating</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{averageRating?.toFixed(1) ?? '—'}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Reviews received</h2>
        {myReviews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {myReviews.map((review) => {
              const req = review.lendingRequest;
              const wasLender = req?.lender?.uid === currentUser.uid;
              const role = wasLender ? 'You lent this item' : 'You borrowed this item';
              const dateRange = req?.startDate && req?.endDate
                ? `${req.startDate} → ${req.endDate}`
                : req?.endDate
                ? `Returned ${req.endDate}`
                : null;

              return (
                <article key={review.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {req?.item && (
                    <a
                      href={`/items/${req.item.id}`}
                      className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                    >
                      {req.item.imageUrl ? (
                        <img src={req.item.imageUrl} alt={req.item.title} className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-xs text-slate-400">No photo</div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{req.item.title}</p>
                        <p className="text-xs text-slate-500">{req.item.category}</p>
                      </div>
                      <span className="ml-auto text-xs text-emerald-600">View listing →</span>
                    </a>
                  )}

                  <div className="px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{review.reviewer?.displayName}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{role}</span>
                          {dateRange && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{dateRange}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        <span className="ml-1 text-slate-600">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">"{review.comment}"</p>
                    ) : (
                      <p className="mt-3 text-sm italic text-slate-400">No written comment.</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

import { useEffect, useMemo, useState } from 'react';
import {
  useListIncomingRequests,
  useListOutgoingRequests,
  useUpdateLendingRequestStatus,
} from '../dataconnect/react';
import type {
  ListIncomingRequestsData,
  ListOutgoingRequestsData,
} from '../dataconnect';
import { useAppContext } from '../context/AppContext';

type IncomingRequest = ListIncomingRequestsData['lendingRequests'][0];
type OutgoingRequest = ListOutgoingRequestsData['lendingRequests'][0];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected',
  completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-sky-100 text-sky-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export const RequestsPage = () => {
  const { currentUser } = useAppContext();

  const { data: incomingData } = useListIncomingRequests();
  const { data: outgoingData } = useListOutgoingRequests();

  const { mutateAsync: updateLendingRequestStatus } = useUpdateLendingRequestStatus();

  const serverIncomingRequests: IncomingRequest[] = useMemo(() => incomingData?.lendingRequests ?? [], [incomingData]);
  const serverOutgoingRequests: OutgoingRequest[] = useMemo(() => outgoingData?.lendingRequests ?? [], [outgoingData]);

  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);

  useEffect(() => {
    setIncomingRequests(serverIncomingRequests);
  }, [serverIncomingRequests]);

  useEffect(() => {
    setOutgoingRequests(serverOutgoingRequests);
  }, [serverOutgoingRequests]);

  const [actionError, setActionError] = useState('');

  const handleIncomingStatusChange = async (requestId: string, status: string) => {
    setActionError('');
    const previousRequests = incomingRequests;

    setIncomingRequests((current) =>
      current.map((req) => (req.id === requestId ? { ...req, status } : req)),
    );

    try {
      await updateLendingRequestStatus({ id: requestId, status });
    } catch {
      setIncomingRequests(previousRequests);
      setActionError('Could not update that request. Please try again.');
    }
  };

  const handleOutgoingStatusChange = async (requestId: string, status: string) => {
    setActionError('');
    const previousRequests = outgoingRequests;

    setOutgoingRequests((current) =>
      current.map((req) => (req.id === requestId ? { ...req, status } : req)),
    );

    try {
      await updateLendingRequestStatus({ id: requestId, status });
    } catch {
      setOutgoingRequests(previousRequests);
      setActionError('Could not update that request. Please try again.');
    }
  };

  if (!currentUser) {
    return (
      <main className="mx-auto flex max-w-sm flex-col items-center gap-6 px-4 py-24">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to LocalLender</h1>
        <p className="text-center text-sm text-slate-600">
          Sign in with your Google account to view your requests.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {actionError ? <p className="mb-4 text-sm text-red-600">{actionError}</p> : null}

      {incomingRequests.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Incoming borrow requests</h2>
          <div className="mt-4 space-y-3">
            {incomingRequests.map((req) => (
              <article key={req.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{req.item?.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      From <span className="font-medium">{req.borrower?.displayName}</span>
                      {req.startDate && req.endDate ? ` · ${req.startDate} → ${req.endDate}` : null}
                    </p>
                    {req.borrowerNotes ? (
                      <p className="mt-2 text-sm text-slate-600">"{req.borrowerNotes}"</p>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[req.status]}`}>
                    {STATUS_LABEL[req.status]}
                  </span>
                </div>
                {req.status === 'pending' ? (
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={() => handleIncomingStatusChange(req.id, 'accepted')}
                      className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      Accept
                    </button>
                    <button type="button" onClick={() => handleIncomingStatusChange(req.id, 'rejected')}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                ) : null}
                {req.status === 'accepted' ? (
                  <div className="mt-3">
                    <button type="button" onClick={() => handleIncomingStatusChange(req.id, 'completed')}
                      className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
                      Mark completed
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Incoming borrow requests</h2>
          <p className="mt-4 text-sm text-slate-600">No incoming requests yet.</p>
        </section>
      )}

      {outgoingRequests.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Your borrow requests</h2>
          <div className="mt-4 space-y-3">
            {outgoingRequests.map((req) => (
              <article key={req.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{req.item?.title}</p>
                    {req.startDate && req.endDate ? (
                      <p className="mt-1 text-sm text-slate-500">{req.startDate} → {req.endDate}</p>
                    ) : null}
                    {req.borrowerNotes ? (
                      <p className="mt-2 text-sm text-slate-600">"{req.borrowerNotes}"</p>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[req.status]}`}>
                    {STATUS_LABEL[req.status]}
                  </span>
                </div>
                {req.status === 'pending' ? (
                  <div className="mt-3">
                    <button type="button" onClick={() => handleOutgoingStatusChange(req.id, 'cancelled')}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Cancel request
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Your borrow requests</h2>
          <p className="mt-4 text-sm text-slate-600">No outgoing requests yet.</p>
        </section>
      )}
    </main>
  );
};
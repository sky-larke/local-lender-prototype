import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { ListingModal } from './ListingModal';
import type { Listing } from '../types/listing';

vi.mock('../dataconnect/react', () => ({
  useCreateLendingRequest: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) })),
}));

import { useCreateLendingRequest } from '../dataconnect/react';
import { useAppContext } from '../context/AppContext';

const mockUser = { uid: 'borrower-1', displayName: 'Alice Borrower', email: 'alice@example.com' };

const availableListing: Listing = {
  id: 'item-1',
  title: 'Power Drill',
  description: 'A reliable power drill for home repairs',
  createdAt: '2026-01-01',
  status: 'available',
  price: 5,
  imageUrl: '',
  locationDetails: 'Evanston, IL',
  category: 'Tools',
  lenderId: 'lender-1',
  lenderName: 'Bob Lender',
  condition: 'good',
};

const lentListing: Listing = { ...availableListing, status: 'lent' };

describe('ListingModal — borrower cannot request again', () => {
  const onClose = vi.fn();
  const onRequestSent = vi.fn();
  const onDirectMessage = vi.fn();
  const mockCreateLendingRequest = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppContext).mockReturnValue({
      currentUser: mockUser as any,
      authLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useCreateLendingRequest).mockReturnValue({
      mutateAsync: mockCreateLendingRequest,
      isPending: false,
    } as any);
  });

  it('enables the "Request to borrow" button for an available listing', () => {
    render(
      <ListingModal
        listing={availableListing}
        onClose={onClose}
        onRequestSent={onRequestSent}
        onDirectMessage={onDirectMessage}
      />,
    );
    expect(screen.getByRole('button', { name: 'Request to borrow' })).not.toBeDisabled();
  });

  it('disables the "Request to borrow" button when the item is already lent out', () => {
    render(
      <ListingModal
        listing={lentListing}
        onClose={onClose}
        onRequestSent={onRequestSent}
        onDirectMessage={onDirectMessage}
      />,
    );
    expect(screen.getByRole('button', { name: 'Request to borrow' })).toBeDisabled();
  });

  it('submits the request exactly once when the form is filled and sent', async () => {
    render(
      <ListingModal
        listing={availableListing}
        onClose={onClose}
        onRequestSent={onRequestSent}
        onDirectMessage={onDirectMessage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Request to borrow' }));
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-15' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-17' } });
    fireEvent.change(screen.getByLabelText(/notes for the lender/i), {
      target: { value: 'Need it for the weekend' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    await waitFor(() => {
      expect(mockCreateLendingRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateLendingRequest).toHaveBeenCalledWith({
        itemId: 'item-1',
        lenderUid: 'lender-1',
        borrowerNotes: 'Need it for the weekend',
        startDate: '2026-06-15',
        endDate: '2026-06-17',
      });
    });
  });

  it('calls onRequestSent and hides the form after a successful submission', async () => {
    render(
      <ListingModal
        listing={availableListing}
        onClose={onClose}
        onRequestSent={onRequestSent}
        onDirectMessage={onDirectMessage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Request to borrow' }));
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-15' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-17' } });
    fireEvent.change(screen.getByLabelText(/notes for the lender/i), {
      target: { value: 'Need it for the weekend' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));

    await waitFor(() => {
      expect(onRequestSent).toHaveBeenCalledWith(availableListing);
    });

    // form is hidden after submit — the "Send request" button should no longer be visible
    expect(screen.queryByRole('button', { name: 'Send request' })).not.toBeInTheDocument();
  });
});

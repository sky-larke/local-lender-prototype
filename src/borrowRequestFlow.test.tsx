import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, beforeEach, expect, it, vi } from 'vitest';

vi.mock('./dataconnect/react', () => ({
  useCreateLendingRequest: vi.fn(),
  useListIncomingRequests: vi.fn(),
  useListOutgoingRequests: vi.fn(),
  useUpdateLendingRequestStatus: vi.fn(),
}));

vi.mock('./context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock('./components/OwnerProfileModal', () => ({
  OwnerProfileModal: () => null,
}));

vi.mock('./components/ReviewForm', () => ({
  ReviewForm: () => null,
}));

vi.mock('./components/ListingModal', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./components/ListingModal')>();
  return actual;
});

import { ListingModal } from './components/ListingModal';
import { RequestsPage } from './pages/RequestsPage';
import { useCreateLendingRequest } from './dataconnect/react';
import {
  useListIncomingRequests,
  useListOutgoingRequests,
  useUpdateLendingRequestStatus,
} from './dataconnect/react';
import { useAppContext } from './context/AppContext';
import type { Listing } from './types/listing';

const mockBorrower = { uid: 'borrower-1', displayName: 'Alice Borrower', email: 'alice@example.com' };
const mockLender = { uid: 'lender-1', displayName: 'Bob Lender', email: 'bob@example.com' };

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

const mockRequest = {
  id: 'request-1',
  requestedAt: '2026-06-10T00:00:00Z',
  status: 'pending',
  borrowerNotes: 'Need it for the weekend',
  startDate: '2026-06-15',
  endDate: '2026-06-17',
  item: {
    id: 'item-1',
    title: 'Power Drill',
    price: 5,
    lender: { uid: 'lender-1', displayName: 'Bob Lender', __typename: 'User_Key' as const },
    __typename: 'Item_Key' as const,
  },
  borrower: {
    uid: 'borrower-1',
    displayName: 'Alice Borrower',
    averageRating: null,
    reviewCount: null,
    __typename: 'User_Key' as const,
  },
  lender: {
    uid: 'lender-1',
    displayName: 'Bob Lender',
    averageRating: null,
    reviewCount: null,
    __typename: 'User_Key' as const,
  },
  __typename: 'LendingRequest_Key' as const,
};

const submitBorrowRequest = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Request to borrow' }));
  fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-15' } });
  fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-17' } });
  fireEvent.change(screen.getByLabelText(/notes for the lender/i), {
    target: { value: 'Need it for the weekend' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
};

describe('borrow request flow', () => {
  const onClose = vi.fn();
  const onRequestSent = vi.fn();
  const onDirectMessage = vi.fn();
  const mockCreate = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppContext).mockReturnValue({
      currentUser: mockBorrower as any,
      authLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useCreateLendingRequest).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    } as any);
    vi.mocked(useUpdateLendingRequestStatus).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  describe('sending a request', () => {
    it('calls createLendingRequest with the correct item and borrower details', async () => {
      render(
        <ListingModal
          listing={availableListing}
          onClose={onClose}
          onRequestSent={onRequestSent}
          onDirectMessage={onDirectMessage}
        />,
      );

      submitBorrowRequest();

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith({
          itemId: 'item-1',
          lenderUid: 'lender-1',
          borrowerNotes: 'Need it for the weekend',
          startDate: '2026-06-15',
          endDate: '2026-06-17',
        });
      });
    });
  });

  describe('borrower cannot request again', () => {
    it('disables the button and changes its label to "Request sent" after submitting', async () => {
      render(
        <ListingModal
          listing={availableListing}
          onClose={onClose}
          onRequestSent={onRequestSent}
          onDirectMessage={onDirectMessage}
        />,
      );

      submitBorrowRequest();

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: 'Request sent' });
        expect(btn).toBeInTheDocument();
        expect(btn).toBeDisabled();
      });
    });

    it('does not call createLendingRequest a second time if the button is clicked after sending', async () => {
      render(
        <ListingModal
          listing={availableListing}
          onClose={onClose}
          onRequestSent={onRequestSent}
          onDirectMessage={onDirectMessage}
        />,
      );

      submitBorrowRequest();

      await waitFor(() => expect(screen.getByRole('button', { name: 'Request sent' })).toBeDisabled());

      fireEvent.click(screen.getByRole('button', { name: 'Request sent' }));

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('request is visible on both sides', () => {
    it('appears in the lender incoming requests list', () => {
      vi.mocked(useAppContext).mockReturnValue({
        currentUser: mockLender as any,
        authLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
      vi.mocked(useListIncomingRequests).mockReturnValue({
        data: { lendingRequests: [mockRequest] },
      } as any);
      vi.mocked(useListOutgoingRequests).mockReturnValue({
        data: { lendingRequests: [] },
      } as any);

      render(<RequestsPage />);

      expect(screen.getByText('Incoming borrow requests')).toBeInTheDocument();
      expect(screen.getByText('Power Drill')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Alice Borrower' })).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('appears in the borrower outgoing requests list', () => {
      vi.mocked(useListIncomingRequests).mockReturnValue({
        data: { lendingRequests: [] },
      } as any);
      vi.mocked(useListOutgoingRequests).mockReturnValue({
        data: { lendingRequests: [mockRequest] },
      } as any);

      render(<RequestsPage />);

      expect(screen.getByText('Your borrow requests')).toBeInTheDocument();
      expect(screen.getByText('Power Drill')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bob Lender' })).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});

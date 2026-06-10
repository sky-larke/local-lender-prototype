import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { RequestsPage } from './RequestsPage';

vi.mock('../dataconnect/react', () => ({
  useListIncomingRequests: vi.fn(),
  useListOutgoingRequests: vi.fn(),
  useUpdateLendingRequestStatus: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('../components/ListingModal', () => ({
  ListingModal: () => null,
}));

vi.mock('../components/OwnerProfileModal', () => ({
  OwnerProfileModal: () => null,
}));

vi.mock('../components/ReviewForm', () => ({
  ReviewForm: () => null,
}));

import {
  useListIncomingRequests,
  useListOutgoingRequests,
  useUpdateLendingRequestStatus,
} from '../dataconnect/react';
import { useAppContext } from '../context/AppContext';

const mockBorrower = { uid: 'borrower-1', displayName: 'Alice Borrower', email: 'alice@example.com' };
const mockLender = { uid: 'lender-1', displayName: 'Bob Lender', email: 'bob@example.com' };

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
    lender: {
      uid: 'lender-1',
      displayName: 'Bob Lender',
      __typename: 'User_Key' as const,
    },
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

describe('RequestsPage — borrow request visibility', () => {
  beforeEach(() => {
    vi.mocked(useUpdateLendingRequestStatus).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  describe('lender view (incoming requests)', () => {
    beforeEach(() => {
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
    });

    it('shows the requested item title in the incoming section', () => {
      render(<RequestsPage />);
      expect(screen.getByText('Incoming borrow requests')).toBeInTheDocument();
      expect(screen.getByText('Power Drill')).toBeInTheDocument();
    });

    it("shows the borrower's name on the incoming request", () => {
      render(<RequestsPage />);
      expect(screen.getByRole('button', { name: 'Alice Borrower' })).toBeInTheDocument();
    });

    it('shows the pending status badge', () => {
      render(<RequestsPage />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows Accept and Reject action buttons for a pending request', () => {
      render(<RequestsPage />);
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    });
  });

  describe('borrower view (outgoing requests)', () => {
    beforeEach(() => {
      vi.mocked(useAppContext).mockReturnValue({
        currentUser: mockBorrower as any,
        authLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
      vi.mocked(useListIncomingRequests).mockReturnValue({
        data: { lendingRequests: [] },
      } as any);
      vi.mocked(useListOutgoingRequests).mockReturnValue({
        data: { lendingRequests: [mockRequest] },
      } as any);
    });

    it('shows the requested item title in the outgoing section', () => {
      render(<RequestsPage />);
      expect(screen.getByText('Your borrow requests')).toBeInTheDocument();
      expect(screen.getByText('Power Drill')).toBeInTheDocument();
    });

    it("shows the lender's name on the outgoing request", () => {
      render(<RequestsPage />);
      expect(screen.getByRole('button', { name: 'Bob Lender' })).toBeInTheDocument();
    });

    it('shows the pending status badge', () => {
      render(<RequestsPage />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows a Cancel request button for a pending outgoing request', () => {
      render(<RequestsPage />);
      expect(screen.getByRole('button', { name: 'Cancel request' })).toBeInTheDocument();
    });
  });
});

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { ListingsPage } from './ListingsPage';

vi.mock('../dataconnect/react', () => ({
  useListMyItems: vi.fn(),
  useListReviews: vi.fn(),
  useUpdateItem: vi.fn(),
  useUpdateItemStatus: vi.fn(),
  useDeleteItem: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

import {
  useListMyItems,
  useListReviews,
  useUpdateItem,
  useUpdateItemStatus,
  useDeleteItem,
} from '../dataconnect/react';
import { useAppContext } from '../context/AppContext';

const mockUser = {
  uid: 'user-1',
  displayName: 'Erin Park',
  email: 'erin@example.com',
};

const mockItems = [
  {
    id: 'item-1',
    title: 'Power Drill',
    description: 'Cordless 20V drill, great for home repairs',
    createdAt: '2024-01-01',
    status: 'available',
    price: 5,
    imageUrl: '',
    locationDetails: 'Evanston, IL',
    category: 'Tools',
    condition: 'good',
  },
  {
    id: 'item-2',
    title: 'Mountain Bike',
    description: 'Trek trail bike, fits 5\'6"–6\'0"',
    createdAt: '2024-01-02',
    status: 'lent',
    price: 20,
    imageUrl: '',
    locationDetails: 'Chicago, IL',
    category: 'Sports',
    condition: 'like_new',
  },
];

describe('ListingsPage', () => {
  beforeEach(() => {
    vi.mocked(useAppContext).mockReturnValue({
      currentUser: mockUser as any,
      authLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useListMyItems).mockReturnValue({ data: { items: mockItems } } as any);
    vi.mocked(useListReviews).mockReturnValue({ data: { reviews: [] } } as any);
    vi.mocked(useUpdateItem).mockReturnValue({ mutateAsync: vi.fn() } as any);
    vi.mocked(useUpdateItemStatus).mockReturnValue({ mutateAsync: vi.fn() } as any);
    vi.mocked(useDeleteItem).mockReturnValue({ mutateAsync: vi.fn() } as any);
  });

  it('shows all posted listings for the signed-in user', () => {
    render(<ListingsPage />);

    expect(screen.getByText('Power Drill')).toBeInTheDocument();
    expect(screen.getByText('Mountain Bike')).toBeInTheDocument();
  });

  it('shows empty state when user has no listings', () => {
    vi.mocked(useListMyItems).mockReturnValue({ data: { items: [] } } as any);

    render(<ListingsPage />);

    expect(
      screen.getByText("You haven't listed anything yet."),
    ).toBeInTheDocument();
  });
});

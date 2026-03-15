import { render } from '@testing-library/react';
import { LandingMetrics } from '../LandingMetrics';

global.fetch = jest.fn();

const mockIntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
  takeRecords: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('LandingMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<LandingMetrics />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders metrics container', () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        activeUsers: 150,
        checklistsCreated: 500,
        applicationsTracked: 300,
      }),
    });

    const { container } = render(<LandingMetrics />);
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
});

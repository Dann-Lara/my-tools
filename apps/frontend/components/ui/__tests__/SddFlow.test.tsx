import { render, screen } from '@testing-library/react';
import { SddFlow } from '../SddFlow';

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

describe('SddFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all SDD steps', () => {
    render(<SddFlow />);
    
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Impl')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders step icons', () => {
    render(<SddFlow />);
    
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders feedback loop message', () => {
    render(<SddFlow />);
    
    expect(screen.getByText(/Feedback loop/)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

jest.mock('../../../lib/i18n-context', () => ({
  useI18n: () => ({
    t: {
      dashboard: { noChecklistsYet: 'No checklists yet' },
      checklist: {
        noChecklists: 'No checklists yet',
        createFirst: 'Create your first checklist',
        newChecklist: 'New Checklist',
      },
    },
    locale: 'en',
  }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('EmptyState', () => {
  it('renders default variant', () => {
    render(<EmptyState />);
    expect(screen.getByText('No checklists yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first checklist')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New Checklist' })).toBeInTheDocument();
  });

  it('renders dashboard variant', () => {
    render(<EmptyState variant="dashboard" />);
    expect(screen.getByText('No checklists yet')).toBeInTheDocument();
  });
});

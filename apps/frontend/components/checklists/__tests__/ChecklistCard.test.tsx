import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistCard } from '../ChecklistCard';
import type { Checklist, ChecklistStatus } from '../../../lib/checklists';

const mockChecklist: Checklist = {
  id: 'cl-1',
  title: 'Test Checklist',
  objective: 'Test objective',
  category: 'work',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  difficulty: 'medium',
  dailyTimeAvailable: 60,
  style: 'concrete-tasks',
  status: 'active' as ChecklistStatus,
  language: 'en',
  items: [
    { id: 't1', order: 1, description: 'Task 1', frequency: 'once', estimatedDuration: 10, hack: 'hack1', status: 'completed' },
    { id: 't2', order: 2, description: 'Task 2', frequency: 'once', estimatedDuration: 20, hack: 'hack2', status: 'pending' },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

jest.mock('../../../lib/i18n-context', () => ({
  useI18n: () => ({
    t: {
      checklist: {
        active: 'Active',
        paused: 'Paused',
        completed: 'Completed',
        tasksCount: 'tasks',
        telegramNoId: 'No Telegram chat ID configured',
        telegramSuccess: 'Sent to Telegram',
        telegramError: 'Error sending to Telegram',
        sendToTelegramTitle: 'Send to Telegram',
      },
      common: { confirm: 'Confirm' },
    },
    locale: 'en',
  }),
}));

jest.mock('../../../lib/checklists', () => ({
  checklistsApi: {
    sendToTelegram: jest.fn().mockResolvedValue({ message: 'Sent' }),
  },
}));

describe('ChecklistCard', () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders checklist information', () => {
    render(<ChecklistCard checklist={mockChecklist} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Test Checklist')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('1/2 tasks')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<ChecklistCard checklist={mockChecklist} onDelete={mockOnDelete} />);
    const progressBar = document.querySelector('.h-1\\.5');
    expect(progressBar).toBeInTheDocument();
  });

  it('calls onDelete when confirm button is clicked', () => {
    render(<ChecklistCard checklist={mockChecklist} onDelete={mockOnDelete} />);
    
    const deleteBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(deleteBtn);
    
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);
    
    expect(mockOnDelete).toHaveBeenCalled();
  });
});

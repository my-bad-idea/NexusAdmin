import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog open={false} type="info" title="Test" description="Desc" onConfirm={async () => {}} onCancel={() => {}} />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders title and description when open', () => {
    render(
      <ConfirmDialog open type="info" title="Confirm Action" description="Are you sure?" onConfirm={async () => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('Confirm Action')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open type="info" title="T" description="D" onConfirm={async () => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('danger type shows text input for confirmation', () => {
    render(
      <ConfirmDialog open type="danger" title="Delete" description="Permanent action" confirmText="confirm" onConfirm={async () => {}} onCancel={() => {}} />
    );
    expect(screen.getByPlaceholderText('confirm')).toBeTruthy();
  });

  it('danger confirm button is disabled until correct text is typed', async () => {
    render(
      <ConfirmDialog open type="danger" title="Delete" description="Permanent" confirmText="confirm" onConfirm={async () => {}} onCancel={() => {}} />
    );
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    expect(deleteBtn).toBeDisabled();

    const input = screen.getByPlaceholderText('confirm');
    fireEvent.change(input, { target: { value: 'confirm' } });
    await waitFor(() => expect(deleteBtn).not.toBeDisabled());
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfirmDialog open type="info" title="T" description="D" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });
});

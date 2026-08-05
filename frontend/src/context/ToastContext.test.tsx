import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

function Tetikleyici({ mesaj }: { mesaj: string }) {
  const toast = useToast();
  return (
    <button onClick={() => toast.show(mesaj)} type="button">
      göster
    </button>
  );
}

function renderToast(mesaj = 'Sepete eklendi.') {
  return render(
    <ToastProvider>
      <Tetikleyici mesaj={mesaj} />
    </ToastProvider>,
  );
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('başlangıçta hiçbir bildirim göstermez', () => {
    renderToast();
    expect(screen.queryByText('Sepete eklendi.')).not.toBeInTheDocument();
  });

  it('show çağrıldığında bildirimi gösterir', () => {
    renderToast();
    act(() => screen.getByRole('button', { name: 'göster' }).click());
    expect(screen.getByText('Sepete eklendi.')).toBeInTheDocument();
  });

  it('2,5 saniye sonra bildirimi kendiliğinden kaldırır', () => {
    renderToast();
    act(() => screen.getByRole('button', { name: 'göster' }).click());
    expect(screen.getByText('Sepete eklendi.')).toBeInTheDocument();

    act(() => void vi.advanceTimersByTime(2500));

    expect(screen.queryByText('Sepete eklendi.')).not.toBeInTheDocument();
  });

  it('süre dolmadan bildirim ekranda kalır', () => {
    renderToast();
    act(() => screen.getByRole('button', { name: 'göster' }).click());

    act(() => void vi.advanceTimersByTime(2400));

    expect(screen.getByText('Sepete eklendi.')).toBeInTheDocument();
  });

  it('üst üste gelen bildirimleri yığın olarak gösterir', () => {
    renderToast();
    const btn = screen.getByRole('button', { name: 'göster' });
    act(() => btn.click());
    act(() => btn.click());

    expect(screen.getAllByText('Sepete eklendi.')).toHaveLength(2);
  });

  it('bildirim alanı ekran okuyuculara duyurulur', () => {
    renderToast();
    act(() => screen.getByRole('button', { name: 'göster' }).click());

    const stack = screen.getByRole('status');
    expect(stack).toHaveAttribute('aria-live', 'polite');
  });

  it('provider dışında kullanım anlaşılır hata verir', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tetikleyici mesaj="x" />)).toThrow(
      /ToastProvider içinde kullanılmalı/,
    );
    spy.mockRestore();
  });
});

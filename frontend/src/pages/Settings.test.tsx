import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../i18n';
import type { Address } from '../types';

vi.mock('../api/services', () => ({
  addressesApi: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

const toastShow = vi.fn();
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ show: toastShow }) }));

const { addressesApi } = await import('../api/services');
const { Settings } = await import('./Settings');

const ev: Address = { id: 'a1', title: 'Ev', text: 'Urla / İzmir' };
const iş: Address = { id: 'a2', title: 'İş', text: 'Gebze / Kocaeli' };

describe('Settings — adres yönetimi', () => {
  beforeEach(() => {
    vi.mocked(addressesApi.list).mockReset();
    vi.mocked(addressesApi.create).mockReset();
    vi.mocked(addressesApi.remove).mockReset();
    toastShow.mockReset();
  });

  it('kayıtlı adresleri başlık ve metniyle listeler', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([ev, iş]);

    render(<Settings />);

    expect(await screen.findByText('Ev')).toBeInTheDocument();
    expect(screen.getByText('Urla / İzmir')).toBeInTheDocument();
    expect(screen.getByText('İş')).toBeInTheDocument();
  });

  it('adres yokken bilgilendirme metni gösterir', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([]);

    render(<Settings />);

    expect(await screen.findByText(t.settings.empty)).toBeInTheDocument();
  });

  it('yeni adres ekler, listeye yansıtır ve formu temizler', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([]);
    vi.mocked(addressesApi.create).mockResolvedValue(ev);

    render(<Settings />);
    await screen.findByText(t.settings.empty);

    await userEvent.type(screen.getByLabelText(t.settings.addressTitle), 'Ev');
    await userEvent.type(screen.getByLabelText(t.settings.addressText), 'Urla / İzmir');
    await userEvent.click(screen.getByRole('button', { name: t.settings.add }));

    await waitFor(() =>
      expect(addressesApi.create).toHaveBeenCalledWith({
        title: 'Ev',
        text: 'Urla / İzmir',
      }),
    );
    expect(await screen.findByText('Ev')).toBeInTheDocument();
    expect(screen.getByLabelText(t.settings.addressTitle)).toHaveValue('');
    expect(screen.getByLabelText(t.settings.addressText)).toHaveValue('');
  });

  it('adres eklendiğinde bildirim gösterir', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([]);
    vi.mocked(addressesApi.create).mockResolvedValue(ev);

    render(<Settings />);
    await screen.findByText(t.settings.empty);

    await userEvent.type(screen.getByLabelText(t.settings.addressTitle), 'Ev');
    await userEvent.type(screen.getByLabelText(t.settings.addressText), 'Urla / İzmir');
    await userEvent.click(screen.getByRole('button', { name: t.settings.add }));

    await waitFor(() => expect(toastShow).toHaveBeenCalledWith(t.settings.added));
  });

  it('adres siler ve sunucudan dönen listeyi gösterir', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([ev, iş]);
    vi.mocked(addressesApi.remove).mockResolvedValue([iş]);

    render(<Settings />);
    await screen.findByText('Ev');

    await userEvent.click(screen.getAllByRole('button', { name: t.settings.remove })[0]!);

    await waitFor(() => expect(addressesApi.remove).toHaveBeenCalledWith('a1'));
    await waitFor(() => expect(screen.queryByText('Ev')).not.toBeInTheDocument());
    expect(screen.getByText('İş')).toBeInTheDocument();
  });

  it('ekleme başarısız olursa hata gösterir ve liste değişmez', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([ev]);
    vi.mocked(addressesApi.create).mockRejectedValue(new Error('ağ hatası'));

    render(<Settings />);
    await screen.findByText('Ev');

    await userEvent.type(screen.getByLabelText(t.settings.addressTitle), 'İş');
    await userEvent.type(screen.getByLabelText(t.settings.addressText), 'Gebze / Kocaeli');
    await userEvent.click(screen.getByRole('button', { name: t.settings.add }));

    expect(await screen.findByRole('alert')).toHaveTextContent(t.errors.generic);
    expect(screen.queryByText('İş')).not.toBeInTheDocument();
  });

  it('başlık ve adres alanları zorunludur', async () => {
    vi.mocked(addressesApi.list).mockResolvedValue([]);

    render(<Settings />);
    await screen.findByText(t.settings.empty);

    expect(screen.getByLabelText(t.settings.addressTitle)).toBeRequired();
    expect(screen.getByLabelText(t.settings.addressText)).toBeRequired();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../i18n';

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigate };
});

const signIn = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, signIn, signOut: vi.fn() }),
}));

vi.mock('../api/services', () => ({ authApi: { register: vi.fn() } }));

const { authApi } = await import('../api/services');
const { Register } = await import('./Register');

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
}

async function formuDoldur(şifre: string, tekrar: string) {
  await userEvent.type(screen.getByLabelText(t.register.name), 'Emine İzmir');
  await userEvent.type(screen.getByLabelText(t.register.email), 'emine@example.com');
  await userEvent.type(screen.getByLabelText(t.register.password), şifre);
  await userEvent.type(screen.getByLabelText(t.register.passwordConfirm), tekrar);
  await userEvent.type(screen.getByLabelText(t.register.phone), '05551234567');
}

describe('Register — hesap türü', () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(authApi.register).mockReset();
  });

  it('hesap türü formun ilk alanıdır', () => {
    renderRegister();
    const etiketler = screen.getAllByText(
      (_, el) => el?.tagName === 'LABEL' && el.textContent !== null,
    );
    expect(etiketler[0]).toHaveTextContent(t.register.accountType);
  });

  it('varsayılan olarak müşteri seçilidir ve ad alanı "Ad Soyad" olur', () => {
    renderRegister();
    expect(screen.getByLabelText(t.register.name)).toBeInTheDocument();
    expect(screen.queryByLabelText(t.register.companyName)).not.toBeInTheDocument();
  });

  it('satıcı seçilince ad alanı firma adına döner', async () => {
    renderRegister();

    await userEvent.selectOptions(screen.getByLabelText(t.register.accountType), 'seller');

    expect(screen.getByLabelText(t.register.companyName)).toBeInTheDocument();
    expect(screen.queryByLabelText(t.register.name)).not.toBeInTheDocument();
  });

  it('tür değiştiğinde girilen değer korunur', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(t.register.name), 'Urla Zeytinyağı');

    await userEvent.selectOptions(screen.getByLabelText(t.register.accountType), 'seller');

    expect(screen.getByLabelText(t.register.companyName)).toHaveValue('Urla Zeytinyağı');
  });
});

describe('Register — şifre tekrarı', () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(authApi.register).mockReset();
  });

  it('şifreler uyuşmazsa alanın altında uyarı çıkar', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText(t.register.password), 'parola12345');
    await userEvent.type(screen.getByLabelText(t.register.passwordConfirm), 'baskaparola');

    expect(screen.getByText(t.register.passwordMismatch)).toBeInTheDocument();
  });

  it('uyuşmazlık varken kayıt isteği gönderilmez', async () => {
    renderRegister();
    await formuDoldur('parola12345', 'baskaparola9');

    await userEvent.click(screen.getByRole('button', { name: t.register.submit }));

    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('uyuşmazlık giderilince uyarı kaybolur', async () => {
    renderRegister();
    const tekrar = screen.getByLabelText(t.register.passwordConfirm);

    await userEvent.type(screen.getByLabelText(t.register.password), 'parola12345');
    await userEvent.type(tekrar, 'baskaparola');
    expect(screen.getByText(t.register.passwordMismatch)).toBeInTheDocument();

    await userEvent.clear(tekrar);
    await userEvent.type(tekrar, 'parola12345');

    expect(screen.queryByText(t.register.passwordMismatch)).not.toBeInTheDocument();
  });

  it('şifreler eşleşince kayıt isteği telefonla birlikte gönderilir', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      token: 'a.b.c',
      user: { id: 'u1', name: 'Emine', email: 'e@x.com', role: 'customer', phone: '05551234567', addresses: [], createdAt: '' },
    });
    renderRegister();
    await formuDoldur('parola12345', 'parola12345');

    await userEvent.click(screen.getByRole('button', { name: t.register.submit }));

    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'emine@example.com',
        password: 'parola12345',
        phone: '05551234567',
        role: 'customer',
      }),
    );
  });

  it('adres boş bırakılırsa istekte gönderilmez', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      token: 'a.b.c',
      user: { id: 'u1', name: 'Emine', email: 'e@x.com', role: 'customer', phone: '05551234567', addresses: [], createdAt: '' },
    });
    renderRegister();
    await formuDoldur('parola12345', 'parola12345');

    await userEvent.click(screen.getByRole('button', { name: t.register.submit }));

    const gönderilen = vi.mocked(authApi.register).mock.calls[0]?.[0];
    expect(gönderilen?.address).toBeUndefined();
  });
});

describe('Register — zorunlu alanlar', () => {
  it('ad, e-posta, şifre, şifre tekrarı ve telefon zorunludur; adres değildir', () => {
    renderRegister();

    expect(screen.getByLabelText(t.register.name)).toBeRequired();
    expect(screen.getByLabelText(t.register.email)).toBeRequired();
    expect(screen.getByLabelText(t.register.password)).toBeRequired();
    expect(screen.getByLabelText(t.register.passwordConfirm)).toBeRequired();
    expect(screen.getByLabelText(t.register.phone)).toBeRequired();
    expect(screen.getByLabelText(t.register.address)).not.toBeRequired();
  });
});

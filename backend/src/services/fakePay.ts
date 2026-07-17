import { msg } from '../i18n';
import { randomUUID } from 'crypto';

export interface CardInput {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

const ALWAYS_SUCCEEDS = '4242424242424242';
const ALWAYS_FAILS = '4000000000000000';

function luhnValid(num: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryValid(expiry: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(m[2]);
  const now = new Date();
  return new Date(year, month, 0, 23, 59, 59) >= now;
}

export async function processPayment(card: CardInput): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const number = card.cardNumber.replace(/\s/g, '');

  if (number === ALWAYS_FAILS) {
    return { success: false, transactionId: randomUUID(), message: msg.cardDeclined };
  }
  if (number === ALWAYS_SUCCEEDS) {
    return { success: true, transactionId: randomUUID(), message: msg.paymentSuccess };
  }
  if (!/^\d{13,19}$/.test(number) || !luhnValid(number)) {
    return { success: false, transactionId: randomUUID(), message: msg.invalidCardNumber };
  }
  if (!expiryValid(card.expiry)) {
    return { success: false, transactionId: randomUUID(), message: msg.cardExpired };
  }
  return { success: true, transactionId: randomUUID(), message: msg.paymentSuccess };
}

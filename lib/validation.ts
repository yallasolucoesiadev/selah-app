const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

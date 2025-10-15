const PHONE_MAX_LENGTH = 11;

export const stripPhoneDigits = (value: string) =>
  value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);

export const formatPhoneNumber = (value: string) => {
  const digits = stripPhoneDigits(value);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const BLACKLIST = new Set([
  "00000000000",
  "11111111111",
  "22222222222",
  "33333333333",
  "44444444444",
  "55555555555",
  "66666666666",
  "77777777777",
  "88888888888",
  "99999999999",
]);

export const stripCPF = (value: string) => value.replace(/\D/g, "");

export const formatCPF = (value: string) => {
  const digits = stripCPF(value);
  if (digits.length !== 11) return digits;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9)}`;
};

export const isValidCPF = (raw: string) => {
  const cpf = stripCPF(raw);
  if (!cpf || cpf.length !== 11) return false;
  if (BLACKLIST.has(cpf)) return false;

  const calcCheckDigit = (slice: number) => {
    const sum = cpf
      .slice(0, slice)
      .split("")
      .map((digit) => Number.parseInt(digit, 10))
      .reduce((acc, digit, index) => acc + digit * (slice + 1 - index), 0);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const digit1 = calcCheckDigit(9);
  const digit2 = calcCheckDigit(10);

  return (
    digit1 === Number.parseInt(cpf[9], 10) &&
    digit2 === Number.parseInt(cpf[10], 10)
  );
};

export const normalizeCPF = (raw: string) => stripCPF(raw);

export const assertValidCPF = (raw: string) => {
  if (!isValidCPF(raw)) {
    throw new Error("CPF inválido");
  }

  return normalizeCPF(raw);
};

import { assertValidCPF, formatCPF, isValidCPF, normalizeCPF } from "@/lib/cpf";

describe("CPF utilities", () => {
  const valid = "935.411.347-80";
  const normalized = "93541134780";

  it("validates known CPF", () => {
    expect(isValidCPF(valid)).toBe(true);
    expect(isValidCPF(normalized)).toBe(true);
  });

  it("rejects sequential numbers", () => {
    expect(isValidCPF("111.111.111-11")).toBe(false);
  });

  it("formats CPF with separators", () => {
    expect(formatCPF(normalized)).toBe("935.411.347-80");
  });

  it("normalizes CPF by stripping non digits", () => {
    expect(normalizeCPF(valid)).toBe(normalized);
  });

  it("throws on invalid CPF when asserting", () => {
    expect(() => assertValidCPF("123.456.789-00")).toThrow("CPF inválido");
  });
});

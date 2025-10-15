export const normalizeHumanName = (value: string) =>
  value.replace(/\s+/g, " ").trim();

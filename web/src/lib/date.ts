export const toDateInputValue = (value: string | null) =>
  value ? value.slice(0, 10) : "";

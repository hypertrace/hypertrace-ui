export const sortUnknown = (a: unknown, b: unknown) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
};

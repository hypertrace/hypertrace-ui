export const displayString = (provided?: unknown, defaultValueOnEmpty: string = '-'): string => {
  if (provided === null || provided === 'null') {
    return defaultValueOnEmpty;
  }

  switch (typeof provided) {
    case 'object':
      return Array.isArray(provided)
        ? `[${provided.map(value => displayString(value, defaultValueOnEmpty)).join(', ')}]`
        : 'Object';
    case 'undefined':
      return defaultValueOnEmpty;
    case 'function':
      return 'Function';
    case 'string':
      return provided;
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
    default:
      return String(provided);
  }
};

export const collapseWhitespace = (str: string): string =>
  // Replace all whitespace with a single space
  str.replace(/\s\s+/g, ' ');

export const getStringsFromCommaSeparatedList = (text: string): string[] =>
  text
    .split(',')
    .map(part => part.trim())
    .filter(part => part !== '');

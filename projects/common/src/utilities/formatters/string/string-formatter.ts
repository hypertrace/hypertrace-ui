const titleCaseFromString = (text: string, splitter: string): string =>
  text
    .split(splitter)
    .map(str => (str.length === 0 ? str : str[0].toUpperCase() + str.slice(1)))
    .join(' ');

export const titleCaseFromKebabCase = (kebabCaseString: string): string => titleCaseFromString(kebabCaseString, '-');

export const titleCaseFromWhiteSpacedString = (whiteSpacedString: string): string =>
  titleCaseFromString(whiteSpacedString, ' ');

export const titleCaseFromSnakeCase = (snakeCaseString: string): string => titleCaseFromString(snakeCaseString, '_');

export const displayString = (provided?: unknown): string => {
  if (provided === null) {
    return '-';
  }

  switch (typeof provided) {
    case 'object':
      return Array.isArray(provided) ? `[${provided.map(displayString).join(', ')}]` : 'Object';
    case 'undefined':
      return '-';
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

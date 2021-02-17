import { isEmpty } from 'lodash-es';

export const titleCaseFromKebabCase = (kebabCaseString: string): string =>
  kebabCaseString
    .split('-')
    .map(str => (str.length === 0 ? str : str[0].toUpperCase() + str.slice(1)))
    .join(' ');

export const titleCaseFromSnakeCase = (snakeCaseString: string): string =>
  snakeCaseString
    .split('_')
    .map(str => (str.length === 0 ? str : str[0].toUpperCase() + str.slice(1)))
    .join(' ');

export const displayString = (provided?: unknown): string => {
  if (provided === null) {
    return '-';
  }

  switch (typeof provided) {
    case 'object':
      return Array.isArray(provided)
        ? `[${provided.map(displayString).join(', ')}]`
        : provided === null
        ? 'Unknown'
        : 'Object';
    case 'undefined':
      return 'Unknown';
    case 'function':
      return 'Function';
    case 'string':
      return isEmpty(provided) ? 'Unknown' : provided;
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

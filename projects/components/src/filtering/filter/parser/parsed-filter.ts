import { KeysWithType } from '@hypertrace/common';
import { FilterAttribute } from '../filter-attribute';
import { FilterAttributeType } from '../filter-attribute-type';
import { MAP_LHS_DELIMITER } from '../filter-delimiters';
import { FilterOperator } from '../filter-operators';

export interface ParsedFilter<TValue> {
  field: string;
  subpath?: string;
  operator: FilterOperator;
  value: TValue;
}

export interface FilterAttributeExpression {
  attribute: FilterAttribute;
  subpath?: string;
}

export interface SplitFilter<TOperator extends string> extends FilterAttributeExpression {
  operator: TOperator;
  rhs: string;
}

export const splitFilterStringByOperator = <TOperator extends string>(
  attribute: FilterAttribute,
  possibleOperators: TOperator[],
  filterString: string
): SplitFilter<TOperator> | undefined => {
  const matchingOperator = possibleOperators
    .sort((a, b) => b.length - a.length) // Prefer longer matches
    .find(op => filterString.includes(op));

  if (!matchingOperator) {
    return undefined;
  }
  if (
    filterString.endsWith(matchingOperator) &&
    possibleOperators.filter(operator => operator.startsWith(matchingOperator)).length > 1
  ) {
    // If our string ends with the start of multiple operators (e.g. "attr <"), it could continue to a different operator so abort to avoid ambiguity
    return undefined;
  }
  const [lhs, rhs] = filterString.split(matchingOperator).map(str => str.trim());
  const attributeExpression = tryParseStringForAttribute(attribute, lhs, ['displayName', 'name']);

  return attributeExpression && { ...attributeExpression, operator: matchingOperator, rhs: rhs };
};

export const tryParseStringForAttribute = (
  attributeToTest: FilterAttribute,
  text: string,
  nameFields: KeysWithType<FilterAttribute, string>[] = ['displayName']
): FilterAttributeExpression | undefined => {
  const [stringContainingFullAttribute] = text.trim().split(MAP_LHS_DELIMITER, 1);
  // The string to the left of any delimeter must start with the attribute otherwise no match
  const matchingNameField = nameFields.find(nameField =>
    stringContainingFullAttribute.toLowerCase().startsWith(attributeToTest[nameField].toLowerCase())
  );
  if (!matchingNameField) {
    return undefined;
  }
  // Now, we know that it does match. Remove the attribute name from the beginning and try to determine the subpath next.
  const stringAfterAttributeName = text.slice(attributeToTest[matchingNameField].length).trim();

  // If the string continues with more alphanumeric characters directly after this attribute name, it's no longer a match
  if (stringAfterAttributeName.match(/^\w/)) {
    return undefined;
  }

  if (stringAfterAttributeName.startsWith(MAP_LHS_DELIMITER)) {
    if (attributeToTest.type !== FilterAttributeType.StringMap) {
      // Can't have a subpath if not a map
      return undefined;
    }
    const potentialSubpath = stringAfterAttributeName.slice(MAP_LHS_DELIMITER.length);
    // Subpaths support alphanumeric, -, - and . characters
    const firstNonSubpathCharacterIndex = potentialSubpath.search(/[^\w\-\.]/);
    const subpath =
      firstNonSubpathCharacterIndex === -1
        ? potentialSubpath
        : potentialSubpath.slice(0, firstNonSubpathCharacterIndex);

    return { attribute: attributeToTest, subpath: subpath };
  }

  return { attribute: attributeToTest };
};

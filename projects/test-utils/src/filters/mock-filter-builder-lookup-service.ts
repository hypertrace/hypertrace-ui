import { assertUnreachable } from '@hypertrace/common';
import {
  BooleanFilterBuilder,
  FilterAttributeType,
  NumberFilterBuilder,
  StringFilterBuilder,
  StringMapFilterBuilder
} from '@hypertrace/components';

export const mockFilterBuilderLookup = (type: FilterAttributeType) => {
  switch (type) {
    case FilterAttributeType.Boolean:
      return new BooleanFilterBuilder();
    case FilterAttributeType.Number:
      return new NumberFilterBuilder();
    case FilterAttributeType.String:
      return new StringFilterBuilder();
    case FilterAttributeType.StringMap:
      return new StringMapFilterBuilder();
    case FilterAttributeType.StringArray:
    case FilterAttributeType.Timestamp:
      return undefined;
    default:
      assertUnreachable(type);
  }
};

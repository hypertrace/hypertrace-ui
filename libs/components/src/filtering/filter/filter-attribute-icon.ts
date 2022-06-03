import { IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { FilterAttributeType } from './filter-attribute-type';

export const getFilterAttributeIcon = (attributeType: FilterAttributeType) => {
  switch (attributeType) {
    case FilterAttributeType.Boolean:
      return IconType.BooleanAttribute;
    case FilterAttributeType.Number:
      return IconType.NumericAttribute;
    case FilterAttributeType.String:
      return IconType.StringAttribute;
    case FilterAttributeType.StringArray:
      return IconType.ArrayAttribute;
    case FilterAttributeType.StringMap:
      return IconType.ObjectAttribute;
    case FilterAttributeType.Timestamp:
      return IconType.DateAttribute;
    default:
      return assertUnreachable(attributeType);
  }
};

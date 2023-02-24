// tslint:disable: no-null-undefined-union

import { JsonValue } from '@hypertrace/common';

export interface JsonRecord {
  keyDisplay: string;
  valueDisplay: string;
  value: JsonValue;
  valueType: JsonElementType;
  isExpandable: boolean;
  expanded?: boolean;
}

export const enum JsonElementType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Array = 'array',
  Null = 'null'
}

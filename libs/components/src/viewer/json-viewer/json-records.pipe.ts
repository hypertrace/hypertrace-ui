import { Pipe, PipeTransform } from '@angular/core';
import { Json, JsonValue } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { JsonElementType, JsonRecord } from './json-viewer.type';

@Pipe({
  name: 'htJsonRecords'
})
export class JsonRecordsPipe implements PipeTransform {
  public transform(inputObject: Json | undefined, showExpanded: boolean = true): JsonRecord[] {
    return this.getJsonRecords(inputObject, showExpanded);
  }

  private getJsonRecords(json: Json | undefined, showExpanded: boolean): JsonRecord[] {
    if (isNil(json)) {
      return [];
    }

    const isJsonArray = Array.isArray(json);

    return this.getKeysInOrder(json, isJsonArray).map(key => {
      const jsonValue: JsonValue = json[key];
      const valueType = this.getJsonValueType(jsonValue);

      return {
        keyDisplay: isJsonArray ? `Item ${key}` : key,
        valueDisplay: this.getDisplayValue(jsonValue, valueType),
        value: jsonValue,
        valueType: valueType,
        isExpandable: valueType === JsonElementType.Object || valueType === JsonElementType.Array,
        expanded: showExpanded
      };
    });
  }

  private getJsonValueType(value: JsonValue): JsonElementType {
    const type = typeof value;

    switch (type) {
      case 'string':
        return JsonElementType.String;
      case 'number':
        return JsonElementType.Number;

      case 'boolean':
        return JsonElementType.Boolean;

      case 'object':
      default:
        if (Array.isArray(value)) {
          return JsonElementType.Array;
        }

        if (value === null) {
          return JsonElementType.Null;
        }

        return JsonElementType.Object;
    }
  }

  private getDisplayValue(value: JsonValue, valueType: JsonElementType): string {
    switch (valueType) {
      case JsonElementType.Array:
        const totalJsonItems = (value as JsonValue[]).length;

        return `[ ${totalJsonItems.toString()} Item${totalJsonItems === 1 ? '' : 's'} ]`;

      case JsonElementType.Object:
        const totalKeys = Object.keys(value as object).length;

        return `{ ${totalKeys} Key${totalKeys === 1 ? '' : 's'} }`;

      case JsonElementType.String:
        return `"${String(value)}"`;

      default:
        return String(value);
    }
  }

  private getKeysInOrder(json: Json, isJsonArray: boolean): string[] {
    const keys = Object.keys(json);

    if (isJsonArray) {
      return keys
        .map(key => +key)
        .sort((key1, key2) => key1 - key2)
        .map(key => key.toString());
    }

    return keys.sort((key1, key2) => key1.localeCompare(key2));
  }
}

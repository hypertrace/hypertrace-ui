import { ModelJson, ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { isNil } from 'lodash-es';

export const RANGE_MODEL_TYPE: ModelPropertyTypeRegistrationInformation = {
  type: 'range-model',
  validator: rangeModelJsonValidation
};

// tslint:disable-next-line: only-arrow-functions required exported function for AOT
export function rangeModelJsonValidation(value: unknown, allowUndefinedOrNull: boolean): string | undefined {
  if (allowUndefinedOrNull && isNil(value)) {
    return undefined;
  }

  if (value !== null && typeof value === 'object' && (value as ModelJson).type === 'range') {
    return undefined;
  }

  return 'Must be range';
}

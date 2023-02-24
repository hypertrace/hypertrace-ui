import { ModelJson, ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { isNil } from 'lodash-es';

export const BAND_ARRAY_TYPE: ModelPropertyTypeRegistrationInformation = {
  type: 'band-array',
  validator: seriesArrayJsonValidation
};

// tslint:disable-next-line: only-arrow-functions required exported function for AOT
export function seriesArrayJsonValidation(value: unknown, allowUndefinedOrNull: boolean): string | undefined {
  if (allowUndefinedOrNull && isNil(value)) {
    return undefined;
  }

  const isBandModel = (unknownValue: unknown) =>
    unknownValue !== null && typeof unknownValue === 'object' && (unknownValue as ModelJson).type === 'band';

  if (Array.isArray(value) && value.every(isBandModel)) {
    return undefined;
  }

  return 'Must be array containing a band model for each value';
}

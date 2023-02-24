import { ModelJson, ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { isNil } from 'lodash-es';

export const SERIES_ARRAY_TYPE: ModelPropertyTypeRegistrationInformation = {
  type: 'series-array',
  validator: seriesArrayJsonValidation
};

// tslint:disable-next-line: only-arrow-functions required exported function for AOT
export function seriesArrayJsonValidation(value: unknown, allowUndefinedOrNull: boolean): string | undefined {
  if (allowUndefinedOrNull && isNil(value)) {
    return undefined;
  }

  const isSeriesModel = (unknownValue: unknown) =>
    unknownValue !== null && typeof unknownValue === 'object' && (unknownValue as ModelJson).type === 'series';

  if (Array.isArray(value) && value.every(isSeriesModel)) {
    return undefined;
  }

  return 'Must be array containing a series model for each value';
}

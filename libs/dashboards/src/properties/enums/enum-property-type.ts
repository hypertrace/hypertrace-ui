import { ModelPropertyTypeInstance, ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { isNil } from 'lodash-es';

export const ENUM_TYPE: ModelPropertyTypeRegistrationInformation = {
  type: 'enum',
  validator: enumValidator
};

// tslint:disable-next-line: only-arrow-functions required exported function for AOT
export function enumValidator(
  value: unknown,
  allowUndefinedOrNull: boolean,
  instance: ModelPropertyTypeInstance
): string | undefined {
  if (!propertyInstanceIsEnum(instance)) {
    return 'Property must be registered with EnumPropertyTypeInstance';
  }
  if (allowUndefinedOrNull && isNil(value)) {
    return undefined;
  }
  if (typeof value === 'string' && instance.values.includes(value)) {
    return undefined;
  }

  return `Provided value: ${String(value)} must be one of ${instance.values.join(', ')}`;
}

const propertyInstanceIsEnum = (
  propertyType: ModelPropertyTypeInstance | EnumPropertyTypeInstance
): propertyType is EnumPropertyTypeInstance =>
  propertyType.key === 'enum' && 'values' in propertyType && Array.isArray(propertyType.values);

export interface EnumPropertyTypeInstance extends ModelPropertyTypeInstance {
  key: 'enum';
  values: string[]; // TODO support other syntaxes
}

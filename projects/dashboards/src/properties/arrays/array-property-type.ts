import { ModelPropertyTypeInstance } from '@hypertrace/hyperdash';

// Array property definition part of core

export interface ArrayPropertyTypeInstance extends ModelPropertyTypeInstance {
  key: 'array';
  subtype: ModelPropertyTypeInstance | string;
}

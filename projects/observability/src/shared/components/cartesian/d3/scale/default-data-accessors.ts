import { DateCoercer, NoopCoercer, NumberCoercer } from '@hypertrace/common';
import { ScaleType } from '../../chart';

const dateCoercer = new DateCoercer();
const numberCoercer = new NumberCoercer();
const yCoercer = new NoopCoercer<unknown>({
  useSelf: false,
  extractObjectKeys: ['y', 'value'],
  extractArrayIndices: [1]
});
const xCoercer = new NoopCoercer<unknown>({
  useSelf: false,
  extractObjectKeys: ['x', 'timestamp'],
  extractArrayIndices: [0]
});

export const defaultYDataAccessor = <TDomain>(data: unknown): TDomain => {
  const coerced = yCoercer.coerce(data);
  // if (coerced === undefined) {
  //   throw Error('Data is unknown shape');
  // }

  return coerced as TDomain;
};

export const defaultXDataAccessor = <TDomain>(data: unknown): TDomain => {
  const coerced = xCoercer.coerce(data);
  if (coerced === undefined) {
    throw Error('Data is unknown shape');
  }

  return coerced as TDomain;
};

export const getDefaultScaleType = (minValue: unknown): ScaleType => {
  if (dateCoercer.canCoerce(minValue)) {
    return ScaleType.Time;
  }
  if (numberCoercer.canCoerce(minValue)) {
    return ScaleType.Linear;
  }

  return ScaleType.Band;
};

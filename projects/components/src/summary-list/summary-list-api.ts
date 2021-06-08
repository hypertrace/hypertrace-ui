import { PrimitiveValue } from '@hypertrace/common';

export interface SummaryItem {
  label: string;
  value: PrimitiveValue | PrimitiveValue[];
  clickable?: boolean;
}

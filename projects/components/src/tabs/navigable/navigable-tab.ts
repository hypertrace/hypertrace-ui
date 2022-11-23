import { ApplicationFeatureValues } from '@hypertrace/common';

export interface NavigableTab {
  path: string;
  label: string;
  labelTag?: string;
  hidden?: boolean;
  features?: string[];
  replaceHistory?: boolean;
  flagName?: ApplicationFeatureValues;
}

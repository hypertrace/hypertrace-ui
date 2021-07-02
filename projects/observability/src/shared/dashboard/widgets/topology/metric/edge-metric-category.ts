import { Color } from '@hypertrace/common';
import { isEmpty } from 'lodash-es';

export interface EdgeMetricCategory {
  value: EdgeMetricCategoryValueType;
  categoryClass?: string; // Can be used as selector class
  color: string; // Color for edge, arrow and bubble
}

export type EdgeMetricCategoryValueType = PrimaryEdgeMetricCategoryValueType | SecondaryEdgeMetricCategoryValueType;

export enum PrimaryEdgeMetricCategoryValueType {
  LessThan20 = 'less-than-20',
  From20To100 = 'from-20-to-100',
  From100To500 = 'from-100-to-500',
  From500To1000 = 'from-500-to-1000',
  GreaterThanOrEqualTo1000 = 'greater-than-or-equal-to-1000',
  NotSpecified = 'not-specified'
}

export enum SecondaryEdgeMetricCategoryValueType {
  LessThan5 = 'less-than-5',
  GreaterThanOrEqualTo5 = 'greater-than-or-equal-to-5',
  NotSpecified = 'not-specified'
}

export const defaultPrimaryEdgeMetricCategories: EdgeMetricCategory[] = [
  {
    value: PrimaryEdgeMetricCategoryValueType.LessThan20,
    color: Color.BlueGray1,
    categoryClass: 'less-than-20-primary-category'
  },
  {
    value: PrimaryEdgeMetricCategoryValueType.From20To100,
    color: Color.BlueGray2,
    categoryClass: 'from-20-to-100-primary-category'
  },
  {
    value: PrimaryEdgeMetricCategoryValueType.From100To500,
    color: Color.BlueGray3,
    categoryClass: 'from-100-to-500-primary-category'
  },
  {
    value: PrimaryEdgeMetricCategoryValueType.From500To1000,
    color: Color.BlueGray4,
    categoryClass: 'from-500-to-1000-primary-category'
  },
  {
    value: PrimaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo1000,
    color: Color.BlueGray5,
    categoryClass: 'greater-than-or-equal-to-1000-primary-category'
  },
  {
    value: PrimaryEdgeMetricCategoryValueType.NotSpecified,
    color: 'lightgray',
    categoryClass: 'not-specified-primary-category'
  }
];

export const defaultSecondaryEdgeMetricCategories: EdgeMetricCategory[] = [
  {
    value: SecondaryEdgeMetricCategoryValueType.LessThan5,
    color: Color.Gray2,
    categoryClass: 'less-than-5-secondary-category'
  },
  {
    value: SecondaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo5,
    color: Color.Red5,
    categoryClass: 'greater-than-or-equal-to-5-secondary-category'
  },
  {
    value: SecondaryEdgeMetricCategoryValueType.NotSpecified,
    color: Color.Gray2,
    categoryClass: 'not-specified-secondary-category'
  }
];

export const getPrimaryEdgeMetricCategory = (
  value?: number,
  categories?: EdgeMetricCategory[]
): EdgeMetricCategory | undefined => {
  const primaryCategories = !isEmpty(categories) ? categories : defaultPrimaryEdgeMetricCategories;
  if (value === undefined) {
    return primaryCategories?.find(category => category.value === PrimaryEdgeMetricCategoryValueType.NotSpecified);
  }

  if (value < 20) {
    return primaryCategories?.find(category => category.value === PrimaryEdgeMetricCategoryValueType.LessThan20);
  }

  if (value >= 20 && value < 100) {
    return primaryCategories?.find(category => category.value === PrimaryEdgeMetricCategoryValueType.From20To100);
  }

  if (value >= 100 && value < 500) {
    return primaryCategories?.find(category => category.value === PrimaryEdgeMetricCategoryValueType.From100To500);
  }

  if (value >= 500 && value < 1000) {
    return primaryCategories?.find(category => category.value === PrimaryEdgeMetricCategoryValueType.From500To1000);
  }

  return primaryCategories?.find(
    category => category.value === PrimaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo1000
  );
};

export const getSecondaryEdgeMetricCategory = (value?: number, categories?: EdgeMetricCategory[]) => {
  const secondaryCategories = !isEmpty(categories) ? categories : defaultSecondaryEdgeMetricCategories;
  if (value === undefined) {
    return secondaryCategories?.find(category => category.value === SecondaryEdgeMetricCategoryValueType.NotSpecified);
  }

  if (value < 5) {
    return secondaryCategories?.find(category => category.value === SecondaryEdgeMetricCategoryValueType.LessThan5);
  }

  return secondaryCategories?.find(
    category => category.value === SecondaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo5
  );
};

export const getAllCategories = (
  primaryCategories?: EdgeMetricCategory[],
  secondaryCategories?: EdgeMetricCategory[]
): EdgeMetricCategory[] => [
  ...(!isEmpty(primaryCategories) ? primaryCategories! : defaultPrimaryEdgeMetricCategories),
  ...(!isEmpty(secondaryCategories) ? secondaryCategories! : defaultSecondaryEdgeMetricCategories)
];

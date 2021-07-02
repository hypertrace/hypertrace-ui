import { Color } from '@hypertrace/common';
import { resolveMetricCategories } from './metric-category';

export interface NodeMetricCategory {
  value: NodeMetricCategoryValueType;
  categoryClass?: string; // Can be used as selector class
  color: string; // Used for fill in node
  focusedColor?: string; // Used for fill color when focus/emphasized in case of secondary node metrics
  secondaryColor?: string; // Used for stroke in case of secondary node metrics
}

export type NodeMetricCategoryValueType = PrimaryNodeMetricCategoryValueType | SecondaryNodeMetricCategoryValueType;

export enum PrimaryNodeMetricCategoryValueType {
  LessThan20 = 'less-than-20',
  From20To100 = 'from-20-to-100',
  From100To500 = 'from-100-to-500',
  From500To1000 = 'from-500-to-1000',
  GreaterThanOrEqualTo1000 = 'greater-than-or-equal-to-1000',
  NotSpecified = 'not-specified'
}

export enum SecondaryNodeMetricCategoryValueType {
  LessThan5 = 'less-than-5',
  GreaterThanOrEqualTo5 = 'greater-than-or-equal-to-5',
  NotSpecified = 'not-specified'
}

export const defaultPrimaryNodeMetricCategories: NodeMetricCategory[] = [
  {
    value: PrimaryNodeMetricCategoryValueType.LessThan20,
    color: Color.BlueGray1,
    categoryClass: 'less-than-20-primary-category'
  },
  {
    value: PrimaryNodeMetricCategoryValueType.From20To100,
    color: Color.BlueGray2,
    categoryClass: 'from-20-to-100-primary-category'
  },
  {
    value: PrimaryNodeMetricCategoryValueType.From100To500,
    color: Color.BlueGray3,
    categoryClass: 'from-100-to-500-primary-category'
  },
  {
    value: PrimaryNodeMetricCategoryValueType.From500To1000,
    color: Color.BlueGray4,
    categoryClass: 'from-500-to-1000-primary-category'
  },
  {
    value: PrimaryNodeMetricCategoryValueType.GreaterThanOrEqualTo1000,
    color: Color.BlueGray5,
    categoryClass: 'greater-than-or-equal-to-1000-primary-category'
  },
  {
    value: PrimaryNodeMetricCategoryValueType.NotSpecified,
    color: 'lightgray',
    categoryClass: 'not-specified-primary-category'
  }
];

export const defaultSecondaryNodeMetricCategories: NodeMetricCategory[] = [
  {
    value: SecondaryNodeMetricCategoryValueType.LessThan5,
    color: Color.Gray2,
    categoryClass: 'less-than-5-secondary-category'
  },
  {
    value: SecondaryNodeMetricCategoryValueType.GreaterThanOrEqualTo5,
    color: Color.Red1,
    secondaryColor: Color.Red5,
    focusedColor: Color.Red1,
    categoryClass: 'greater-than-or-equal-to-5-secondary-category'
  },
  {
    value: SecondaryNodeMetricCategoryValueType.NotSpecified,
    color: Color.Gray2,
    categoryClass: 'not-specified-secondary-category'
  }
];

export const getPrimaryNodeMetricCategory = (
  value?: number,
  categories?: NodeMetricCategory[]
): NodeMetricCategory | undefined => {
  const primaryCategories = resolveMetricCategories(
    defaultPrimaryNodeMetricCategories,
    categories
  ) as NodeMetricCategory[];
  if (value === undefined) {
    return primaryCategories.find(category => category.value === PrimaryNodeMetricCategoryValueType.NotSpecified);
  }

  if (value < 20) {
    return primaryCategories.find(category => category.value === PrimaryNodeMetricCategoryValueType.LessThan20);
  }

  if (value >= 20 && value < 100) {
    return primaryCategories.find(category => category.value === PrimaryNodeMetricCategoryValueType.From20To100);
  }

  if (value >= 100 && value < 500) {
    return primaryCategories.find(category => category.value === PrimaryNodeMetricCategoryValueType.From100To500);
  }

  if (value >= 500 && value < 1000) {
    return primaryCategories.find(category => category.value === PrimaryNodeMetricCategoryValueType.From500To1000);
  }

  return primaryCategories.find(
    category => category.value === PrimaryNodeMetricCategoryValueType.GreaterThanOrEqualTo1000
  );
};

export const getSecondaryNodeMetricCategory = (value?: number, categories?: NodeMetricCategory[]) => {
  const secondaryCategories = resolveMetricCategories(
    defaultSecondaryNodeMetricCategories,
    categories
  ) as NodeMetricCategory[];
  if (value === undefined) {
    return secondaryCategories.find(category => category.value === SecondaryNodeMetricCategoryValueType.NotSpecified);
  }

  if (value < 5) {
    return secondaryCategories.find(category => category.value === SecondaryNodeMetricCategoryValueType.LessThan5);
  }

  return secondaryCategories.find(
    category => category.value === SecondaryNodeMetricCategoryValueType.GreaterThanOrEqualTo5
  );
};

import { Color } from '@hypertrace/common';
import { TopologyMetricCategoryData } from '../../../data/graphql/topology/metrics/topology-metric-category.model';

const enum PrimaryEdgeMetricCategoryValueType {
  LessThan20 = 'less-than-20',
  From20To100 = 'from-20-to-100',
  From100To500 = 'from-100-to-500',
  From500To1000 = 'from-500-to-1000',
  GreaterThanOrEqualTo1000 = 'greater-than-or-equal-to-1000',
  NotSpecified = 'not-specified'
}

const enum SecondaryEdgeMetricCategoryValueType {
  LessThan5 = 'less-than-5',
  GreaterThanOrEqualTo5 = 'greater-than-or-equal-to-5',
  NotSpecified = 'not-specified'
}

export const defaultPrimaryEdgeMetricCategories: Omit<TopologyMetricCategoryData, 'getCategoryClassName'>[] = [
  {
    name: PrimaryEdgeMetricCategoryValueType.LessThan20,
    minValue: 0,
    maxValue: 20,
    fillColor: Color.BlueGray1,
    strokeColor: Color.BlueGray1,
    focusColor: Color.BlueGray1
  },
  {
    name: PrimaryEdgeMetricCategoryValueType.From20To100,
    minValue: 20,
    maxValue: 100,
    fillColor: Color.BlueGray2,
    strokeColor: Color.BlueGray2,
    focusColor: Color.BlueGray2
  },
  {
    name: PrimaryEdgeMetricCategoryValueType.From100To500,
    minValue: 100,
    maxValue: 500,
    fillColor: Color.BlueGray3,
    strokeColor: Color.BlueGray3,
    focusColor: Color.BlueGray3
  },
  {
    name: PrimaryEdgeMetricCategoryValueType.From500To1000,
    minValue: 500,
    maxValue: 1000,
    fillColor: Color.BlueGray4,
    strokeColor: Color.BlueGray4,
    focusColor: Color.BlueGray4
  },
  {
    name: PrimaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo1000,
    minValue: 1000,
    maxValue: undefined,
    fillColor: Color.BlueGray4,
    strokeColor: Color.BlueGray4,
    focusColor: Color.BlueGray4
  }
];

export const defaultSecondaryEdgeMetricCategories: Omit<TopologyMetricCategoryData, 'getCategoryClassName'>[] = [
  {
    name: SecondaryEdgeMetricCategoryValueType.LessThan5,
    minValue: 0,
    maxValue: 5,
    fillColor: Color.Gray2,
    strokeColor: Color.Gray2,
    focusColor: Color.Gray2
  },
  {
    name: SecondaryEdgeMetricCategoryValueType.GreaterThanOrEqualTo5,
    minValue: 5,
    maxValue: undefined,
    fillColor: Color.Red5,
    strokeColor: Color.Red5,
    focusColor: Color.Red5,
    highestPrecedence: true
  }
];

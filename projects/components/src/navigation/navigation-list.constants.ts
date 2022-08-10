import { IconType } from '@hypertrace/assets-library';
import { ApplicationFeature } from '@hypertrace/common';
import { NavItemConfig, NavItemType } from './navigation.config';

export const featureBasedNavItemDefinitions: Record<string, NavItemConfig> = {
  [ApplicationFeature.SavedQueries]: {
    type: NavItemType.Link,
    label: 'Saved Queries',
    icon: IconType.Save,
    matchPaths: ['saved-queries']
  },
  [ApplicationFeature.CustomDashboards]: {
    type: NavItemType.Link,
    label: 'Custom Dashboards',
    icon: IconType.Dashboard,
    matchPaths: ['custom-dashboards']
  }
};

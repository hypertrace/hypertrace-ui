import { InjectionToken } from '@angular/core';

export const GLOBAL_HEADER_HEIGHT = new InjectionToken<string>('Global Header Height');

export enum ApplicationFeature {
  PageTimeRange = 'ui.page-time-range',
  NavigationRedesign = 'ui.navigation-version-2'
}

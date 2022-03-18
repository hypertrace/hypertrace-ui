import { InjectionToken } from '@angular/core';

export const GLOBAL_HEADER_HEIGHT = new InjectionToken<string>('Global Header Height');

export const enum ApplicationFeature {
  PageTimeRange = 'ui.page-time-range'
}

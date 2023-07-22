import { InjectionToken } from '@angular/core';
import { Route } from '@angular/router';
import { HtRouteData } from './ht-route-data';

export interface HtRoute extends Route {
  data?: HtRouteData;
  children?: HtRoute[];
}

export const APP_TITLE = new InjectionToken<string>('APP_TITLE');

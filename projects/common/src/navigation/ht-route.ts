import { Route } from '@angular/router';
import { HtRouteData } from './ht-route-data';

export interface HtRoute extends Route {
  data?: HtRouteData;
  children?: HtRoute[];
}

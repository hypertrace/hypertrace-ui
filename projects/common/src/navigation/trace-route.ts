import { Route } from '@angular/router';
import { RouteData } from './route-data';

export interface TraceRoute extends Route {
  data?: RouteData;
  children?: TraceRoute[];
}

import { Observable } from 'rxjs';
import { TimeRange } from '../time/time-range';
import { Breadcrumb } from './breadcrumb';

export interface HtRouteData {
  breadcrumb?: Breadcrumb | Observable<Breadcrumb>;
  features?: string[];
  title?: string;
  defaultTimeRange?: TimeRange;
}

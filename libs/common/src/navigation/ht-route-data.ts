import { Observable } from 'rxjs';
import { Breadcrumb } from './breadcrumb';

export interface HtRouteData {
  breadcrumb?: Breadcrumb | Observable<Breadcrumb>;
  features?: string[];
  title?: string;
}

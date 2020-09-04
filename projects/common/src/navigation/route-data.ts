import { Observable } from 'rxjs';
import { Breadcrumb } from './breadcrumb';

export interface RouteData {
  breadcrumb?: Breadcrumb | Observable<Breadcrumb>;
  features?: string[];
}

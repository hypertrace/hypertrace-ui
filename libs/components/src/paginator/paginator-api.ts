import { Observable } from 'rxjs';
import { PageEvent } from './page.event';

export interface PaginationProvider {
  pageEvent$: Observable<PageEvent>;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

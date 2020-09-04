import { QueryList } from '@angular/core';
import { merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';

export const queryListAndChanges$ = <T>(queryList: QueryList<T>) =>
  merge(of(undefined), queryList.changes).pipe(mapTo(queryList));

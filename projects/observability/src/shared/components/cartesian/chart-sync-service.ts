import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChartSyncService {
  // tslint:disable-next-line
  public readonly locationChangeSubject: Subject<any> = new Subject();

  public mouseLocationChange(data: any) {
    this.locationChangeSubject.next(data);
  }
}

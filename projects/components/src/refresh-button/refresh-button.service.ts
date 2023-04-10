import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshButtonService {
  private readonly refreshSubject = new Subject<void>();
  public readonly refresh$ = this.refreshSubject.asObservable();

  public refresh(): void {
    this.refreshSubject.next();
  }
}

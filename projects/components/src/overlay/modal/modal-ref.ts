import { Observable, Observer, ReplaySubject } from 'rxjs';
import { PopoverRef } from '../../popover/popover-ref';

export class ModalRef<TResult> {
  public readonly closed$: Observable<TResult>;
  private readonly closedObserver: Observer<TResult>;

  public constructor(public readonly popoverRef: PopoverRef) {
    const closedSubject = new ReplaySubject<TResult>(1);
    this.closedObserver = closedSubject;
    this.closed$ = closedSubject.asObservable();
    this.popoverRef.closed$.subscribe({
      complete: () => this.closedObserver.complete(),
      error: err => this.closedObserver.error(err)
    });
  }

  public close(result?: TResult): void {
    if (result !== undefined) {
      this.closedObserver.next(result);
    }
    this.popoverRef.close();
  }
}

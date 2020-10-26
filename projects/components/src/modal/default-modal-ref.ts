import { Observable, Observer, ReplaySubject } from 'rxjs';
import { PopoverRef } from '../popover/popover-ref';
import { ModalRef } from './modal';

export class DefaultModalRef extends ModalRef<unknown> {
  public readonly closed$: Observable<unknown>;

  private readonly closedObserver: Observer<unknown>;
  private popoverRef?: PopoverRef;

  public constructor() {
    super();
    const closedSubject = new ReplaySubject<unknown>(1);
    this.closedObserver = closedSubject;
    this.closed$ = closedSubject.asObservable();
  }

  public initialize(popoverRef: PopoverRef): void {
    this.popoverRef = popoverRef;
    this.popoverRef.closed$.subscribe({
      complete: () => this.closedObserver.complete(),
      error: err => this.closedObserver.error(err)
    });
  }

  public close(result?: unknown): void {
    if (result !== undefined) {
      this.closedObserver.next(result);
    }
    this.popoverRef?.close();
  }
}

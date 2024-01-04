import { Observable, Observer, ReplaySubject } from 'rxjs';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetRef } from './sheet';

export class DefaultSheetRef extends SheetRef {
  public readonly closed$: Observable<unknown>;

  private readonly closedObserver: Observer<unknown>;
  private popoverRef?: PopoverRef;
  private closedWithResult: boolean = false;

  public constructor() {
    super();
    const closedSubject = new ReplaySubject<unknown>(1);
    this.closedObserver = closedSubject;
    this.closed$ = closedSubject.asObservable();
  }

  public initialize(popoverRef: PopoverRef): void {
    this.popoverRef = popoverRef;
    this.popoverRef.closed$.subscribe({
      next: () => {
        if (!this.closedWithResult) {
          this.closedObserver.next(undefined);
        }
        this.closedWithResult = false;
      },
      complete: () => this.closedObserver.complete(),
      error: err => this.closedObserver.error(err),
    });
  }

  public close(result?: unknown): void {
    if (result !== undefined) {
      this.closedObserver.next(result);
      this.closedWithResult = true;
    }
    this.popoverRef?.close();
  }

  public show(): void {
    this.popoverRef?.show();
  }

  public hide(): void {
    this.popoverRef?.hide();
  }
}

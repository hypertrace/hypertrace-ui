import { Subject } from 'rxjs';
import { PopoverRef } from '../../popover/popover-ref';

export class ModalRef extends PopoverRef {
  public readonly output$: Subject<unknown> = new Subject<unknown>();

  public output(value: unknown): void {
    this.output$.next(value);
  }

  public constructor(popoverRef: PopoverRef) {
    super(popoverRef.overlayRef, popoverRef.positionBuilder, popoverRef.navigationService);
  }
}

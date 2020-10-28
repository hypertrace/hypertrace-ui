import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import {
  IconSize,
  PopoverPositionType,
  PopoverRef,
  PopoverRelativePositionLocation,
  PopoverService
} from '@hypertrace/components';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ExplorerFilterNavParams } from '../../../pages/explorer/explorer-service';
import { ExplorerFilterOnHoverComponent } from './explorer-filter-on-hover.component';

@Directive({
  selector: '[htExplorerFilterOnHover]'
})
export class ExplorerFilterOnHoverDirective {
  private readonly mouseEnter$: Subject<MouseEvent> = new Subject();
  private readonly mouseLeave$: Subject<MouseEvent> = new Subject();

  private readonly subscriptions: Subscription = new Subscription();

  private popover?: PopoverRef;

  public constructor(private readonly popoverService: PopoverService, private readonly host: ElementRef) {
    this.subscriptions.add(this.mouseLeave$.subscribe(() => this.removeActionableIcon()));
  }

  @Input('htExplorerFilterOnHover')
  public filterParams?: ExplorerFilterOnHoverData;

  @HostListener('mouseenter', ['$event'])
  public onHover(event: MouseEvent): void {
    this.subscriptions.add(
      this.mouseEnter$.pipe(debounceTime(200), takeUntil(this.mouseLeave$)).subscribe(() => this.showActionableIcon())
    );

    this.mouseEnter$.next(event);
  }

  @HostListener('mouseleave', ['$event'])
  public onHoverEnd(event: MouseEvent): void {
    this.mouseLeave$.next(event);
  }

  public ngOnDestroy(): void {
    this.removeActionableIcon();
    this.subscriptions.unsubscribe();
  }

  private removeActionableIcon(): void {
    if (this.popover) {
      this.popover.close();
      this.popover = undefined;
    }
  }

  private showActionableIcon(): void {
    this.popover = this.popoverService.drawPopover({
      componentOrTemplate: ExplorerFilterOnHoverComponent,
      data: this.filterParams,
      position: {
        type: PopoverPositionType.Relative,
        origin: this.host,
        locationPreferences: [PopoverRelativePositionLocation.InsideCenterRight]
      }
    });
  }
}

export interface ExplorerFilterOnHoverData extends ExplorerFilterNavParams {
  iconSize?: IconSize;
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  Type,
  ViewChild
} from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import {
  PopoverBackdrop,
  PopoverPositionType,
  PopoverRef,
  PopoverRelativePositionLocation,
  PopoverService
} from '@hypertrace/components';
import { isNil } from 'lodash-es';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'ht-popover-zone',
  styleUrls: ['./popover-zone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div
      *ngIf="this.popoverContent"
      class="popover-zone"
      #popoverZone
      (mouseenter)="this.showPopover()"
      (mouseleave)="this.closePopover()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class PopoverZoneComponent<TData = never> implements OnDestroy {
  @Input()
  public popoverContent?: PopoverContent<TData>;

  @Input()
  public popoverData?: TData;

  @Input()
  public locationPreferences?: PopoverRelativePositionLocation[];

  @Input()
  public delay: number = 300; // Popover show/close delay time in millisecond

  @ViewChild('popoverZone', { read: ElementRef })
  private readonly popoverZone!: ElementRef;

  private readonly showPopoverSubject: Subject<true> = new Subject();
  private readonly showPopover$: Observable<true> = this.showPopoverSubject
    .asObservable()
    .pipe(debounceTime(this.delay));

  private readonly closePopoverSubject: Subject<true> = new Subject();
  private readonly closePopover$: Observable<true> = this.closePopoverSubject.asObservable();

  private popoverRef?: PopoverRef;
  private popoverContentHovered: boolean = false;

  public constructor(
    private readonly popoverService: PopoverService,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {
    /**
     * 1. Show from the mouse enter
     * 2. This also handles the popover content hover (close on content mouse leave)
     */
    this.subscriptionLifecycle.add(
      this.showPopover$.pipe(switchMap(() => this.buildAndShowPopover())).subscribe(hovered => {
        if (this.popoverContentHovered && !hovered) {
          this.close();
        }

        this.popoverContentHovered = hovered;
      })
    );

    /**
     * 1. Close from the mouse leave
     * 2. If popover content is being hovered, this should not close the popover
     */
    this.subscriptionLifecycle.add(
      this.closePopover$.pipe(debounceTime(this.delay)).subscribe(() => {
        if (!this.popoverContentHovered) {
          this.close();
        }
      })
    );
  }

  public showPopover(): void {
    this.showPopoverSubject.next(true);
  }

  public closePopover(): void {
    this.closePopoverSubject.next(true);
  }

  public ngOnDestroy(): void {
    this.close();
  }

  private close(): void {
    this.popoverRef?.close();
    this.popoverRef = undefined;
  }

  private buildAndShowPopover(): Observable<boolean> {
    // If popover content is null/undefined, Then do not create popover
    if (isNil(this.popoverContent)) {
      return EMPTY;
    }

    this.close();
    this.popoverRef = this.drawPopover(this.popoverContent, this.popoverData);

    return this.popoverRef.hovered$;
  }

  private drawPopover(content: PopoverContent<TData>, data?: TData): PopoverRef {
    return this.popoverService.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: this.popoverZone,
        locationPreferences: this.locationPreferences ?? [
          PopoverRelativePositionLocation.BelowCentered,
          PopoverRelativePositionLocation.BelowRightAligned,
          PopoverRelativePositionLocation.BelowLeftAligned,
          PopoverRelativePositionLocation.AboveCentered,
          PopoverRelativePositionLocation.AboveRightAligned,
          PopoverRelativePositionLocation.AboveLeftAligned,
          PopoverRelativePositionLocation.LeftCentered,
          PopoverRelativePositionLocation.OverLeftAligned,
          PopoverRelativePositionLocation.RightCentered
        ]
      },
      data: data,
      backdrop: PopoverBackdrop.None,
      componentOrTemplate: content
    });
  }
}

type PopoverContent<T> = Type<unknown> | TemplateRef<T>;

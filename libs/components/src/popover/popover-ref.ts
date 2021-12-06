import { OverlayRef } from '@angular/cdk/overlay';
import { Portal } from '@angular/cdk/portal';
import { NavigationService } from '@hypertrace/common';
import { fromEvent, Observable, Observer, ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PopoverPosition } from './popover';
import { PopoverPositionBuilder } from './popover-position-builder';

export class PopoverRef {
  public readonly backdropClick$: Observable<MouseEvent>;
  public readonly shown$: Observable<void>;
  public readonly hidden$: Observable<void>;
  public readonly closed$: Observable<void>;

  public get closed(): boolean {
    return this._closed;
  }

  public get visible(): boolean {
    return this._visible;
  }

  private readonly closedObserver: Observer<void>;
  private _closed: boolean = false;
  private _visible: boolean = false;

  public constructor(
    private readonly overlayRef: OverlayRef,
    private readonly positionBuilder: PopoverPositionBuilder,
    private readonly navigationService: NavigationService
  ) {
    this.backdropClick$ = overlayRef.backdropClick();
    this.shown$ = overlayRef.attachments();
    // Filter out the last detachment, which is the close
    this.hidden$ = overlayRef.detachments().pipe(filter(() => !this.closed));
    const closedSubject = new ReplaySubject<void>(1);
    this.closedObserver = closedSubject;
    this.closed$ = closedSubject.asObservable();

    this.shown$.subscribe(() => (this._visible = true));
    this.hidden$.subscribe(() => (this._visible = false));
  }

  private portal?: Portal<unknown>;

  public hide(): void {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

  public show(): void {
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(this.portal);
    }
  }

  public close(): void {
    this._closed = true;
    this.overlayRef.dispose();
    this.closedObserver.next();
    this.closedObserver.complete();
  }

  public initialize(portal: Portal<unknown>): void {
    this.portal = portal;
  }

  public updatePositionStrategy(position: PopoverPosition): void {
    const newStrategy = this.positionBuilder.buildPositionStrategy(position);
    if (newStrategy) {
      this.overlayRef.updatePositionStrategy(newStrategy);
    } else {
      this.overlayRef.detach();
    }
  }

  public height(height: string): void {
    this.overlayRef.updateSize({
      height: height
    });
  }

  public width(width: string): void {
    this.overlayRef.updateSize({
      width: width
    });
  }

  public closeOnBackdropClick(): () => void {
    this.assertHasBackdrop();
    const subscription = this.backdropClick$.pipe(takeUntil(this.closed$)).subscribe(() => this.close());

    return () => subscription.unsubscribe();
  }

  public hideOnBackdropClick(): () => void {
    this.assertHasBackdrop();
    const subscription = this.backdropClick$.pipe(takeUntil(this.closed$)).subscribe(() => this.hide());

    return () => subscription.unsubscribe();
  }

  public closeOnPopoverContentClick(): () => void {
    const subscription = fromEvent(this.overlayRef.overlayElement, 'click')
      .pipe(takeUntil(this.closed$))
      .subscribe(() => this.close());

    return () => subscription.unsubscribe();
  }

  public closeOnNavigation(): () => void {
    const subscription = this.navigationService.navigation$.pipe(takeUntil(this.closed$)).subscribe(() => this.close());

    return () => subscription.unsubscribe();
  }

  public hasBackdrop(): boolean {
    return !!this.overlayRef.getConfig().hasBackdrop;
  }

  private assertHasBackdrop(): void {
    if (!this.hasBackdrop()) {
      throw Error(
        'No backdrop associated with popover - make sure to create a popover with a backdrop to listen for a click'
      );
    }
  }
}

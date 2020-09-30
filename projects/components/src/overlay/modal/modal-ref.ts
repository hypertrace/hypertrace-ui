import { OverlayRef } from '@angular/cdk/overlay';
import { Portal } from '@angular/cdk/portal';
import { NavigationService } from '@hypertrace/common';
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

export class ModalRef {
  public readonly backdropClick$: Observable<MouseEvent>;
  public readonly shown$: Observable<void>;
  public readonly hidden$: Observable<void>;
  public readonly closed$: Observable<unknown>;

  public get closed(): unknown {
    return this._closed;
  }

  public get visible(): boolean {
    return this._visible;
  }

  private readonly closedObserver: Observer<unknown>;
  private _closed: unknown = false;
  private _visible: boolean = false;

  public constructor(private readonly overlayRef: OverlayRef, private readonly navigationService: NavigationService) {
    this.backdropClick$ = overlayRef.backdropClick();
    this.shown$ = overlayRef.attachments();
    // Filter out the last detachment, which is the close
    this.hidden$ = overlayRef.detachments().pipe(filter(() => !this.closed));
    const closedSubject = new ReplaySubject<unknown>(1);
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

  public close(result?: unknown): void {
    this._closed = result ?? false;
    this.overlayRef.dispose();
    this.closedObserver.next(result ?? false);
    this.closedObserver.complete();
  }

  public initialize(portal: Portal<unknown>): void {
    this.portal = portal;
  }

  public closeOnNavigation(): () => void {
    const subscription = this.navigationService.navigation$
      .pipe(takeUntil(this.closed$))
      .subscribe(() => this.close(false));

    return () => subscription.unsubscribe();
  }
}

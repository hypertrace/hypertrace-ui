import { Injectable } from '@angular/core';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarConfig as MatSnackBarConfig,
  MatLegacySnackBarRef as MatSnackBarRef
} from '@angular/material/legacy-snack-bar';
import { EMPTY, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationComponent, NotificationContent, NotificationMode } from './notification.component';
import { NotificationModule } from './notification.module';

@Injectable({ providedIn: NotificationModule })
export class NotificationService {
  private readonly snackBarDefaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'top',
    politeness: 'polite',
    duration: 5000 // Auto dismiss duration. 5 seconds in ms
  };

  private snackbarRef?: MatSnackBarRef<unknown>;
  private readonly closedObserver$: Subject<void> = new Subject();

  public constructor(public readonly snackbar: MatSnackBar) {
    this.closedObserver$.subscribe(() => {
      this.snackbarRef?.dismiss();
    });
  }

  public createSuccessToast(message: NotificationContent): void {
    this.snackbarRef = this.snackbar.openFromComponent(NotificationComponent, {
      ...this.snackBarDefaultConfig,
      data: {
        message: message,
        mode: NotificationMode.Success,
        closedObserver: this.closedObserver$
      }
    });
  }

  public createFailureToast(message: NotificationContent): Observable<never> {
    this.snackbarRef = this.snackbar.openFromComponent(NotificationComponent, {
      ...this.snackBarDefaultConfig,
      politeness: 'assertive', // Set politeness level for errors to assertive
      duration: 0, // Keep the notification open indefinitely in case of error
      data: { message: message, mode: NotificationMode.Failure, closedObserver: this.closedObserver$ }
    });

    return EMPTY;
  }

  public createInfoToast(message: NotificationContent, configOverride: Partial<MatSnackBarConfig> = {}): void {
    this.snackbarRef = this.snackbar.openFromComponent(NotificationComponent, {
      ...this.snackBarDefaultConfig,
      ...configOverride,
      data: { message: message, mode: NotificationMode.Info, closedObserver: this.closedObserver$ }
    });
  }

  public wrapWithNotification<T>(
    source: Observable<T>,
    successMessage: NotificationContent,
    failureMessage: NotificationContent
  ): Observable<T> {
    let emitted = false;

    return source.pipe(
      tap(
        () => (emitted = true),
        () => this.createFailureToast(failureMessage),
        () => emitted && this.createSuccessToast(successMessage)
      )
    );
  }

  public withNotification<T>(
    successMessage: NotificationContent,
    failureMessage: NotificationContent
  ): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => this.wrapWithNotification(source, successMessage, failureMessage);
  }

  public close(): void {
    this.snackbarRef?.dismiss();
  }
}

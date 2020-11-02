import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { SnackbarComponent, SnackbarMode } from './snackbar.component';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBarDefaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'left',
    verticalPosition: 'bottom',
    duration: 5000 // 5 seconds in ms
  };

  private snackbarRef?: MatSnackBarRef<unknown>;
  private readonly closedObserver$: Subject<void> = new Subject();

  public constructor(private readonly snackbar: MatSnackBar) {
    this.closedObserver$.subscribe(() => {
      this.snackbarRef?.dismiss();
    });
  }

  public createSuccessToast(message: string): void {
    this.snackbarRef = this.snackbar.openFromComponent(SnackbarComponent, {
      ...this.snackBarDefaultConfig,
      data: {
        message: message,
        mode: SnackbarMode.Success,
        closedObserver: this.closedObserver$
      }
    });
  }

  public createFailureToast(message: string): void {
    this.snackbarRef = this.snackbar.openFromComponent(SnackbarComponent, {
      ...this.snackBarDefaultConfig,
      duration: 0, // Keep the snackbar open indefinitely in case of error
      data: { message: message, mode: SnackbarMode.Failure, closedObserver: this.closedObserver$ }
    });
  }

  public createInfoToast(message: string): void {
    this.snackbarRef = this.snackbar.openFromComponent(SnackbarComponent, {
      ...this.snackBarDefaultConfig,
      data: { message: message, mode: SnackbarMode.Info, closedObserver: this.closedObserver$ }
    });
  }
}

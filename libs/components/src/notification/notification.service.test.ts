import { MatSnackBar } from '@angular/material/snack-bar';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { EMPTY, of, throwError } from 'rxjs';
import { NotificationComponent, NotificationMode } from './notification.component';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let spectator: SpectatorService<NotificationService>;

  const createService = createServiceFactory({
    service: NotificationService,
    providers: [mockProvider(MatSnackBar, { openFromComponent: jest.fn() })]
  });

  test('should create success notification correctly', () => {
    spectator = createService();
    spectator.service.createSuccessToast('Success');

    expect(spectator.inject(MatSnackBar).openFromComponent).toHaveBeenCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 5000,
        data: expect.objectContaining({ message: 'Success', mode: NotificationMode.Success })
      })
    );
  });

  test('should create failure notification correctly', () => {
    spectator = createService();
    spectator.service.createFailureToast('Fail');

    expect(spectator.inject(MatSnackBar).openFromComponent).toHaveBeenCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 0,
        data: expect.objectContaining({ message: 'Fail', mode: NotificationMode.Failure })
      })
    );
  });

  test('should create info notification correctly', () => {
    spectator = createService();
    spectator.service.createInfoToast('info');

    expect(spectator.inject(MatSnackBar).openFromComponent).toHaveBeenCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 5000,
        data: expect.objectContaining({ message: 'info', mode: NotificationMode.Info })
      })
    );
  });

  test('withNotification should work correctly', () => {
    spectator = createService();

    spectator.service.wrapWithNotification(of(true), 'success', 'failure').subscribe();

    expect(spectator.inject(MatSnackBar).openFromComponent).toHaveBeenLastCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 5000,
        data: expect.objectContaining({ message: 'success', mode: NotificationMode.Success })
      })
    );

    spectator.service.wrapWithNotification(throwError('error'), 'success', 'failure').subscribe();

    expect(spectator.inject(MatSnackBar).openFromComponent).toHaveBeenLastCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 0,
        data: expect.objectContaining({ message: 'failure', mode: NotificationMode.Failure })
      })
    );
  });

  test('withNotification operator should work correctly', () => {
    spectator = createService();
    const matSnackBar = spectator.inject(MatSnackBar);

    of(true).pipe(spectator.service.withNotification('success', 'failure')).subscribe();

    expect(matSnackBar.openFromComponent).toHaveBeenLastCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 5000,
        data: expect.objectContaining({ message: 'success', mode: NotificationMode.Success })
      })
    );

    throwError('error').pipe(spectator.service.withNotification('success', 'failure')).subscribe();

    expect(matSnackBar.openFromComponent).toHaveBeenLastCalledWith(
      NotificationComponent,
      expect.objectContaining({
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        duration: 0,
        data: expect.objectContaining({ message: 'failure', mode: NotificationMode.Failure })
      })
    );

    // Completing the source observable without emitting a value should not show any message
    matSnackBar.openFromComponent.mockClear();
    EMPTY.pipe(spectator.service.withNotification('success', 'failure')).subscribe();
    expect(matSnackBar.openFromComponent).not.toHaveBeenCalled();
  });
});

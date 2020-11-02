import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '@hypertrace/components';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { NotificationComponent, NotificationMode } from './notification.component';

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
});

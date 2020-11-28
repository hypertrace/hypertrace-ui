import { fakeAsync } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { IconType } from '@hypertrace/assets-library';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { NotificationComponent, NotificationMode } from './notification.component';

describe('NotificationComponent', () => {
  let spectator: SpectatorHost<NotificationComponent>;

  const createHost = createHostFactory({
    component: NotificationComponent,
    shallow: true,
    declarations: [MockComponent(IconComponent)]
  });

  test('should create success notification correctly', fakeAsync(() => {
    const closedObserver: Subject<void> = new Subject();
    const nextSpy = spyOn(closedObserver, 'next');
    spectator = createHost('<ht-notification></ht-notification>', {
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: {
            mode: NotificationMode.Success,
            message: 'Success!',
            closedObserver: closedObserver
          }
        }
      ]
    });

    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.CheckCircle);
    expect(spectator.query('.text')).toContainText('Success!');
    spectator.click('.dismiss-icon');
    spectator.tick();

    expect(nextSpy).toHaveBeenCalled();
  }));

  test('should create failure notification correctly', fakeAsync(() => {
    const closedObserver: Subject<void> = new Subject();
    const nextSpy = spyOn(closedObserver, 'next');
    spectator = createHost('<ht-notification></ht-notification>', {
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: {
            mode: NotificationMode.Failure,
            message: 'Failure!',
            closedObserver: closedObserver
          }
        }
      ]
    });

    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.Alert);
    expect(spectator.query('.text')).toContainText('Failure!');
    spectator.click('.dismiss-icon');
    spectator.tick();

    expect(nextSpy).toHaveBeenCalled();
  }));

  test('should create info notification correctly', fakeAsync(() => {
    const closedObserver: Subject<void> = new Subject();
    const nextSpy = spyOn(closedObserver, 'next');
    spectator = createHost('<ht-notification></ht-notification>', {
      providers: [
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: {
            mode: NotificationMode.Info,
            message: 'Information',
            closedObserver: closedObserver
          }
        }
      ]
    });

    expect(spectator.query(IconComponent)?.icon).toEqual(IconType.Info);
    expect(spectator.query('.text')).toContainText('Information');
    spectator.click('.dismiss-icon');
    spectator.tick();

    expect(nextSpy).toHaveBeenCalled();
  }));
});

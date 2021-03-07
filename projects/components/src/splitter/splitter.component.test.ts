import { LayoutChangeService, SubscriptionLifecycle } from '@hypertrace/common';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { SplitterDirection } from './splitter';
import { SplitterComponent } from './splitter.component';
import { SplitterService } from './splitter.service';

describe('Splitter component', () => {
  let spectator: SpectatorHost<SplitterComponent>;
  const mockSubscriptionService = {
    add: jest.fn(),
    unsubscribe: jest.fn()
  };

  const mockSplitterService = {
    buildSplitterLayoutChangeObservable: jest.fn().mockReturnValue(of(true))
  };

  const createHost = createHostFactory({
    component: SplitterComponent,
    shallow: true,
    componentProviders: [
      {
        provide: SubscriptionLifecycle,
        useValue: mockSubscriptionService
      },
      {
        provide: SplitterService,
        useValue: mockSplitterService
      }
    ],
    providers: [
      {
        provide: SubscriptionLifecycle,
        useValue: mockSubscriptionService
      },
      {
        provide: SplitterService,
        useValue: mockSplitterService
      },
      mockProvider(LayoutChangeService, {
        publishLayoutChange: jest.fn()
      })
    ]
  });

  test('should show all elements and delegate to service method correctly', () => {
    const onLayoutChangeSpy = jest.fn();
    spectator = createHost(
      `<ht-splitter [direction]="direction" (layoutChange)="onLayoutChange($event)">
      </ht-splitter>`,
      {
        hostProps: {
          direction: SplitterDirection.Horizontal,
          onLayoutChange: onLayoutChangeSpy
        }
      }
    );

    const splitter = spectator.query('.splitter');
    expect(splitter).toExist();
    expect(splitter).toHaveClass('splitter horizontal');
    expect(spectator.query('.cursor')).toExist();

    const subscriptionService = spectator.inject(SubscriptionLifecycle);
    expect(subscriptionService.unsubscribe).toHaveBeenCalled();
    expect(subscriptionService.add).toHaveBeenCalled();

    expect(spectator.inject(SplitterService).buildSplitterLayoutChangeObservable).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      SplitterDirection.Horizontal,
      3
    );

    expect(onLayoutChangeSpy).toHaveBeenCalledWith(true);
    expect(spectator.inject(LayoutChangeService).publishLayoutChange).toHaveBeenCalled();
  });
});

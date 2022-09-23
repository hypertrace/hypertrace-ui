import { fakeAsync, flush } from '@angular/core/testing';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { BehaviorSubject } from 'rxjs';
import { PopoverService } from '../popover/popover.service';
import { PopoverZoneComponent } from './popover-zone.component';

describe('Popover Zone Component', () => {
  const hoverSubject = new BehaviorSubject<boolean>(false);
  const mockPopoverRef = {
    close: jest.fn(),
    hovered$: hoverSubject.asObservable()
  };

  const createHost = createHostFactory({
    component: PopoverZoneComponent,
    shallow: true,
    componentProviders: [
      mockProvider(SubscriptionLifecycle, {
        add: jest.fn()
      })
    ],
    providers: [
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ]
  });

  test('should not render anything for null/undefined popover content', () => {
    const spectator = createHost(`<ht-popover-zone></ht-popover-zone>`);

    // For null/undefined popover content
    expect(spectator.query('.popover-zone')).not.toExist();
  });

  test('should  render everything correctly', fakeAsync(() => {
    const spectator = createHost(
      `
      <ht-popover-zone [popoverContent]="popoverContent" [delay]="delay">
        <div>Hover me</div>
      </ht-popover-zone>
      <ng-template #popoverContent>Test</ng-template>
      `,
      {
        hostProps: {
          delay: 0
        }
      }
    );

    expect(spectator.query('.popover-zone')).toExist();

    // Show popover on mouse enter
    spectator.dispatchMouseEvent('.popover-zone', 'mouseenter', undefined);
    spectator.tick(2000);
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();
    flush();
  }));
});

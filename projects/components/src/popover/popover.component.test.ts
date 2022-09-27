import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';
import { PopoverContentComponent } from './popover-content.component';
import { PopoverTriggerComponent, PopoverTriggerType } from './popover-trigger.component';
import { PopoverComponent } from './popover.component';
import { PopoverService } from './popover.service';
import { PopoverHoverTriggerService } from './service/popover-hover-trigger.service';

describe('Popover Component', () => {
  const closeSubject = new Subject();
  const mockPopoverRef = {
    close: () => closeSubject.next(true),
    closeOnBackdropClick: jest.fn(),
    closeOnPopoverContentClick: jest.fn(),
    closeOnNavigation: jest.fn(),
    closed$: closeSubject.asObservable()
  };
  const createHost = createHostFactory({
    component: PopoverComponent,
    providers: [
      mockProvider(PopoverHoverTriggerService),
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ],
    declarations: [MockComponent(PopoverTriggerComponent), MockComponent(PopoverContentComponent)]
  });

  test('should render everything correctly for click popover trigger', () => {
    const spectator = createHost(
      `
    <ht-popover>
        <ht-popover-trigger>Popover Trigger</ht-popover-trigger>
        <ht-popover-content>Popover Content</ht-popover-content>
    </ht-popover>
    `,
      {
        props: {
          closeOnClick: true,
          closeOnNavigate: true
        }
      }
    );

    // Open a popover
    spectator.dispatchMouseEvent(spectator.element, 'click');
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalledTimes(1);

    // Close a popover
    closeSubject.next(true);
  });

  test('should render everything correctly for hover popover trigger', () => {
    const spectator = createHost(
      `
    <ht-popover>
        <ht-popover-trigger type="${PopoverTriggerType.Hover}">Popover Trigger</ht-popover-trigger>
        <ht-popover-content>Popover Content</ht-popover-content>
    </ht-popover>
    `
    );

    // Open a popover
    spectator.dispatchMouseEvent(spectator.element, 'mouseenter');

    // Close a popover
    spectator.dispatchMouseEvent(spectator.element, 'mouseleave');
  });
});

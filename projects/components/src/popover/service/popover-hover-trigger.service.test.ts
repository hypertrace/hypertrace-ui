import { ElementRef } from '@angular/core';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { PopoverContentComponent } from '../popover-content.component';
import { PopoverService } from '../popover.service';
import { PopoverHoverTriggerService } from './popover-hover-trigger.service';

describe('Popover Hover Trigger Service', () => {
  const hoverSubject = new Subject();
  const mockPopoverRef = {
    close: jest.fn(),
    hovered$: hoverSubject.asObservable()
  };

  const createService = createServiceFactory({
    service: PopoverHoverTriggerService,
    providers: [
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ]
  });

  test('should work everything correctly', () => {
    const spectator = createService();

    spectator.service.showPopover({
      origin: new ElementRef(document.createElement('a')),
      popoverContent: new PopoverContentComponent()
    });
    spectator.service.closePopover();
  });
});

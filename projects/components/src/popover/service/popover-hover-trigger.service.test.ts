import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import {
  PopoverHoverTriggerService,
  PopoverModule,
  PopoverPositionType,
  PopoverRelativePositionLocation,
  PopoverService,
} from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { BehaviorSubject } from 'rxjs';

describe('Popover hover trigger service', () => {
  let spectator: SpectatorHost<unknown>;
  const hoveredSubject = new BehaviorSubject<boolean>(true);
  const mockPopoverRef = {
    hovered$: hoveredSubject.asObservable(),
    close: jest.fn(),
  };

  const createHost = createHostFactory({
    component: Component({
      selector: 'test-tooltip',
      template: `<div><div class="tooltip-content">Content!</div></div>`,
    })(class {}),
    imports: [PopoverModule],
    providers: [
      PopoverHoverTriggerService,
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef),
      }),
    ],
  });

  test('builds tooltip popover', fakeAsync(() => {
    spectator = createHost('<test-tooltip></test-tooltip>');
    const popoverHoverTriggerService = spectator.inject(PopoverHoverTriggerService);
    const componentOrTemplate = spectator.query('.tooltip-content')!;
    const origin = spectator.query('div');
    popoverHoverTriggerService.showPopover({
      origin: origin,
      componentOrTemplate: componentOrTemplate,
    });

    spectator.tick(300); // Debounce timer
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalled();
    expect(spectator.inject(PopoverService).drawPopover).toHaveBeenCalledWith(
      expect.objectContaining({
        position: {
          type: PopoverPositionType.Relative,
          origin: origin,
          locationPreferences: [
            PopoverRelativePositionLocation.BelowCentered,
            PopoverRelativePositionLocation.BelowRightAligned,
            PopoverRelativePositionLocation.BelowLeftAligned,
            PopoverRelativePositionLocation.AboveCentered,
            PopoverRelativePositionLocation.AboveRightAligned,
            PopoverRelativePositionLocation.AboveLeftAligned,
            PopoverRelativePositionLocation.LeftCentered,
            PopoverRelativePositionLocation.OverLeftAligned,
            PopoverRelativePositionLocation.RightCentered,
          ],
        },
        componentOrTemplate: componentOrTemplate,
      }),
    );
  }));

  test('closes tooltip when tooltip hover stops', fakeAsync(() => {
    spectator = createHost('<test-tooltip></test-tooltip>');
    const popoverHoverTriggerService = spectator.inject(PopoverHoverTriggerService);
    const componentOrTemplate = spectator.query('.tooltip-content')!;
    const origin = spectator.query('div');
    popoverHoverTriggerService.showPopover({
      origin: origin,
      componentOrTemplate: componentOrTemplate,
    });

    hoveredSubject.next(false);
    spectator.tick(300); // Debounce timer
    expect(mockPopoverRef.close).toHaveBeenCalled();
  }));
});

import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import {
  PopoverContentComponent,
  PopoverHoverTriggerService,
  PopoverModule,
  PopoverPositionType,
  PopoverRelativePositionLocation,
  PopoverService
} from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

describe('Popover hover trigger service', () => {
  let spectator: SpectatorHost<unknown>;
  const mockPopoverRef = {
    hovered$: of(true)
  };

  const createHost = createHostFactory({
    component: Component({
      selector: 'test-tooltip',
      template: `<div><ht-popover-content></ht-popover-content></div>`
    })(class {}),
    imports: [PopoverModule],
    providers: [
      PopoverHoverTriggerService,
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ]
  });

  test('builds tooltip popover', fakeAsync(() => {
    spectator = createHost('<test-tooltip></test-tooltip>');
    const popoverHoverTriggerService = spectator.inject(PopoverHoverTriggerService);
    const popoverContentComponent = spectator.query(PopoverContentComponent)!;
    const origin = spectator.query('div');
    popoverHoverTriggerService.showPopover({
      origin: origin,
      popoverContent: popoverContentComponent
    });

    spectator.tick(300);
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
            PopoverRelativePositionLocation.RightCentered
          ]
        }
      })
    );
  }));
});

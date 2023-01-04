import { createDirectiveFactory, mockProvider } from '@ngneat/spectator/jest';
import { PopoverRelativePositionLocation } from '../../popover/popover';
import { PopoverService } from '../../popover/popover.service';
import { PopoverHoverTriggerService } from '../../popover/service/popover-hover-trigger.service';
import { ActionableTooltipDirective } from './actionable-tooltip.directive';

describe('Actionable Tooltip Directive', () => {
  const createDirective = createDirectiveFactory({
    directive: ActionableTooltipDirective,
    shallow: true,
    directiveProviders: [mockProvider(PopoverHoverTriggerService, { closePopover: jest.fn() })],
    providers: [mockProvider(PopoverService)]
  });

  test('should not render tooltip if content is empty', () => {
    const spectator = createDirective(`
      <div class="content" htActionableTooltip=""></div>
    `);

    spectator.dispatchMouseEvent(spectator.element, 'mouseenter');
    expect(spectator.inject(PopoverHoverTriggerService).showPopover).not.toHaveBeenCalled();
  });

  test('should render tooltip correctly if content is not empty', () => {
    const spectator = createDirective(`
      <div class="content" htActionableTooltip="test-tooltip"></div>
    `);

    // Mouse Enter
    spectator.dispatchMouseEvent(spectator.element, 'mouseenter');
    expect(spectator.inject(PopoverHoverTriggerService).showPopover).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          data: { content: 'test-tooltip', context: {} },
          locationPreferences: [
            PopoverRelativePositionLocation.BelowCentered,
            PopoverRelativePositionLocation.AboveCentered,
            PopoverRelativePositionLocation.RightCentered,
            PopoverRelativePositionLocation.LeftCentered
          ]
        }
      })
    );

    // Mouse Leave
    spectator.dispatchMouseEvent(spectator.element, 'mouseleave');
    expect(spectator.inject(PopoverHoverTriggerService).closePopover).toHaveBeenCalled();
  });
});

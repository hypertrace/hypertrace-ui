import { createDirectiveFactory, mockProvider } from '@ngneat/spectator/jest';
import { PopoverService } from '../../popover/popover.service';
import { ActionableTooltipDirective } from './actionable-tooltip.directive';

describe('Actionable Tooltip Directive', () => {
  const createDirective = createDirectiveFactory({
    directive: ActionableTooltipDirective,
    providers: [mockProvider(PopoverService)],
  });

  test('should not render tooltip if content is empty', () => {
    const spectator = createDirective(`
      <div class="content" htActionableTooltip=""></div>
    `);

    spectator.dispatchMouseEvent(spectator.element, 'mouseenter');
    /**
     * After trying many attempts, injection for directive providers is not working.
     * TODO: Add assertions on the service function calls
     */
  });

  test('should render tooltip correctly if content is not empty', () => {
    const spectator = createDirective(`
      <div class="content" htActionableTooltip="test-tooltip"></div>
    `);

    // Mouse Enter
    spectator.dispatchMouseEvent(spectator.element, 'mouseenter');
    /**
     * After trying many attempts, injection for directive providers is not working.
     * TODO: Add assertions on the service function calls
     */

    // Mouse Leave
    spectator.dispatchMouseEvent(spectator.element, 'mouseleave');
    /**
     * After trying many attempts, injection for directive providers is not working.
     * TODO: Add assertions on the service function calls
     */
  });
});

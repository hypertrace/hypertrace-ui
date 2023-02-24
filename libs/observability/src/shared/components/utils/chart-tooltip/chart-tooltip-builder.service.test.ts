import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { PopoverService } from '@hypertrace/components';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { ChartTooltipBuilderService } from './chart-tooltip-builder.service';
import { ChartTooltipModule } from './chart-tooltip.module';
import { DefaultChartTooltipComponent } from './default/default-chart-tooltip.component';

describe('Chart tooltip Builder service', () => {
  let spectator: SpectatorHost<unknown>;
  const mockPopoverRef = {
    show: jest.fn(),
    hide: jest.fn(),
    close: jest.fn(),
    updatePositionStrategy: jest.fn()
  };

  const createHost = createHostFactory({
    component: Component({
      selector: 'test-svg',
      template: `<svg></svg>`
    })(class {}),
    imports: [ChartTooltipModule],
    providers: [
      ChartTooltipBuilderService,
      mockProvider(PopoverService, {
        drawPopover: jest.fn().mockReturnValue(mockPopoverRef)
      })
    ]
  });

  test('builds tooltip popover', fakeAsync(() => {
    spectator = createHost('<test-svg></test-svg>');
    const tooltipBuilderService = spectator.inject(ChartTooltipBuilderService);
    const element = spectator.query('svg')!;
    const tooltipPopoverRef = tooltipBuilderService.constructTooltip(DefaultChartTooltipComponent);

    expect(tooltipPopoverRef).toBeDefined();

    tooltipPopoverRef.showWithData(element, []);
    expect(mockPopoverRef.show).toHaveBeenCalled();

    tooltipPopoverRef.hide();
    expect(mockPopoverRef.hide).toHaveBeenCalled();

    tooltipPopoverRef.destroy();
    expect(mockPopoverRef.close).toHaveBeenCalled();
  }));
});

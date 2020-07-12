import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POPOVER_DATA } from '@hypertrace/components';
import { Observable } from 'rxjs';

@Component({
  selector: 'ht-chart-tooltip',
  styleUrls: ['./default-chart-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './default-chart-tooltip.component.html'
})
export class DefaultChartTooltipComponent {
  public constructor(
    @Inject(POPOVER_DATA)
    public readonly data$: Observable<DefaultChartTooltipRenderData>
  ) {}
}

export interface DefaultChartTooltipRenderData {
  title: string;
  labeledValues: { label: string; value: number | string; color: string; units?: string }[];
}

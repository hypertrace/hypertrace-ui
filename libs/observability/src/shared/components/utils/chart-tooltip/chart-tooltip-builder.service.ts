import { Injectable, TemplateRef, Type } from '@angular/core';
import { PopoverPositionType, PopoverService } from '@hypertrace/components';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MouseLocationData } from '../mouse-tracking/mouse-tracking';
import { ChartTooltipPopover, ChartTooltipRef } from './chart-tooltip-popover';
import { DefaultChartTooltipComponent, DefaultChartTooltipRenderData } from './default/default-chart-tooltip.component';

@Injectable()
export class ChartTooltipBuilderService {
  public constructor(private readonly popoverService: PopoverService) {}

  public constructTooltip<TData, TContext, TRenderData = DefaultChartTooltipRenderData>(
    mapper?: ChartTooltipDataMapper<TData, TContext, TRenderData>,
    componentType: Type<unknown> | TemplateRef<unknown> = DefaultChartTooltipComponent
  ): ChartTooltipRef<TData, TContext> {
    const inputSubject = new Subject<MouseLocationData<TData, TContext>[]>();

    const popoverRef = this.popoverService.drawPopover({
      componentOrTemplate: componentType,
      position: {
        type: PopoverPositionType.Hidden
      },
      data: this.buildMappedObservable(inputSubject.asObservable(), mapper)
    });

    return new ChartTooltipPopover(popoverRef, inputSubject);
  }

  private buildMappedObservable<TData, TContext, TRenderData>(
    locationDataObservable: Observable<MouseLocationData<TData, TContext>[]>,
    mapper?: ChartTooltipDataMapper<TData, TContext, TRenderData>
  ): Observable<TRenderData> {
    if (!mapper) {
      return locationDataObservable as Observable<TRenderData & MouseLocationData<TData, TContext>[]>;
    }

    return locationDataObservable.pipe(
      map(mapper),
      filter((data): data is TRenderData => data !== undefined)
    );
  }
}

export type ChartTooltipDataMapper<TData, TContext, TRenderData> = (
  data: MouseLocationData<TData, TContext>[]
) => TRenderData | undefined;

import { ComponentRef, Injector } from '@angular/core';
import { DynamicComponentService } from '@hypertrace/common';
import { ContainerElement, EnterElement, select, Selection } from 'd3-selection';
import { LegendPosition } from '../../../legend/legend.component';
import { Series, Summary } from '../../chart';
import {
  CartesianIntervalControlComponent,
  CartesianIntervalData,
  INTERVAL_DATA
} from './cartesian-interval-control.component';
import { CartesianSummaryComponent, SUMMARIES_DATA } from './cartesian-summary.component';

export class CartesianLegend {
  private static readonly CSS_CLASS: string = 'legend';
  public static readonly CSS_SELECTOR: string = `.${CartesianLegend.CSS_CLASS}`;

  private legendElement?: HTMLDivElement;
  private intervalControl?: ComponentRef<unknown>;
  private summaryControl?: ComponentRef<unknown>;

  public constructor(
    private readonly series: Series<{}>[],
    private readonly injector: Injector,
    private readonly intervalData?: CartesianIntervalData,
    private readonly summaries: Summary[] = []
  ) {}

  public draw(hostElement: Element, position: LegendPosition): this {
    this.legendElement = this.drawLegendContainer(hostElement, position, this.intervalData !== undefined).node()!;

    if (this.summaries.length > 0) {
      this.summaryControl = this.drawSummaryControl(this.legendElement, this.summaries);
    }

    this.drawLegendEntries(this.legendElement);

    if (this.intervalData) {
      this.intervalControl = this.drawIntervalControl(this.legendElement, this.intervalData);
    }

    return this;
  }

  public element(): Element | undefined {
    return this.legendElement;
  }

  public destroy(): void {
    this.intervalControl && this.intervalControl.destroy();
    this.summaryControl && this.summaryControl.destroy();
  }

  private drawLegendEntries(container: ContainerElement): void {
    select(container)
      .append('div')
      .classed('legend-entries', true)
      .selectAll('.legend-entry')
      .data(this.series.filter(series => !series.hide))
      .enter()
      .each((_, index, elements) => this.drawLegendEntry(elements[index]));
  }

  private drawLegendContainer(
    hostElement: Element,
    position: LegendPosition,
    hasIntervalSelector: boolean
  ): Selection<HTMLDivElement, unknown, null, undefined> {
    /*
     * The interval selector is part of the legend, so if they choose to show the interval selector but no legend, we
     * set the legend to Top in order to reserve that space for the interval selector.
     */
    const legendPosition: LegendPosition =
      hasIntervalSelector && position === LegendPosition.None ? LegendPosition.Top : position;

    return select(hostElement)
      .append('div')
      .classed(CartesianLegend.CSS_CLASS, true)
      .classed(`position-${legendPosition}`, true);
  }

  private drawLegendEntry(element: EnterElement): Selection<HTMLDivElement, Series<{}>, null, undefined> {
    const legendEntry = select<EnterElement, Series<{}>>(element).append('div').classed('legend-entry', true);

    this.appendLegendSymbol(legendEntry);

    legendEntry
      .append('span')
      .classed('legend-text', true)
      .text(series => series.name);

    return legendEntry;
  }

  private appendLegendSymbol(selection: Selection<HTMLDivElement, Series<{}>, null, undefined>): void {
    selection
      .append('svg')
      .classed('legend-symbol', true)
      .append('circle')
      .attr('r', 6)
      .attr('cx', 10)
      .attr('cy', 10)
      .style('fill', series => series.color);
  }

  private drawIntervalControl(container: ContainerElement, intervalData: CartesianIntervalData): ComponentRef<unknown> {
    return this.injector.get(DynamicComponentService).insertComponent(
      container as Element,
      CartesianIntervalControlComponent,
      Injector.create({
        providers: [
          {
            provide: INTERVAL_DATA,
            useValue: intervalData
          }
        ],
        parent: this.injector
      })
    );
  }

  private drawSummaryControl(container: ContainerElement, summaries: Summary[]): ComponentRef<unknown> {
    return this.injector.get(DynamicComponentService).insertComponent(
      container as Element,
      CartesianSummaryComponent,
      Injector.create({
        providers: [
          {
            provide: SUMMARIES_DATA,
            useValue: summaries
          }
        ],
        parent: this.injector
      })
    );
  }
}

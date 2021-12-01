import { ComponentRef, Injector } from '@angular/core';
import { Color, DynamicComponentService } from '@hypertrace/common';
import { ContainerElement, EnterElement, select, Selection } from 'd3-selection';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { LegendPosition } from '../../../legend/legend.component';
import { Series, Summary } from '../../chart';
import {
  CartesianIntervalControlComponent,
  CartesianIntervalData,
  INTERVAL_DATA
} from './cartesian-interval-control.component';
import { CartesianSummaryComponent, SUMMARIES_DATA } from './cartesian-summary.component';

export class CartesianLegend<TData> {
  private static readonly CSS_CLASS: string = 'legend';
  private static readonly RESET_CSS_CLASS: string = 'reset';
  private static readonly DEFAULT_CSS_CLASS: string = 'default';
  private static readonly ACTIVE_CSS_CLASS: string = 'active';
  private static readonly INACTIVE_CSS_CLASS: string = 'inactive';
  public static readonly CSS_SELECTOR: string = `.${CartesianLegend.CSS_CLASS}`;

  public readonly activeSeries$: Observable<Series<TData>[]>;
  private readonly activeSeriesSubject: Subject<Series<TData>[]> = new Subject();
  private readonly initialSeries: Series<TData>[];

  private isSelectionModeOn: boolean = false;
  private legendElement?: HTMLDivElement;
  private activeSeries: Series<TData>[];
  private intervalControl?: ComponentRef<unknown>;
  private summaryControl?: ComponentRef<unknown>;

  public constructor(
    private readonly series: Series<TData>[],
    private readonly injector: Injector,
    private readonly intervalData?: CartesianIntervalData,
    private readonly summaries: Summary[] = []
  ) {
    this.activeSeries = [...this.series];
    this.initialSeries = [...this.series];
    this.activeSeries$ = this.activeSeriesSubject.asObservable().pipe(distinctUntilChanged(), startWith(this.series));
  }

  public draw(hostElement: Element, position: LegendPosition): this {
    this.legendElement = this.drawLegendContainer(hostElement, position, this.intervalData !== undefined).node()!;

    if (this.summaries.length > 0) {
      this.summaryControl = this.drawSummaryControl(this.legendElement, this.summaries);
    }

    this.drawLegendEntries(this.legendElement);
    this.drawReset(this.legendElement);

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

  private drawReset(container: ContainerElement): void {
    select(container)
      .append('span')
      .classed(CartesianLegend.RESET_CSS_CLASS, true)
      .text('Reset')
      .on('click', () => this.disableSelectionMode());

    this.updateResetElementVisibility(!this.isSelectionModeOn);
  }

  private updateResetElementVisibility(isHidden: boolean): void {
    select(this.legendElement!).select(`span.${CartesianLegend.RESET_CSS_CLASS}`).classed('hidden', isHidden);
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

  private drawLegendEntry(element: EnterElement): Selection<HTMLDivElement, Series<TData>, null, undefined> {
    const legendEntry = select<EnterElement, Series<TData>>(element).append('div').classed('legend-entry', true);

    this.appendLegendSymbol(legendEntry);
    legendEntry
      .append('span')
      .classed('legend-text', true)
      .text(series => series.name)
      .on('click', series => (this.series.length > 1 ? this.updateActiveSeries(series) : null));

    this.updateLegendClassesAndStyle();

    return legendEntry;
  }

  private updateLegendClassesAndStyle(): void {
    const legendElementSelection = select<HTMLDivElement, Series<TData>>(this.legendElement!);

    // Legend entry symbol
    legendElementSelection
      .selectAll('.legend-symbol circle')
      .style('fill', series =>
        !this.isThisLegendEntryActive(series as Series<TData>) ? Color.Gray3 : (series as Series<TData>).color
      );

    // Legend entry value text
    legendElementSelection
      .selectAll('span.legend-text')
      .classed(CartesianLegend.DEFAULT_CSS_CLASS, !this.isSelectionModeOn)
      .classed(
        CartesianLegend.ACTIVE_CSS_CLASS,
        series => this.isSelectionModeOn && this.isThisLegendEntryActive(series as Series<TData>)
      )
      .classed(
        CartesianLegend.INACTIVE_CSS_CLASS,
        series => this.isSelectionModeOn && !this.isThisLegendEntryActive(series as Series<TData>)
      );
  }

  private appendLegendSymbol(selection: Selection<HTMLDivElement, Series<TData>, null, undefined>): void {
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

  private disableSelectionMode(): void {
    this.activeSeries = [...this.initialSeries];
    this.isSelectionModeOn = false;
    this.updateLegendClassesAndStyle();
    this.updateResetElementVisibility(!this.isSelectionModeOn);
    this.activeSeriesSubject.next(this.activeSeries);
  }

  private updateActiveSeries(seriesEntry: Series<TData>): void {
    if (!this.isSelectionModeOn) {
      this.activeSeries = [seriesEntry];
      this.isSelectionModeOn = true;
    } else if (this.isThisLegendEntryActive(seriesEntry)) {
      this.activeSeries = this.activeSeries.filter(series => series !== seriesEntry);
    } else {
      this.activeSeries.push(seriesEntry);
    }
    this.updateLegendClassesAndStyle();
    this.updateResetElementVisibility(!this.isSelectionModeOn);
    this.activeSeriesSubject.next(this.activeSeries);
  }

  private isThisLegendEntryActive(seriesEntry: Series<TData>): boolean {
    return this.activeSeries.includes(seriesEntry);
  }
}

import { ComponentRef, Injector } from '@angular/core';
import { Color, Dictionary, DynamicComponentService } from '@hypertrace/common';
import { ContainerElement, EnterElement, select, Selection } from 'd3-selection';
import { groupBy, isNil } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
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
  private static readonly SELECTABLE_CSS_CLASS: string = 'selectable';
  private static readonly DEFAULT_CSS_CLASS: string = 'default';
  private static readonly ACTIVE_CSS_CLASS: string = 'active';
  private static readonly INACTIVE_CSS_CLASS: string = 'inactive';
  public static readonly CSS_SELECTOR: string = `.${CartesianLegend.CSS_CLASS}`;

  public readonly activeSeries$: Observable<Series<TData>[]>;
  private readonly activeSeriesSubject: Subject<Series<TData>[]> = new Subject();
  private readonly initialSeries: Series<TData>[];
  private readonly groupedSeries: Dictionary<Series<TData>[]>;

  private readonly isGrouped: boolean = true;
  private readonly isNonTitledGrouped: boolean = false;
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
    this.isGrouped = !isNil(this.series[0]?.groupName);
    this.isNonTitledGrouped = this.series.length > 0 && this.series[0].name === this.series[0].groupName;
    this.groupedSeries = this.isGrouped ? groupBy(this.series, seriesEntry => seriesEntry.groupName) : {};

    this.activeSeries = [...this.series];
    this.initialSeries = [...this.series];
    this.activeSeries$ = this.activeSeriesSubject.asObservable().pipe(startWith(this.series));
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
    const containerSelection = select(container);
    if (!this.isGrouped) {
      containerSelection
        .append('div')
        .classed('legend-entries', true)
        .selectAll('.legend-entry')
        .data(this.series.filter(series => !series.hide))
        .enter()
        .each((_, index, elements) => this.drawLegendEntry(elements[index]));
    } else {
      containerSelection
        .selectAll('.legend-entries')
        .data(Object.values(this.groupedSeries))
        .enter()
        .append('div')
        .attr('class', (_, index) => `legend-entries group-${index + 1}`)
        .each((seriesGroup, index, elements) => this.drawLegendEntriesTitleAndValues(seriesGroup, elements[index]));
    }
  }

  private drawLegendEntriesTitleAndValues(seriesGroup: Series<TData>[], element: HTMLDivElement): void {
    const legendEntriesSelection = select(element);
    if (!this.isNonTitledGrouped) {
      legendEntriesSelection
        .selectAll('.legend-entries-title')
        .data([seriesGroup])
        .enter()
        .append('div')
        .classed('legend-entries-title', true)
        .text(group => `${group[0].groupName}:`)
        .on('click', () => this.updateActiveSeriesGroup(seriesGroup));
    }

    legendEntriesSelection
      .append('div')
      .classed('legend-entry-values', true)
      .selectAll('.legend-entry')
      .data(seriesGroup)
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
      .classed(`position-${legendPosition}`, true)
      .classed('grouped', this.isGrouped);
  }

  private drawLegendEntry(element: EnterElement): Selection<HTMLDivElement, Series<TData>, null, undefined> {
    const legendEntry = select<EnterElement, Series<TData>>(element).append('div').classed('legend-entry', true);

    this.appendLegendSymbol(legendEntry);
    legendEntry
      .append('span')
      .classed('legend-text', true)
      .classed(CartesianLegend.SELECTABLE_CSS_CLASS, this.series.length > 1)
      .text(series => series.name)
      .on('click', series => (this.series.length > 1 ? this.updateActiveSeries(series) : undefined));

    this.updateLegendClassesAndStyle();

    return legendEntry;
  }

  private updateLegendClassesAndStyle(): void {
    const legendElementSelection = select(this.legendElement!);
    if (this.isGrouped) {
      // Legend entries
      select(this.legendElement!)
        .selectAll('.legend-entries')
        .classed(CartesianLegend.ACTIVE_CSS_CLASS, seriesGroup =>
          this.isThisLegendSeriesGroupActive(seriesGroup as Series<TData>[])
        );

      // Legend entry title
      select(this.legendElement!)
        .selectAll('.legend-entries-title')
        .classed(CartesianLegend.ACTIVE_CSS_CLASS, seriesGroup =>
          this.isThisLegendSeriesGroupActive(seriesGroup as Series<TData>[])
        );
    }

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

  private updateActiveSeriesGroup(seriesGroup: Series<TData>[]): void {
    if (!this.isSelectionModeOn) {
      this.activeSeries = [...seriesGroup];
      this.isSelectionModeOn = true;
    } else if (!this.isThisLegendSeriesGroupActive(seriesGroup)) {
      this.activeSeries = this.activeSeries.filter(series => !seriesGroup.includes(series));
      this.activeSeries.push(...seriesGroup);
    } else {
      this.activeSeries = this.activeSeries.filter(series => !seriesGroup.includes(series));
    }
    this.updateLegendClassesAndStyle();
    this.updateResetElementVisibility(!this.isSelectionModeOn);
    this.activeSeriesSubject.next(this.activeSeries);
  }

  private updateActiveSeries(series: Series<TData>): void {
    if (!this.isSelectionModeOn) {
      this.activeSeries = [series];
      this.isSelectionModeOn = true;
    } else if (this.isThisLegendEntryActive(series)) {
      this.activeSeries = this.activeSeries.filter(seriesEntry => series !== seriesEntry);
    } else {
      this.activeSeries.push(series);
    }
    this.updateLegendClassesAndStyle();
    this.updateResetElementVisibility(!this.isSelectionModeOn);
    this.activeSeriesSubject.next(this.activeSeries);
  }

  private isThisLegendEntryActive(seriesEntry: Series<TData>): boolean {
    return this.activeSeries.includes(seriesEntry);
  }

  private isThisLegendSeriesGroupActive(seriesGroup: Series<TData>[]): boolean {
    return !this.isSelectionModeOn ? false : seriesGroup.every(series => this.activeSeries.includes(series));
  }
}

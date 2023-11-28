import { ComponentRef, Injector } from '@angular/core';
import { Color, DynamicComponentService } from '@hypertrace/common';
import { ContainerElement, EnterElement, select, Selection } from 'd3-selection';
import { groupBy, isEmpty } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { LegendPosition } from '../../../legend/legend.component';
import { Series, Summary } from '../../chart';
import {
  CartesianIntervalControlComponent,
  CartesianIntervalData,
  INTERVAL_DATA,
} from './cartesian-interval-control.component';
import { CartesianSummaryComponent, SUMMARIES_DATA } from './cartesian-summary.component';
import { FILTER_BUTTON_WRAPPER, FilterButtonWrapperComponent } from '@hypertrace/components';
import { defaultXDataAccessor } from '../scale/default-data-accessors';

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
  private readonly legendGroups: LegendGroupData<TData>[];

  private isSelectionModeOn: boolean = false;
  private legendElement?: HTMLDivElement;
  private activeSeries: Series<TData>[];
  private intervalControl?: ComponentRef<unknown>;
  private summaryControl?: ComponentRef<unknown>;

  public constructor(
    private readonly series: Series<TData>[],
    private readonly injector: Injector,
    private readonly intervalData?: CartesianIntervalData,
    private readonly summaries: Summary[] = [],
  ) {
    const isGroupedSeries =
      this.series.length > 0 &&
      this.series.every(seriesEntry => !isEmpty(seriesEntry.groupName) && seriesEntry.groupName !== seriesEntry.name);
    this.legendGroups = isGroupedSeries
      ? Object.entries(groupBy(this.series, seriesEntry => seriesEntry.groupName)).map(([title, data]) => ({
          title: title,
          data: data.map(d => ({ text: d.name, series: d })),
        }))
      : this.series.map(s => ({
          title: s.name,
          data: s.data.map(d => ({ text: defaultXDataAccessor(d), series: s })),
        }));

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
    containerSelection
      .selectAll('.legend-entries')
      .data(Object.values(this.legendGroups))
      .enter()
      .append('div')
      .classed('legend-entries', true)
      .each((seriesGroup, index, elements) => this.drawLegendEntriesTitleAndValues(seriesGroup, elements[index]));
  }

  private drawLegendEntriesTitleAndValues(seriesGroup: LegendGroupData<TData>, element: HTMLDivElement): void {
    const legendEntriesSelection = select(element);
    legendEntriesSelection
      .selectAll('.legend-entries-title')
      .data([seriesGroup])
      .enter()
      .append('div')
      .classed('legend-entries-title', true)
      .text(group => `${group.title}:`)
      .on('click', group => this.updateActiveSeriesGroup(group.data));

    legendEntriesSelection
      .append('div')
      .classed('legend-entry-values', true)
      .selectAll('.legend-entry')
      .data(seriesGroup.data)
      .enter()
      .each((_, index, elements) => this.drawLegendEntry(elements[index], true));
  }

  private drawLegendContainer(
    hostElement: Element,
    position: LegendPosition,
    hasIntervalSelector: boolean,
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
      .classed('grouped', true);
  }

  private drawLegendEntry(
    element: EnterElement,
    showFilters?: boolean,
  ): Selection<HTMLDivElement, LegendEntryData<TData>, null, undefined> {
    const legendEntry = select<EnterElement, LegendEntryData<TData>>(element)
      .append('div')
      .classed('legend-entry', true);

    this.appendLegendSymbol(legendEntry);
    legendEntry
      .append('span')
      .classed('legend-text', true)
      .classed(CartesianLegend.SELECTABLE_CSS_CLASS, this.series.length > 1)
      .text(entry => entry.text)
      .on('click', entry => (this.series.length > 1 ? this.updateActiveSeries(entry.series) : undefined));

    this.drawFilterControl(legendEntry.node()!).location.nativeElement.classList.add('filter');

    this.updateLegendClassesAndStyle();

    if (showFilters) {
      legendEntry
        .on('mouseover', () => legendEntry.select('.filter').style('visibility', 'visible'))
        .on('mouseout', () => legendEntry.select('.filter').style('visibility', 'hidden'));
    }

    return legendEntry;
  }

  private updateLegendClassesAndStyle(): void {
    const legendElementSelection = select(this.legendElement!);
    if (true) {
      // Legend entries
      select(this.legendElement!)
        .selectAll('.legend-entries')
        .classed(CartesianLegend.ACTIVE_CSS_CLASS, legendGroup =>
          this.isThisLegendSeriesGroupActive((legendGroup as LegendGroupData<TData>).data.map(d => d.series)),
        );

      // Legend entry title
      select(this.legendElement!)
        .selectAll('.legend-entries-title')
        .classed(CartesianLegend.ACTIVE_CSS_CLASS, legendGroup =>
          this.isThisLegendSeriesGroupActive((legendGroup as LegendGroupData<TData>).data.map(d => d.series)),
        );
    }

    // Legend entry symbol
    legendElementSelection
      .selectAll('.legend-symbol circle')
      .style('fill', entry =>
        !this.isThisLegendEntryActive((entry as LegendEntryData<TData>).series)
          ? Color.Gray3
          : (entry as LegendEntryData<TData>).series.color,
      );

    // Legend entry value text
    legendElementSelection
      .selectAll('span.legend-text')
      .classed(CartesianLegend.DEFAULT_CSS_CLASS, !this.isSelectionModeOn)
      .classed(
        CartesianLegend.ACTIVE_CSS_CLASS,
        entry => this.isSelectionModeOn && this.isThisLegendEntryActive((entry as LegendEntryData<TData>).series),
      )
      .classed(
        CartesianLegend.INACTIVE_CSS_CLASS,
        entry => this.isSelectionModeOn && !this.isThisLegendEntryActive((entry as LegendEntryData<TData>).series),
      );

    // Legend filters
    legendElementSelection
      .selectAll('.filter')
      .style('position', 'relative')
      .style('left', '4px')
      .style('top', '2px')
      .style('visibility', 'hidden');
  }

  private appendLegendSymbol(selection: Selection<HTMLDivElement, LegendEntryData<TData>, null, undefined>): void {
    selection
      .append('svg')
      .classed('legend-symbol', true)
      .append('circle')
      .attr('r', 6)
      .attr('cx', 10)
      .attr('cy', 10)
      .style('fill', entry => entry.series.color);
  }

  private drawFilterControl(container: ContainerElement): ComponentRef<unknown> {
    return this.injector.get(DynamicComponentService).insertComponent(
      container as Element,
      FilterButtonWrapperComponent,
      Injector.create({
        providers: [
          {
            provide: FILTER_BUTTON_WRAPPER,
            useValue: {
              targetAttribute: this.activeSeries[0].groupBy?.attribute,
              targetAttributeSubpath: this.activeSeries[0].groupBy?.subpath,
              metadata: this.activeSeries[0].groupBy?.allMetadata,
              value: container.textContent,
            },
          },
        ],
        parent: this.injector,
      }),
    );
  }

  private drawIntervalControl(container: ContainerElement, intervalData: CartesianIntervalData): ComponentRef<unknown> {
    return this.injector.get(DynamicComponentService).insertComponent(
      container as Element,
      CartesianIntervalControlComponent,
      Injector.create({
        providers: [
          {
            provide: INTERVAL_DATA,
            useValue: intervalData,
          },
        ],
        parent: this.injector,
      }),
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
            useValue: summaries,
          },
        ],
        parent: this.injector,
      }),
    );
  }

  private disableSelectionMode(): void {
    this.activeSeries = [...this.initialSeries];
    this.isSelectionModeOn = false;
    this.updateLegendClassesAndStyle();
    this.updateResetElementVisibility(!this.isSelectionModeOn);
    this.activeSeriesSubject.next(this.activeSeries);
  }

  private updateActiveSeriesGroup(seriesGroup: LegendEntryData<TData>[]): void {
    const legendEntrySeries = seriesGroup.map(s => s.series);
    if (!this.isSelectionModeOn) {
      this.activeSeries = [...legendEntrySeries];
      this.isSelectionModeOn = true;
    } else if (!this.isThisLegendSeriesGroupActive(legendEntrySeries)) {
      this.activeSeries = this.activeSeries.filter(series => !legendEntrySeries.includes(series));
      this.activeSeries.push(...seriesGroup.map(s => s.series));
    } else {
      this.activeSeries = this.activeSeries.filter(series => !legendEntrySeries.includes(series));
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

interface LegendGroupData<TData> {
  title: string;
  data: LegendEntryData<TData>[];
}

interface LegendEntryData<TData> {
  text: string;
  series: Series<TData>;
}

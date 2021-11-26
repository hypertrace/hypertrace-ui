import { ComponentRef, Injector } from '@angular/core';
import { Color, DynamicComponentService } from '@hypertrace/common';
import { ContainerElement, EnterElement, select, Selection } from 'd3-selection';
import { isNil } from 'lodash';
import { Observable, of, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
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
  private static readonly RESET_CSS_CLASS: string = 'reset';
  private static readonly DEFAULT_CSS_CLASS: string = 'default';
  private static readonly ACTIVE_CSS_CLASS: string = 'active';
  private static readonly INACTIVE_CSS_CLASS: string = 'inactive';
  public static readonly CSS_SELECTOR: string = `.${CartesianLegend.CSS_CLASS}`;

  public readonly activeSeries$: Observable<Series<{}>[]>;
  private readonly activeSeriesSubject: Subject<void> = new Subject();
  private readonly initialSeries: Series<{}>[];
  private readonly groupedSeries: Series<{}>[][];
  private readonly numberOfgroups: number;

  private isDefault: boolean = true;
  private isGrouped: boolean = true;
  private legendElement?: HTMLDivElement;
  private activeSeries: Series<{}>[];
  private intervalControl?: ComponentRef<unknown>;
  private summaryControl?: ComponentRef<unknown>;

  public constructor(
    private readonly series: Series<{}>[],
    private readonly injector: Injector,
    private readonly intervalData?: CartesianIntervalData,
    private readonly summaries: Summary[] = []
  ) {
    // TODO (Sandeep): Create initialization method instead
    this.numberOfgroups =
      this.series.length === 0 || isNil(this.series[0].assignedGroup)
        ? 0
        : this.series[this.series.length - 1].assignedGroup!.id;
    this.isGrouped = this.numberOfgroups !== 0;
    this.groupedSeries = this.getGroupedSeries();

    this.activeSeries = [...this.series];
    this.initialSeries = [...this.series];
    this.activeSeries$ = this.activeSeriesSubject.asObservable().pipe(
      startWith(undefined),
      switchMap(() => of(this.activeSeries))
    );
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
      .on('click', () => this.resetToDefault());

    this.setResetVisibility(this.isDefault);
  }

  private setResetVisibility(isHidden: boolean): void {
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
        .data(this.groupedSeries)
        .enter()
        .append('div')
        .attr('class', seriesGroup => `legend-entries group-${seriesGroup[0].assignedGroup!.id}`)
        .each((seriesGroup, index, elements) => {
          const legendEntriesSelection = select(elements[index]);

          legendEntriesSelection
            .selectAll('.legend-entries-title')
            .data([seriesGroup])
            .enter()
            .append('div')
            .classed('legend-entries-title', true)
            .text(group => `${group[0].assignedGroup!.specName}:`)
            .on('click', () => this.updateActiveSeries(seriesGroup));

          legendEntriesSelection
            .append('div')
            .classed('legend-entry-values', true)
            .selectAll('.legend-entry')
            .data(seriesGroup)
            .enter()
            .each((_, index, elements) => this.drawLegendEntry(elements[index]));
        });
    }
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

  private drawLegendEntry(element: EnterElement): Selection<HTMLDivElement, Series<{}>, null, undefined> {
    const legendEntry = select<EnterElement, Series<{}>>(element).append('div').classed('legend-entry', true);

    this.appendLegendSymbol(legendEntry);
    legendEntry
      .append('span')
      .classed('legend-text', true)
      .text(series => (!this.isGrouped ? series.name : series.assignedGroup!.groupName))
      .on('click', series => this.updateActiveSeries([series]));

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
          this.isThisLegendSeriesGroupActive(seriesGroup as Series<{}>[])
        );

      // Legend entry title
      select(this.legendElement!)
        .selectAll('.legend-entries-title')
        .classed(CartesianLegend.ACTIVE_CSS_CLASS, seriesGroup =>
          this.isThisLegendSeriesGroupActive(seriesGroup as Series<{}>[])
        );
    }

    // Legend entry symbol
    legendElementSelection
      .selectAll('.legend-symbol circle')
      .style('fill', series =>
        !this.isThisLegendEntryActive(series as Series<{}>) ? Color.Gray3 : (series as Series<{}>).color
      );

    // Legend entry value text
    legendElementSelection
      .selectAll('span.legend-text')
      .classed(CartesianLegend.DEFAULT_CSS_CLASS, this.isDefault)
      .classed(
        CartesianLegend.ACTIVE_CSS_CLASS,
        series => !this.isDefault && this.isThisLegendEntryActive(series as Series<{}>)
      )
      .classed(
        CartesianLegend.INACTIVE_CSS_CLASS,
        series => !this.isDefault && !this.isThisLegendEntryActive(series as Series<{}>)
      );
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

  private resetToDefault(): void {
    this.activeSeries = [...this.initialSeries];
    this.isDefault = true;
    this.updateLegendClassesAndStyle();
    this.setResetVisibility(this.isDefault);
    this.activeSeriesSubject.next();
  }

  private getGroupedSeries(): Series<{}>[][] {
    if (!this.isGrouped) {
      return [];
    }

    const nonHiddenSeries = this.series.filter(series => !series.hide);
    const groupedSeries: Series<{}>[][] = [];
    const currentGroup: Series<{}>[] = [];

    nonHiddenSeries.forEach(seriesEntry => {
      if (
        currentGroup.length === 0 ||
        currentGroup[currentGroup.length - 1].assignedGroup!.id === seriesEntry.assignedGroup!.id
      ) {
        currentGroup.push(seriesEntry);
      } else {
        groupedSeries.push([...currentGroup]);
        currentGroup.length = 0;
        currentGroup.push(seriesEntry);
      }
    });
    groupedSeries.push([...currentGroup]);

    return groupedSeries;
  }

  private updateActiveSeries(seriesEntries: Series<{}>[]): void {
    if (this.isDefault) {
      this.activeSeries = [];
      this.activeSeries.push(...seriesEntries);
      this.isDefault = false;
    } else {
      seriesEntries.forEach(seriesEntry => {
        if (this.isThisLegendEntryActive(seriesEntry)) {
          this.activeSeries = this.activeSeries.filter(series => series !== seriesEntry);
        } else {
          this.activeSeries.push(seriesEntry);
        }
      });
    }
    this.updateLegendClassesAndStyle();
    this.setResetVisibility(this.isDefault);
    this.activeSeriesSubject.next();
  }

  private isThisLegendEntryActive(seriesEntry: Series<{}>): boolean {
    return this.activeSeries.includes(seriesEntry);
  }

  private isThisLegendSeriesGroupActive(seriesGroup: Series<{}>[]): boolean {
    return this.isDefault ? false : seriesGroup.every(series => this.activeSeries.includes(series));
  }
}

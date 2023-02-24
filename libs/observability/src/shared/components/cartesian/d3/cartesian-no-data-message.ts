import { selector } from '@hypertrace/common';
import { select } from 'd3-selection';
import { Series } from '../chart';

export class CartesianNoDataMessage {
  public static readonly CSS_CLASS: string = 'no-data-message';
  public static readonly NO_DATA_HIDABLE_CSS_CLASS: string = 'no-data-hidable';

  public constructor(
    private readonly hostElement: Element,
    private readonly series: Series<{}>[],
    private readonly message: string = 'No data to display'
  ) {}

  public updateMessage(): void {
    const hostSelection = select(this.hostElement);

    if (this.seriesContainData()) {
      hostSelection.selectAll(selector(CartesianNoDataMessage.CSS_CLASS)).remove();
      hostSelection.selectAll(selector(CartesianNoDataMessage.NO_DATA_HIDABLE_CSS_CLASS)).classed('hidden', false);
    } else {
      hostSelection.selectAll(selector(CartesianNoDataMessage.NO_DATA_HIDABLE_CSS_CLASS)).classed('hidden', true);
      hostSelection
        .append('text')
        .classed(CartesianNoDataMessage.CSS_CLASS, true)
        .text(this.message)
        .attr('x', '50%')
        .attr('y', '50%');
    }
  }

  private seriesContainData(): boolean {
    return Array.isArray(this.series) && this.series.some(series => series.data.length > 0);
  }
}

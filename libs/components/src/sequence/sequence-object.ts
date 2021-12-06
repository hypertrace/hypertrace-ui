import { SequenceBarRendererService } from './renderer/sequence-bar-renderer.service';
import { SequenceContainerSelection, SequenceOptions, SequenceSegment, SequenceSVGSelection } from './sequence';
import { SequenceChartService } from './sequence-chart.service';

export class SequenceObject {
  private readonly chartSelection: SequenceSVGSelection;
  private destroyed: boolean = false;

  public constructor(
    private readonly containerSelection: SequenceContainerSelection,
    private readonly options: SequenceOptions,
    private readonly sequenceChartService: SequenceChartService,
    private readonly sequenceBarRendererService: SequenceBarRendererService
  ) {
    this.chartSelection = this.containerSelection.select('svg').select('g');
  }

  public destroy(): void {
    // This should also be called when the object is detached from the HTMLElement.
    this.containerSelection.selectAll('svg').remove();
    this.destroyed = true;
  }

  public redraw(): void {
    this.throwIfDestroyed();
    this.sequenceChartService.redraw(this.chartSelection, this.options);
  }

  public setHoveredRow(hovered?: SequenceSegment): void {
    this.options.hovered = hovered;
    this.sequenceBarRendererService.updateDataRowHover(this.chartSelection, this.options);
  }

  public setSelectedRow(selected?: SequenceSegment): void {
    this.options.selected = selected;
    this.sequenceBarRendererService.updateDataRowSelection(this.chartSelection, this.options);
  }

  private throwIfDestroyed(): void {
    if (this.destroyed) {
      throw new Error('This SequenceObject has been destroyed');
    }
  }
}

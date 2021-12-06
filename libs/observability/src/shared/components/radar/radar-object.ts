import { RadarContainerSelection, RadarOptions } from './radar';
import { RadarChartService } from './radar-chart.service';

export class RadarObject {
  private destroyed: boolean = false;

  public constructor(
    private readonly containerSelection: RadarContainerSelection,
    private readonly options: RadarOptions,
    private readonly radarChartService: RadarChartService
  ) {}

  public destroy(): void {
    // This should also be called when the object is detached from the HTMLElement.
    this.containerSelection.selectAll('svg').remove();
    this.destroyed = true;
  }

  public redraw(): void {
    this.throwIfDestroyed();
    this.radarChartService.redraw(this.containerSelection, this.options);
  }

  private throwIfDestroyed(): void {
    if (this.destroyed) {
      throw new Error('This RadarObject has been destroyed');
    }
  }
}

import { Selection } from 'd3-selection';
import { TopologyElementVisibility } from '../../../components/topology/topology';

export class VisibilityUpdater {
  private static readonly DEFAULT_VISIBILITY_MAP: ReadonlyMap<TopologyElementVisibility, string> = new Map([
    [TopologyElementVisibility.Normal, ''],
    [TopologyElementVisibility.Emphasized, 'emphasized'],
    [TopologyElementVisibility.Hidden, 'hidden'],
    [TopologyElementVisibility.Background, 'background'],
    [TopologyElementVisibility.Focused, 'focused']
  ]);
  private readonly allClassesString: string;
  public constructor(
    private readonly visibilityClassMap: ReadonlyMap<
      TopologyElementVisibility,
      string
    > = VisibilityUpdater.DEFAULT_VISIBILITY_MAP
  ) {
    this.allClassesString = Array.from(visibilityClassMap.values()).join(' ');
  }

  public updateVisibility<TElement extends Element>(
    elementSelection: Selection<TElement, unknown, null, undefined>,
    visibility: TopologyElementVisibility
  ): void {
    elementSelection
      .classed(this.allClassesString, false) // Remove all existing
      .classed(this.visibilityClassMap.get(visibility)!, true);
  }
}

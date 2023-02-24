import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { SubscriptionLifecycle, throwIfNil } from '@hypertrace/common';

import { IconSize } from '@hypertrace/components';
import {
  RenderableTopology,
  TopologyConfiguration,
  TopologyDataSpecifier,
  TopologyEdge,
  TopologyNode
} from '../../topology';
import { TopologyStateManager } from './state/topology-state-manager';
import { TopologyZoom } from './zoom/topology-zoom';

export const TOPOLOGY_INTERACTION_CONTROL_DATA = new InjectionToken<TopologyInteractionControlData>(
  'TOPOLOGY_INTERACTION_CONTROL_DATA'
);

@Component({
  selector: 'ht-topology-interaction-control',
  styleUrls: ['./topology-interaction-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  template: `
    <div class="control-container">
      <button (click)="this.runLayout()" class="topology-control topology-button">
        <ht-icon
          icon="${IconType.Refresh}"
          [size]="this.iconSize"
          label="Relayout"
          [showTooltip]="true"
          class="control-icon"
        ></ht-icon>
      </button>
      <ng-container *ngIf="this.canZoom()">
        <button (click)="this.zoomToFit()" class="topology-control topology-button">
          <ht-icon
            icon="${IconType.ZoomToFit}"
            [size]="this.iconSize"
            label="Zoom to fit"
            [showTooltip]="true"
            class="control-icon"
          ></ht-icon>
        </button>
        <div class="topology-control zoom-control">
          <button (click)="this.decrementZoom()" [disabled]="!this.canDecrement" class="topology-button">
            <ht-icon
              icon="${IconType.Remove}"
              [size]="this.iconSize"
              label="Decrease Zoom"
              [showTooltip]="true"
              class="control-icon"
            ></ht-icon>
          </button>
          <button (click)="this.incrementZoom()" [disabled]="!this.canIncrement" class="topology-button">
            <ht-icon
              icon="${IconType.Add}"
              [size]="this.iconSize"
              label="Increase Zoom"
              [showTooltip]="true"
              class="control-icon"
            ></ht-icon>
          </button>

          <span class="zoom-percentage"> {{ this.currentZoomPercentage }}%</span>
        </div>
      </ng-container>
    </div>
  `
})
export class TopologyInteractionControlComponent implements OnInit {
  public currentZoomPercentage: string = '100';
  public canIncrement: boolean = true;
  public canDecrement: boolean = true;
  public readonly iconSize: IconSize = IconSize.Small;
  public readonly edgeDataSpecifiers: TopologyDataSpecifier[];
  public readonly nodeDataSpecifiers: TopologyDataSpecifier[];
  public get selectedEdgeDataSpecifier(): TopologyDataSpecifier | undefined {
    return this.interactionControlData.stateManager.getSelectedEdgeDataSpecifier();
  }
  public set selectedEdgeDataSpecifier(value: TopologyDataSpecifier | undefined) {
    this.interactionControlData.stateManager.setSelectedEdgeDataSpecifier(value);
  }

  public get selectedNodeDataSpecifier(): TopologyDataSpecifier | undefined {
    return this.interactionControlData.stateManager.getSelectedNodeDataSpecifier();
  }
  public set selectedNodeDataSpecifier(value: TopologyDataSpecifier | undefined) {
    this.interactionControlData.stateManager.setSelectedNodeDataSpecifier(value);
  }

  public constructor(
    changeDetector: ChangeDetectorRef,
    subscriptionLifecycle: SubscriptionLifecycle,
    @Inject(TOPOLOGY_INTERACTION_CONTROL_DATA) private readonly interactionControlData: TopologyInteractionControlData
  ) {
    if (this.interactionControlData.zoom) {
      const zoom = this.interactionControlData.zoom;
      subscriptionLifecycle.add(
        zoom.zoomChange$.subscribe(newZoom => {
          this.currentZoomPercentage = (newZoom * 100).toFixed();
          this.canIncrement = zoom.canIncreaseScale();
          this.canDecrement = zoom.canDecreaseScale();
          changeDetector.markForCheck();
        })
      );
    }

    this.edgeDataSpecifiers = interactionControlData.topologyConfig.edgeDataSpecifiers;
    this.nodeDataSpecifiers = interactionControlData.topologyConfig.nodeDataSpecifiers;
  }

  public ngOnInit(): void {
    if (this.interactionControlData.topologyConfig.shouldAutoZoomToFit) {
      this.zoomToFit();
    }
  }

  // TODO should make the increments logarithmic
  public incrementZoom(): void {
    this.getZoomOrThrow().setZoomScale(this.getZoomOrThrow().getZoomScale() + 0.1);
  }

  public decrementZoom(): void {
    this.getZoomOrThrow().setZoomScale(this.getZoomOrThrow().getZoomScale() - 0.1);
  }

  public zoomToFit(): void {
    this.getZoomOrThrow().zoomToFit(this.interactionControlData.currentTopology().nodes);
  }

  public runLayout(): void {
    this.interactionControlData.layout();
    this.panToTopLeft();
  }

  public canZoom(): boolean {
    return !!this.interactionControlData.zoom;
  }

  private getZoomOrThrow(): TopologyZoom {
    return throwIfNil<TopologyZoom>(this.interactionControlData.zoom);
  }

  private panToTopLeft(): void {
    this.getZoomOrThrow().panToTopLeft(this.interactionControlData.currentTopology().nodes);
  }
}

export interface TopologyInteractionControlData<
  TContainer extends Element = Element,
  TZoomTarget extends Element = Element
> {
  stateManager: TopologyStateManager;
  topologyConfig: TopologyConfiguration;
  layout(): void;
  currentTopology(): RenderableTopology<TopologyNode, TopologyEdge>;
  zoom?: TopologyZoom<TContainer, TZoomTarget>;
}

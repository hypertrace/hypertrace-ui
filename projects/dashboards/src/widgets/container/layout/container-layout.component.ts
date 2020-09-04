import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, InjectionToken } from '@angular/core';
import { ContainerLayoutData } from './container-layout';

export const CONTAINER_LAYOUT = new InjectionToken<ContainerLayoutData>('CONTAINER_LAYOUT');

@Component({
  selector: 'ht-grid-container-layout-container',
  styleUrls: ['./container-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [gdColumns]="layout.columns" [gdRows]="layout.rows" [gdGap]="layout.gap" class="fill-container">
      <div
        *ngFor="let child of layout.children; let index = index"
        [gdArea]="child.areaSpan"
        [ngClass]="{ 'container-child': layout.enableStyle }"
      >
        <ng-container [hdaDashboardModel]="child.model"> </ng-container>
      </div>
    </div>
  `
})
export class ContainerLayoutComponent {
  public constructor(
    @Inject(CONTAINER_LAYOUT) public readonly layout: ContainerLayoutData,
    changeDetector: ChangeDetectorRef
  ) {
    setTimeout(() => changeDetector.markForCheck());
  }
}

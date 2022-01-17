import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'ht-skeleton',
  template: `
    <ng-container *ngFor="let k of this.numberOfIterations">
      <ng-container [ngSwitch]="this.shapeStyle">
        <div *ngSwitchCase="'${SkeletonType.RectangleText}'" [ngClass]="this.containerClass"></div>
        <div *ngSwitchCase="'${SkeletonType.Circle}'" [ngClass]="this.containerClass"></div>
        <div *ngSwitchCase="'${SkeletonType.Square}'" [ngClass]="this.containerClass"></div>
        <div *ngSwitchCase="'${SkeletonType.TableRow}'" [ngClass]="this.containerClass"></div>
        <div *ngSwitchCase="'${SkeletonType.Donut}'" [ngClass]="this.containerClass">
          <div class="donut-inner"></div>
        </div>
        <div *ngSwitchCase="'${SkeletonType.ListItem}'" [ngClass]="this.containerClass">
          <div class="item-circle"></div>
          <div class="item-column">
            <div class="item-line"></div>
            <div class="item-line"></div>
          </div>
        </div>
        <div *ngSwitchDefault class="skeleton skeleton-rectangle"></div>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnChanges {
  @Input()
  public shapeStyle: SkeletonType = SkeletonType.Rectangle;

  @Input()
  public repeat: number | undefined = 1;

  public numberOfIterations: number[] = Array(1).fill(1);

  public containerClass: ContainerClass;

  public constructor() {
    this.containerClass = this.getContainerClass();
  }

  public ngOnChanges(): void {
    this.numberOfIterations = Array(this.repeat).fill(1);

    this.containerClass = this.getContainerClass();
  }

  public getContainerClass(): ContainerClass {
    return {
      skeleton: true,
      'skeleton-rectangle': this.shapeStyle === SkeletonType.Rectangle,
      'skeleton-square': this.shapeStyle === SkeletonType.Square,
      'skeleton-circle': this.shapeStyle === SkeletonType.Circle,
      'skeleton-rectangle-text': this.shapeStyle === SkeletonType.RectangleText,
      'skeleton-table-row': this.shapeStyle === SkeletonType.TableRow,
      'skeleton-list-item': this.shapeStyle === SkeletonType.ListItem,
      'skeleton-donut': this.shapeStyle === SkeletonType.Donut,
      'skeleton-repeating': this.repeat !== undefined && this.repeat > 1
    };
  }
}

interface ContainerClass {
  skeleton: boolean;
  'skeleton-rectangle': boolean;
  'skeleton-square': boolean;
  'skeleton-circle': boolean;
  'skeleton-rectangle-text': boolean;
  'skeleton-table-row': boolean;
  'skeleton-list-item': boolean;
  'skeleton-repeating': boolean;
  'skeleton-donut': boolean;
}

export const enum SkeletonType {
  Rectangle = 'rectangle',
  RectangleText = 'rectangle-text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item',
  Donut = 'donut'
}

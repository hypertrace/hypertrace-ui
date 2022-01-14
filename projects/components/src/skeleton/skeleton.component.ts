import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface ContainerClass {
  skeleton: boolean;
  'skeleton-rectangle': boolean;
  'skeleton-square': boolean;
  'skeleton-circle': boolean;
  'skeleton-rectangle-text': boolean;
  'skeleton-table-row': boolean;
  'skeleton-list-item': boolean;
  'skeleton-repeating': boolean;
}

export const enum SkeletonType {
  Rectangle = 'rectangle',
  RectangleText = 'rectangle-text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item'
}

@Component({
  selector: 'ht-skeleton',
  template: `
    <ng-container *ngFor="let k of [].constructor(this.repeat)">
      <ng-container [ngSwitch]="this.shapeStyle">
        <div *ngSwitchCase="'${SkeletonType.RectangleText}'" [ngClass]="containerClass()"></div>
        <div *ngSwitchCase="'${SkeletonType.Circle}'" [ngClass]="containerClass()"></div>
        <div *ngSwitchCase="'${SkeletonType.Square}'" [ngClass]="containerClass()"></div>
        <div *ngSwitchCase="'${SkeletonType.TableRow}'" [ngClass]="containerClass()"></div>
        <div *ngSwitchCase="'${SkeletonType.ListItem}'" [ngClass]="containerClass()">
          <div class="item-circle"></div>
          <div class="item-column">
            <div class="line-one"></div>
            <div class="line-two"></div>
          </div>
        </div>
        <div *ngSwitchDefault class="skeleton skeleton-rectangle"></div>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() public shapeStyle: SkeletonType = SkeletonType.Rectangle;

  @Input() public repeat: number = 1;

  @Input() public size: string = '';

  public containerClass(): ContainerClass {
    return {
      skeleton: true,
      'skeleton-rectangle': this.shapeStyle === 'rectangle',
      'skeleton-square': this.shapeStyle === 'square',
      'skeleton-circle': this.shapeStyle === 'circle',
      'skeleton-rectangle-text': this.shapeStyle === 'rectangle-text',
      'skeleton-table-row': this.shapeStyle === 'table-row',
      'skeleton-list-item': this.shapeStyle === 'list-item',
      'skeleton-repeating': this.repeat > 1
    };
  }
}

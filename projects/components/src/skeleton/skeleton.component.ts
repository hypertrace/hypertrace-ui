import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'ht-skeleton',
  template: `
    <ng-container *ngFor="let k of this.iterationsArray">
      <ng-container [ngSwitch]="this.shapeStyle">
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
        <div *ngSwitchDefault [ngClass]="this.containerClass"></div>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnChanges {
  @Input()
  public shapeStyle: SkeletonType = SkeletonType.Rectangle;

  public iterationsArray: number[] = Array(1).fill(1);

  public containerClass: string[];

  public constructor() {
    this.containerClass = this.getContainerClass();
  }

  public ngOnChanges(): void {
    this.iterationsArray = this.getIterationsArray();

    this.containerClass = this.getContainerClass();
  }

  public getIterationsArray(): number[] {
    switch (this.shapeStyle) {
      case SkeletonType.TableRow:
        return Array(5).fill(1);
      case SkeletonType.ListItem:
        return Array(4).fill(1);
      default:
        return Array(1).fill(1);
    }
  }

  public getContainerClass(): string[] {
    const classes = ['skeleton', this.shapeStyle];

    if (this.shapeStyle === SkeletonType.TableRow || this.shapeStyle === SkeletonType.ListItem) {
      classes.push('repeating');
    }

    return classes;
  }
}

export const enum SkeletonType {
  Rectangle = 'rectangle',
  Text = 'text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item',
  Donut = 'donut'
}

import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'ht-skeleton',
  template: `
    <ng-container *ngFor="let k of this.iterationsArray">
      <ng-container [ngSwitch]="this.skeletonType">
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
  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public iterationsArray: number[] = Array(1).fill(1);

  public containerClass: string[];

  private static readonly SKELETON_CLASS_NAME: string = 'skeleton';

  private static readonly REPEATING_CLASS_NAME: string = 'repeating';

  public constructor() {
    this.containerClass = this.getContainerClass();
  }

  public ngOnChanges(): void {
    this.iterationsArray = this.getIterationsArray();

    this.containerClass = this.getContainerClass();
  }

  public getIterationsArray(): number[] {
    switch (this.skeletonType) {
      case SkeletonType.TableRow:
        return Array(5).fill(1);
      case SkeletonType.ListItem:
        return Array(4).fill(1);
      default:
        return Array(1).fill(1);
    }
  }

  public getContainerClass(): string[] {
    const classes = [SkeletonComponent.SKELETON_CLASS_NAME, this.skeletonType];

    if (this.skeletonType === SkeletonType.TableRow || this.skeletonType === SkeletonType.ListItem) {
      classes.push(SkeletonComponent.REPEATING_CLASS_NAME);
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

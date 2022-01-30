import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { IconSize } from '../icon/icon-size';

@Component({
  selector: 'ht-skeleton',
  template: `
    <ng-container *ngFor="let k of this.iterationsArray">
      <ng-container *ngIf="!isIcon; else iconSkeletonTemplate" [ngSwitch]="this.skeletonType">
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

      <ng-template #iconSkeletonTemplate>
        <div class="icon-container">
          <ht-icon [icon]="this.iconType" size="${IconSize.Inherit}" [ngClass]="this.skeletonType"></ht-icon>
        </div>
      </ng-template>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnChanges {
  private static readonly SKELETON_CLASS_NAME: string = 'skeleton';
  private static readonly REPEATING_CLASS_NAME: string = 'repeating';

  @Input()
  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public iterationsArray: number[] = Array(1).fill(1);

  public containerClass: string[];

  public isIcon: boolean = false;

  public iconType: IconType = IconType.Logo;

  public constructor() {
    this.containerClass = this.getContainerClass();
  }

  public ngOnChanges(): void {
    this.iterationsArray = this.getIterationsArray();

    this.containerClass = this.getContainerClass();

    this.isIcon = this.determineIfIcon(this.skeletonType);

    if (this.isIcon) {
      this.iconType = this.getIconTypeForSkeleton(this.skeletonType);
    }
  }

  public getIconTypeForSkeleton(skeletonType: SkeletonType): IconType {
    switch (skeletonType) {
      case SkeletonType.Cartesian:
        return IconType.Cartesian;
      case SkeletonType.CartesianColumn:
        return IconType.CartesianColumn;
      case SkeletonType.Radar:
        return IconType.Radar;
      case SkeletonType.Topology:
        return IconType.Topology;
      case SkeletonType.Logo:
      case SkeletonType.ListItem:
      case SkeletonType.Circle:
      case SkeletonType.Donut:
      case SkeletonType.Rectangle:
      case SkeletonType.Square:
      case SkeletonType.TableRow:
      case SkeletonType.Text:
        return IconType.Logo;
      default:
        return assertUnreachable(skeletonType);
    }
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

  public determineIfIcon(skeletonType: SkeletonType): boolean {
    switch (skeletonType) {
      case SkeletonType.Logo:
      case SkeletonType.Radar:
      case SkeletonType.Topology:
      case SkeletonType.Cartesian:
      case SkeletonType.CartesianColumn:
        return true;
      case SkeletonType.Circle:
      case SkeletonType.Text:
      case SkeletonType.ListItem:
      case SkeletonType.Rectangle:
      case SkeletonType.Square:
      case SkeletonType.TableRow:
      case SkeletonType.Donut:
        return false;
      default:
        return assertUnreachable(skeletonType);
    }
  }
}

export const enum SkeletonType {
  Rectangle = 'rectangle',
  Text = 'text',
  Square = 'square',
  Circle = 'circle',
  TableRow = 'table-row',
  ListItem = 'list-item',
  Donut = 'donut',
  Logo = 'logo',
  Cartesian = 'cartesian',
  CartesianColumn = 'cartesian-column',
  Radar = 'radar',
  Topology = 'topology'
}

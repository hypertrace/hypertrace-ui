import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { SkeletonType } from '../../skeleton/skeleton.component';
import { LoaderType } from '../load-async.service';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader" [ngClass]="{ 'flex-centered': this.oldLoaderType() }">
      <ng-container *ngIf="!this.oldLoaderType(); else oldLoader">
        <ht-skeleton [shapeStyle]="this.skeletonType" [repeat]="this.repeatLoaderCount"></ht-skeleton>
      </ng-container>

      <ng-template #oldLoader>
        <img [ngClass]="[this.currentLoaderType]" [src]="this.getImagePathFromType(this.currentLoaderType)" />
      </ng-template>
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType;

  @Input()
  public repeatLoaderCount?: number;

  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public currentLoaderType: LoaderType = LoaderType.Spinner;

  public ngOnChanges(): void {
    this.currentLoaderType = this.loaderType ?? LoaderType.Spinner;

    this.skeletonType = this.loaderToSkeletonTypeMap(this.currentLoaderType);
  }

  public getImagePathFromType(loaderType: LoaderType): ImagesAssetPath {
    switch (loaderType) {
      case LoaderType.ExpandableRow:
        return ImagesAssetPath.LoaderExpandableRow;
      case LoaderType.Page:
        return ImagesAssetPath.LoaderPage;
      case LoaderType.Spinner:
      default:
        return ImagesAssetPath.LoaderSpinner;
    }
  }

  public loaderToSkeletonTypeMap(curLoaderType: LoaderType): SkeletonType {
    switch (curLoaderType) {
      case LoaderType.RectangleText:
        return SkeletonType.RectangleText;
      case LoaderType.Circle:
        return SkeletonType.Circle;
      case LoaderType.Square:
        return SkeletonType.Square;
      case LoaderType.TableRow:
        return SkeletonType.TableRow;
      case LoaderType.ListItem:
        return SkeletonType.ListItem;
      default:
        return SkeletonType.Rectangle;
    }
  }

  public oldLoaderType(): boolean {
    return (
      this.currentLoaderType === LoaderType.ExpandableRow ||
      this.currentLoaderType === LoaderType.Spinner ||
      this.currentLoaderType === LoaderType.Page
    );
  }
}

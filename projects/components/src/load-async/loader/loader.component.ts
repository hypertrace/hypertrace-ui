import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { SkeletonType } from '../../skeleton/skeleton.component';
import { LoaderType } from '../load-async.service';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader" [ngClass]="{ 'flex-centered': this.isOldLoaderType }">
      <ng-container *ngIf="!this.isOldLoaderType; else oldLoaderTemplate">
        <ht-skeleton [shapeStyle]="this.skeletonType" [repeat]="this.repeatCount"></ht-skeleton>
      </ng-container>

      <ng-template #oldLoaderTemplate>
        <img [ngClass]="[this.currentLoaderType]" [src]="this.imagePath" />
      </ng-template>
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType;

  @Input()
  public repeatCount?: number;

  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public currentLoaderType: LoaderType = LoaderType.Spinner;

  public imagePath: ImagesAssetPath = ImagesAssetPath.LoaderSpinner;

  public isOldLoaderType: boolean = true;

  public ngOnChanges(): void {
    this.currentLoaderType = this.loaderType ?? LoaderType.Spinner;

    if (
      this.currentLoaderType === LoaderType.ExpandableRow ||
      this.currentLoaderType === LoaderType.Spinner ||
      this.currentLoaderType === LoaderType.Page
    ) {
      this.isOldLoaderType = true;
      this.imagePath = this.getImagePathFromType(this.currentLoaderType);
    } else {
      this.skeletonType = this.getSkeletonTypeForLoader(this.currentLoaderType);
      this.isOldLoaderType = false;
    }
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

  public getSkeletonTypeForLoader(curLoaderType: LoaderType): SkeletonType {
    switch (curLoaderType) {
      case LoaderType.Text:
        return SkeletonType.Text;
      case LoaderType.Circle:
        return SkeletonType.Circle;
      case LoaderType.Square:
        return SkeletonType.Square;
      case LoaderType.TableRow:
        return SkeletonType.TableRow;
      case LoaderType.ListItem:
        return SkeletonType.ListItem;
      case LoaderType.Donut:
        return SkeletonType.Donut;
      default:
        return SkeletonType.Rectangle;
    }
  }
}

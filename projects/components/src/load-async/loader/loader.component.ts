import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { assertUnreachable } from '@hypertrace/common';
import { SkeletonType } from '../../skeleton/skeleton.component';
import { LoaderType } from '../load-async.service';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader" [ngClass]="{ 'flex-centered': this.isOldLoaderType }">
      <ng-container *ngIf="!this.isOldLoaderType; else oldLoaderTemplate">
        <ht-skeleton [skeletonType]="this.skeletonType"></ht-skeleton>
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

  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public currentLoaderType: LoaderType = LoaderType.Spinner;

  public imagePath: ImagesAssetPath = ImagesAssetPath.LoaderSpinner;

  public isOldLoaderType: boolean = true;

  public ngOnChanges(): void {
    this.currentLoaderType = this.loaderType ?? LoaderType.Spinner;

    if (this.determineIfOldLoaderType(this.currentLoaderType)) {
      this.isOldLoaderType = true;
      this.imagePath = this.getImagePathFromType(this.currentLoaderType);
    } else {
      this.isOldLoaderType = false;
      this.skeletonType = this.getSkeletonTypeForLoader(this.currentLoaderType);
    }
  }

  public determineIfOldLoaderType(loaderType: LoaderType): boolean {
    switch (loaderType) {
      case LoaderType.Spinner:
      case LoaderType.ExpandableRow:
      case LoaderType.Page:
        return true;
      case LoaderType.Circle:
      case LoaderType.Text:
      case LoaderType.ListItem:
      case LoaderType.Rectangle:
      case LoaderType.Square:
      case LoaderType.TableRow:
      case LoaderType.Donut:
        return false;
      default:
        return assertUnreachable(loaderType);
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

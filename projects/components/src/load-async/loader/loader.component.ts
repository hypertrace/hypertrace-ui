import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { assertUnreachable, TypedSimpleChanges } from '@hypertrace/common';
import { SkeletonType } from '../../skeleton/skeleton.component';
import { LoaderType } from '../load-async.service';

@Component({
  selector: 'ht-loader',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-loader">
      <ht-skeleton [skeletonType]="this.skeletonType"></ht-skeleton>
    </div>
  `
})
export class LoaderComponent implements OnChanges {
  @Input()
  public loaderType?: LoaderType = LoaderType.Rectangle;

  public skeletonType: SkeletonType = SkeletonType.Rectangle;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.loaderType) {
      this.skeletonType = this.getSkeletonTypeForLoader(this.loaderType);
    }
  }

  public getSkeletonTypeForLoader(curLoaderType: LoaderType | undefined): SkeletonType {
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
      case LoaderType.Logo:
        return SkeletonType.Logo;
      case LoaderType.CartesianColumn:
        return SkeletonType.CartesianColumn;
      case LoaderType.Cartesian:
        return SkeletonType.Cartesian;
      case LoaderType.Radar:
        return SkeletonType.Radar;
      case LoaderType.Topology:
        return SkeletonType.Topology;
      case LoaderType.None:
        return SkeletonType.None;
      case LoaderType.Rectangle:
      case undefined:
        return SkeletonType.Rectangle;
      default:
        return assertUnreachable(curLoaderType);
    }
  }
}

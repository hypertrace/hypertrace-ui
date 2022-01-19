import { CommonModule } from '@angular/common';
import { ImagesAssetPath } from '@hypertrace/assets-library';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SkeletonComponent, SkeletonType } from '../../skeleton/skeleton.component';
import { LoaderType } from '../load-async.service';
import { LoaderComponent } from './loader.component';

describe('Loader component', () => {
  let spectator: SpectatorHost<LoaderComponent>;

  const createHost = createHostFactory({
    component: LoaderComponent,
    declarations: [MockComponent(SkeletonComponent)],
    imports: [CommonModule]
  });

  test('Loader component when loader type is page', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Page}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).toHaveClass('flex-centered');
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Page);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderPage);
  });

  test('Loader component when loader type is not passed', () => {
    spectator = createHost(`<ht-loader></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).toHaveClass('flex-centered');
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Spinner);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderSpinner);
  });

  test('Loader component when loader type is spinner', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Spinner}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).toHaveClass('flex-centered');
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.Spinner);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderSpinner);
  });

  test('Loader component loader type is expandable row', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.ExpandableRow}'"></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).toHaveClass('flex-centered');
    expect(spectator.query('.ht-loader img')).toExist();
    expect(spectator.query('.ht-loader img')).toHaveClass(LoaderType.ExpandableRow);
    expect(spectator.query('.ht-loader img')).toHaveAttribute('src', ImagesAssetPath.LoaderExpandableRow);
  });

  test('Should use old loader type by default', () => {
    spectator = createHost(`<ht-loader></ht-loader>`);

    expect(spectator.component.isOldLoaderType).toBe(true);
    expect(spectator.query(SkeletonComponent)).not.toExist();
  });

  test('Should use corresponding skeleton component for loader type rectangle', () => {
    spectator = createHost(
      `<ht-loader [loaderType]="'${LoaderType.Rectangle}'" [repeatCount]="repeatCount"></ht-loader>`,
      {
        hostProps: {
          repeatCount: 1
        }
      }
    );

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.Rectangle);
    expect(skeletonComponent?.repeat).toEqual(1);
  });

  test('Should use corresponding skeleton component for loader type rectangle text', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Text}'" [repeatCount]="repeatCount"></ht-loader>`, {
      hostProps: {
        repeatCount: 1
      }
    });

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.Text);
    expect(skeletonComponent?.repeat).toEqual(1);
  });

  test('Should use corresponding skeleton component for loader type circle', () => {
    spectator = createHost(
      `<ht-loader [loaderType]="'${LoaderType.Circle}'" [repeatCount]="repeatCount"></ht-loader>`,
      {
        hostProps: {
          repeatCount: 1
        }
      }
    );

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.Circle);
    expect(skeletonComponent?.repeat).toEqual(1);
  });

  test('Should use corresponding skeleton component for loader type square', () => {
    spectator = createHost(
      `<ht-loader [loaderType]="'${LoaderType.Square}'" [repeatCount]="repeatCount"></ht-loader>`,
      {
        hostProps: {
          repeatCount: 1
        }
      }
    );

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.Square);
    expect(skeletonComponent?.repeat).toEqual(1);
  });

  test('Should use corresponding skeleton component for loader type table row', () => {
    spectator = createHost(
      `<ht-loader [loaderType]="'${LoaderType.TableRow}'" [repeatCount]="repeatCount"></ht-loader>`,
      {
        hostProps: {
          repeatCount: 4
        }
      }
    );

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.TableRow);
    expect(skeletonComponent?.repeat).toEqual(4);
  });

  test('Should use corresponding skeleton component for loader type donut', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Donut}'" [repeatCount]="repeatCount"></ht-loader>`, {
      hostProps: {
        repeatCount: 1
      }
    });

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.Donut);
    expect(skeletonComponent?.repeat).toEqual(1);
  });

  test('Should use corresponding skeleton component for loader type list item', () => {
    spectator = createHost(
      `<ht-loader [loaderType]="'${LoaderType.ListItem}'" [repeatCount]="repeatCount"></ht-loader>`,
      {
        hostProps: {
          repeatCount: 1
        }
      }
    );

    expect(spectator.query('.ht-loader')).toExist();
    expect(spectator.query('.ht-loader')).not.toHaveClass('flex-centered');

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('shapeStyle', SkeletonType.ListItem);
    expect(skeletonComponent?.repeat).toEqual(1);
  });
});

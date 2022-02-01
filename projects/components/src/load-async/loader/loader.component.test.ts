import { CommonModule } from '@angular/common';
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

  test('Should use corresponding skeleton component for loader type rectangle', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Rectangle}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Rectangle);
  });

  test('Should use corresponding skeleton component for loader type rectangle text', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Text}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Text);
  });

  test('Should use corresponding skeleton component for loader type circle', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Circle}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Circle);
  });

  test('Should use corresponding skeleton component for loader type square', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Square}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Square);
  });

  test('Should use corresponding skeleton component for loader type table row', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.TableRow}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.TableRow);
  });

  test('Should use corresponding skeleton component for loader type donut', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Donut}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Donut);
  });

  test('Should use corresponding skeleton component for loader type list item', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.ListItem}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.ListItem);
  });

  test('Should use corresponding skeleton component for loader type cartesian', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Cartesian}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Cartesian);
  });

  test('Should use corresponding skeleton component for loader type cartesian column ', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.CartesianColumn}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.CartesianColumn);
  });

  test('Should use corresponding skeleton component for loader type page ', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Page}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Page);
  });

  test('Should use corresponding skeleton component for loader type none ', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.None}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.None);
  });

  test('Should use corresponding skeleton component for loader type radar ', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Radar}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Radar);
  });

  test('Should use corresponding skeleton component for loader type topology ', () => {
    spectator = createHost(`<ht-loader [loaderType]="'${LoaderType.Topology}'" ></ht-loader>`);

    expect(spectator.query('.ht-loader')).toExist();

    const skeletonComponent = spectator.query(SkeletonComponent);
    expect(skeletonComponent).toExist();
    expect(skeletonComponent).toHaveAttribute('skeletonType', SkeletonType.Topology);
  });
});

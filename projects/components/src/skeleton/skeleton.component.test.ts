import { IconType } from '@hypertrace/assets-library';
import { IconComponent } from '@hypertrace/components';
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { SkeletonComponent, SkeletonType } from './skeleton.component';

describe('Skeleton Component', () => {
  const createHost = createHostFactory<SkeletonComponent>({
    declarations: [MockComponent(IconComponent)],
    component: SkeletonComponent
  });

  let spectator: SpectatorHost<SkeletonComponent>;

  test('Should only be one skeleton element by default', () => {
    spectator = createHost(`<ht-skeleton></ht-skeleton>`);

    expect(spectator.query('.skeleton.rectangle')).toExist();
    expect(spectator.query('.repeating')).not.toExist();
    expect(spectator.queryAll('.skeleton.rectangle').length).toEqual(1);
  });

  test('Should display number of skeleton elements equal to the repeat input', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.ListItem}'" ></ht-skeleton>`);

    expect(spectator.query('.skeleton.list-item')).toExist();
    expect(spectator.query('.skeleton .item-circle')).toExist();
    expect(spectator.queryAll('.skeleton.repeating')).toHaveLength(4);
  });

  test('Should match non icon skeleton types to the corresponding element', () => {
    const skeletonInputData: { type: SkeletonType; expectedRepeat: number }[] = [
      {
        type: SkeletonType.Donut,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Text,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Rectangle,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.Circle,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.TableRow,
        expectedRepeat: 5
      },
      {
        type: SkeletonType.Square,
        expectedRepeat: 1
      },
      {
        type: SkeletonType.ListItem,
        expectedRepeat: 4
      }
    ];
    spectator = createHost(`<ht-skeleton [skeletonType]="skeletonType"></ht-skeleton>`, {
      hostProps: {
        skeletonType: SkeletonType.Donut
      }
    });

    skeletonInputData.forEach(testConfig => {
      spectator.setHostInput({ skeletonType: testConfig.type });

      const shapeContainerClass = `.${testConfig.type}`;
      expect(spectator.query(shapeContainerClass)).toExist();
      expect(spectator.queryAll(shapeContainerClass)).toHaveLength(testConfig.expectedRepeat);
    });
  });

  test('Should display ht-icon component for logo skeleton', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.Logo}'"></ht-skeleton>`);

    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query('.skeleton')).not.toExist();
    expect(spectator.query(IconComponent)).toHaveAttribute('icon', IconType.Logo);
  });

  test('Should display ht-icon component for cartesian skeleton', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.Cartesian}'"></ht-skeleton>`);

    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query('.skeleton')).not.toExist();
    expect(spectator.query(IconComponent)).toHaveAttribute('icon', IconType.Cartesian);
  });

  test('Should display ht-icon component for cartesian column skeleton', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.CartesianColumn}'"></ht-skeleton>`);

    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query('.skeleton')).not.toExist();
    expect(spectator.query(IconComponent)).toHaveAttribute('icon', IconType.CartesianColumn);
  });

  test('Should display ht-icon component for radar skeleton', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.Radar}'"></ht-skeleton>`);

    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query('.skeleton')).not.toExist();
    expect(spectator.query(IconComponent)).toHaveAttribute('icon', IconType.Radar);
  });

  test('Should display ht-icon component for topology skeleton', () => {
    spectator = createHost(`<ht-skeleton [skeletonType]="'${SkeletonType.Topology}'"></ht-skeleton>`);

    expect(spectator.query(IconComponent)).toExist();
    expect(spectator.query('.skeleton')).not.toExist();
    expect(spectator.query(IconComponent)).toHaveAttribute('icon', IconType.Topology);
  });
});

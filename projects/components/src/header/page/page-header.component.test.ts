import { BreadcrumbsService, PageHeaderComponent } from '@hypertrace/components';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

describe('Page Header Component', () => {
  let spectator: Spectator<PageHeaderComponent>;

  const createHost = createHostFactory({
    component: PageHeaderComponent,
    shallow: true,
    providers: [
      mockProvider(BreadcrumbsService, {
        breadcrumbs$: of([
          {
            label: 'I am Breadcrumb'
          }
        ])
      })
    ]
  });

  test('should display beta tag', () => {
    spectator = createHost('<htc-page-header isBeta="true"></htc-page-header>');
    expect(spectator.query('.beta')).toExist();
  });

  test('should not display beta tag by default', () => {
    spectator = createHost('<htc-page-header></htc-page-header>');
    expect(spectator.query('.beta')).not.toExist();
  });
});

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModelJson } from '@hypertrace/hyperdash';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="vertical-flex-layout">
      <ht-page-header></ht-page-header>
      <ht-navigable-dashboard [navLocation]="this.location" [defaultJson]="this.defaultJson"> </ht-navigable-dashboard>
    </div>
  `
})
// tslint:disable:max-file-line-count
export class ApiDashboardComponent {
  public readonly location: string = 'API_DASHBOARD';
  public readonly defaultJson: ModelJson = {
    type: 'container-widget',
    layout: {
      type: 'custom-container-layout',
      'enable-style': false,
      'column-dimensions': [
        {
          type: 'dimension-model',
          dimension: 1,
          unit: 'FR'
        }
      ],
      'row-dimensions': [
        {
          type: 'dimension-model',
          dimension: 96,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 352,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 492,
          unit: 'PX'
        },
        {
          type: 'dimension-model',
          dimension: 512,
          unit: 'PX'
        }
      ],
      'cell-spans': [
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 0,
          'row-end': 1
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 1,
          'row-end': 2
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 2,
          'row-end': 3
        },
        {
          type: 'cell-span-model',
          'col-start': 0,
          'col-end': 1,
          'row-start': 3,
          'row-end': 4
        }
      ]
    },
    children: [
      {
        type: 'container-widget',
        layout: {
          type: 'auto-container-layout',
          'enable-style': false
        }
      },
      {
        type: 'container-widget',
        layout: {
          type: 'auto-container-layout',
          'enable-style': false
        }
      },
      {
        type: 'container-widget',
        layout: {
          type: 'custom-container-layout',
          'enable-style': false,
          'column-dimensions': [
            {
              type: 'dimension-model',
              dimension: 1,
              unit: 'FR'
            },
            {
              type: 'dimension-model',
              dimension: 1,
              unit: 'FR'
            }
          ],
          'row-dimensions': [
            {
              type: 'dimension-model',
              dimension: 1,
              unit: 'FR'
            }
          ],
          'cell-spans': [
            {
              type: 'cell-span-model',
              'col-start': 0,
              'col-end': 1,
              'row-start': 0,
              'row-end': 1
            },
            {
              type: 'cell-span-model',
              'col-start': 1,
              'col-end': 2,
              'row-start': 0,
              'row-end': 1
            }
          ]
        },
        children: [
          {
            type: 'container-widget',
            layout: {
              type: 'auto-container-layout',
              'enable-style': false
            }
          },
          {
            type: 'container-widget',
            layout: {
              type: 'auto-container-layout',
              'enable-style': false
            }
          }
        ]
      },
      {
        type: 'container-widget',
        layout: {
          type: 'auto-container-layout',
          'enable-style': false
        }
      }
    ]
  };
}

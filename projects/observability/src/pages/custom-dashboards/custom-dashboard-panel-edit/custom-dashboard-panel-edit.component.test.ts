import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { NavigationService, USER_PREFERENCES_OPTIONS } from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import {
  CustomDashboardService,
  ENTITY_METADATA,
  ExploreVisualizationRequest,
  MetadataService
} from '@hypertrace/observability';
import { entityMetadata } from '../../../../../../src/app/entity-metadata'; // tslint:disable-line: import-blacklist
import { CustomDashboardStoreService } from '../custom-dashboard-store.service';
import { CustomDashboardPanelEditComponent } from './custom-dashboard-panel-edit.component';
import { CustomDashboardPanelEditModule } from './custom-dashboard-panel-edit.module';

describe('CustomDashboardPanelEditComponent', () => {
  let component: CustomDashboardPanelEditComponent;
  let fixture: ComponentFixture<CustomDashboardPanelEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDashboardPanelEditComponent],
      imports: [RouterTestingModule, CustomDashboardPanelEditModule, BrowserAnimationsModule],
      providers: [
        {
          provide: GRAPHQL_OPTIONS,
          useValue: {
            uri: '/graphql',
            batchSize: 2
          }
        },
        {
          provide: ENTITY_METADATA,
          useValue: entityMetadata
        },
        {
          provide: USER_PREFERENCES_OPTIONS,
          useValue: {
            uri: '/user-preferences'
          }
        },
        mockProvider(MetadataService),
        mockProvider(ActivatedRoute, {
          params: of(),
          queryParams: of()
        }),
        mockProvider(CustomDashboardStoreService),
        mockProvider(CustomDashboardService),
        mockProvider(NavigationService, {
          navigation$: of()
        })
      ]
    });
    fixture = TestBed.createComponent(CustomDashboardPanelEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.onVisualizationRequestUpdated({
      series: [{}],
      exploreQuery$: of(),
      resultsQuery$: of()
    } as ExploreVisualizationRequest); // tslint:disable-line: no-object-literal-type-assertion
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { ENTITY_METADATA } from '@hypertrace/observability';

import { NavigableTab } from '@hypertrace/components';
// tslint:disable-next-line: import-blacklist
import { entityMetadata } from '../../../../../../src/app/entity-metadata';
import { ServiceDetailComponent } from './service-detail.component';
import { ServiceDetailModule } from './service-detail.module';

const featureFlaggedTabs: NavigableTab[] = [
  {
    path: 'instrumentation',
    label: 'Instrumentation Quality'
  },
  {
    path: 'deployments',
    label: 'Deployments'
  }
];

describe('ServiceDetailComponent', () => {
  let component: ServiceDetailComponent;
  let fixture: ComponentFixture<ServiceDetailComponent>;

  test('Component exists and shows tabs for enabled features', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceDetailComponent],
      imports: [RouterTestingModule, ServiceDetailModule],
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
        mockProvider(FeatureStateResolver, {
          getFeatureState: () => of(FeatureState.Enabled)
        })
      ]
    });
    fixture = TestBed.createComponent(ServiceDetailComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component).toBeDefined();
    featureFlaggedTabs.map(featureFlaggedTab => {
      expect(component.tabs.find(tab => tab.path === featureFlaggedTab.path)).toHaveProperty(
        'path',
        featureFlaggedTab.path
      );
    });
  });

  test('Does not show tabs for disabled features', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceDetailComponent],
      imports: [RouterTestingModule, ServiceDetailModule],
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
        mockProvider(FeatureStateResolver, {
          getFeatureState: () => of(FeatureState.Disabled)
        })
      ]
    });
    fixture = TestBed.createComponent(ServiceDetailComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    featureFlaggedTabs.map(featureFlaggedTab => {
      expect(component.tabs.find(tab => tab.path === featureFlaggedTab.path)).toBeUndefined();
    });
  });
});

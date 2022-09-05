import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { FeatureState, FeatureStateResolver } from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { ENTITY_METADATA } from '@hypertrace/observability';

// tslint:disable-next-line: import-blacklist
import { entityMetadata } from '../../../../../../src/app/entity-metadata';
import { ServiceDetailComponent } from './service-detail.component';
import { ServiceDetailModule } from './service-detail.module';

describe('ServiceDetailComponent', () => {
  let component: ServiceDetailComponent;
  let fixture: ComponentFixture<ServiceDetailComponent>;

  beforeEach(() => {
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
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test("doesn't display Instrumentation tab when feature flag is disabled", () => {
    expect(component.tabs.find(tab => tab.path === 'instrumentation')).toBe(undefined);
  });
});

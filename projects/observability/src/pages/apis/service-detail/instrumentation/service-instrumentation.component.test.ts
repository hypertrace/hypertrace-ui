import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { InstrumentationQualityService, SubscriptionLifecycle } from '@hypertrace/common';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { ServiceInstrumentationComponent } from './service-instrumentation.component';
import { serviceScoreResponse } from './service-instrumentation.fixture';
import { ServiceInstrumentationService } from './service-instrumentation.service';

describe('ServiceInstrumentationComponent', () => {
  let component: ServiceInstrumentationComponent;
  let fixture: ComponentFixture<ServiceInstrumentationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceInstrumentationComponent],
      imports: [RouterTestingModule],
      providers: [
        mockProvider(ServiceInstrumentationService),
        mockProvider(InstrumentationQualityService, {
          getServiceScore: () => of(serviceScoreResponse)
        }),
        mockProvider(SubscriptionLifecycle)
      ]
    });
    fixture = TestBed.createComponent(ServiceInstrumentationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('uses subject from common service', () => {
    expect(component.getServiceScore().getValue()?.serviceName).toBe('metro');
  });
});

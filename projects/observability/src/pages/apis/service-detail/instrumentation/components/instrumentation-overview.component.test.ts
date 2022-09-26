import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator/jest';

import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { InstrumentationOverviewComponent } from './instrumentation-overview.component';

describe('InstrumentationOverviewComponent', () => {
  let component: InstrumentationOverviewComponent;
  let fixture: ComponentFixture<InstrumentationOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstrumentationOverviewComponent],
      providers: [mockProvider(ServiceInstrumentationService, {})]
    });
    fixture = TestBed.createComponent(InstrumentationOverviewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });
});

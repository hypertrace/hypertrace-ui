import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator/jest';

import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { InstrumentationDetailsComponent } from './instrumentation-details.component';

describe('InstrumentationDetailsComponent', () => {
  let component: InstrumentationDetailsComponent;
  let fixture: ComponentFixture<InstrumentationDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstrumentationDetailsComponent],
      imports: [RouterTestingModule],
      providers: [mockProvider(ServiceInstrumentationService, {})]
    });
    fixture = TestBed.createComponent(InstrumentationDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });
});

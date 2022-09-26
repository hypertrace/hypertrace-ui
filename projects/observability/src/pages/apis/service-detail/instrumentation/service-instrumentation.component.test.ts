import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ServiceInstrumentationComponent } from './service-instrumentation.component';

describe('ServiceInstrumentationComponent', () => {
  let component: ServiceInstrumentationComponent;
  let fixture: ComponentFixture<ServiceInstrumentationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceInstrumentationComponent],
      imports: [RouterTestingModule]
    });
    fixture = TestBed.createComponent(ServiceInstrumentationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });
});

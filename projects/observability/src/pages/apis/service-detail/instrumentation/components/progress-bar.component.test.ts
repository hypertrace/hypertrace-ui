import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { ServiceInstrumentationService } from '../service-instrumentation.service';

import { ProgressBarComponent } from './progress-bar.component';

describe('Instrumentation Quality: ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressBarComponent],
      providers: [
        mockProvider(ServiceInstrumentationService, {
          getColorForScore: () => ({ dark: '' })
        })
      ]
    });
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('floor method rounds down decimals', () => {
    expect(component.floor(99.99)).toBe(99);
  });
});

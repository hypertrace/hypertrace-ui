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
      providers: [mockProvider(ServiceInstrumentationService, { getColorForScore: () => ({ dark: '#dc3d43' }) })]
    });
    fixture = TestBed.createComponent(InstrumentationDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('assigns correct color to icon', () => {
    expect(component.getIconColor(-1)).toBe('#b7bfc2');
    expect(component.getIconColor(30)).toBe('#dc3d43');
  });

  test('assigns correct type to icon', () => {
    expect(component.getHeaderIcon(30)).toBe('svg:close');
    expect(component.getHeaderIcon(50)).toBe('svg:warning');
    expect(component.getHeaderIcon(70)).toBe('checkmark');
  });

  test('shows correct header summary when check is eligible', () => {
    expect(
      component.getHeaderSummary({
        sampleSize: '10',
        failureCount: '9',
        sampleType: 'span',
        name: '',
        description: '',
        evalTimestamp: '',
        sampleIds: [],
        score: 0
      })
    ).toBe('~90% of spans failed this check');
  });

  test('shows correct header summary when check is not eligible', () => {
    expect(
      component.getHeaderSummary({
        sampleSize: '10',
        failureCount: '9',
        sampleType: 'span',
        name: '',
        description: '',
        evalTimestamp: '',
        sampleIds: [],
        score: -1.0
      })
    ).toBe('This check was skipped as no eligible spans were present in the last evaluation');
  });

  test('shows correct header summary when all spans passed check', () => {
    expect(
      component.getHeaderSummary({
        sampleSize: '10',
        failureCount: '0',
        sampleType: 'span',
        name: '',
        description: '',
        evalTimestamp: '',
        sampleIds: [],
        score: 1
      })
    ).toBe('All spans passed this check');
  });
});

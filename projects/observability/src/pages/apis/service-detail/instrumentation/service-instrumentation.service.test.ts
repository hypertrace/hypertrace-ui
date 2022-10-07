import { TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { InstrumentationQualityService } from '@hypertrace/common';
import { orgScoreResponse } from './service-instrumentation.fixture';
import { ServiceInstrumentationService } from './service-instrumentation.service';

describe('ServiceInstrumentationService', () => {
  let service: ServiceInstrumentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServiceInstrumentationService,
        mockProvider(InstrumentationQualityService, {
          getOrgScore: () => of(orgScoreResponse)
        })
      ]
    });
    service = TestBed.inject(ServiceInstrumentationService);
  });

  test('returns correct label for score', () => {
    expect(service.getLabelForScore(30)).toBe('Below Expectation');
    expect(service.getLabelForScore(50)).toBe('Need Improvement');
    expect(service.getLabelForScore(70)).toBe('Good');
    expect(service.getLabelForScore(90)).toBe('Excellent!');
  });

  test('returns correct color for score', () => {
    expect(service.getColorForScore(30).dark).toBe('#dc3d43');
    expect(service.getColorForScore(50).dark).toBe('#ffa01c');
    expect(service.getColorForScore(70).dark).toBe('#3d9a50');
  });

  test('returns correct description for score', () => {
    expect(service.getDescriptionForScore(30)).toBe(
      'Attention is needed to improve the instrumentation of this service so you can start gaining valuable insights from Hypertrace.'
    );
    expect(service.getDescriptionForScore(50)).toBe(
      'There is considerable scope for improvement. Please see the sections below to learn how to improve the instrumentation of this service.'
    );
    expect(service.getDescriptionForScore(70)).toBe(
      'This service has good instrumentation, but you can still make improvements to gain more valuable insights from Hypertrace.'
    );
    expect(service.getDescriptionForScore(90)).toBe(
      'Great job! This service has been instrumented using best practices.'
    );
  });

  test('makes correct call for service score', () => {
    service.getOrgScore().pipe(
      tap(response => {
        expect(response.aggregatedWeightedScore).toBe(orgScoreResponse.aggregatedWeightedScore);
      })
    );
  });
});

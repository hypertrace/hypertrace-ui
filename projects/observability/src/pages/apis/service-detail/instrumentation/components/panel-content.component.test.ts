import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelContentComponent } from './panel-content.component';

describe('PanelContentComponent', () => {
  let component: PanelContentComponent;
  let fixture: ComponentFixture<PanelContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanelContentComponent]
    });
    fixture = TestBed.createComponent(PanelContentComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('navigates to Explorer page with trace ID filled', () => {
    expect(component.getExampleLink('1')).toBe(
      '/explorer?time=1d&scope=endpoint-traces&series=column:count(calls)&filter=traceId_eq_1'
    );
  });

  test('shows correct evaluation date', () => {
    component.heuristicScore = {
      evalTimestamp: '1665124368',
      name: '',
      sampleIds: [],
      description: '',
      score: 0,
      sampleType: 'span',
      sampleSize: '0',
      failureCount: '0'
    };

    expect(component.getEvaluationDate()).toBe('Fri, 07 Oct 2022');
  });
});

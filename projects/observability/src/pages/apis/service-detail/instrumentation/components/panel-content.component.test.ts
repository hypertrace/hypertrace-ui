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
      '/explorer?time=1h&scope=endpoint-traces&series=column:count(calls)&filter=traceId_eq_1'
    );
  });
});

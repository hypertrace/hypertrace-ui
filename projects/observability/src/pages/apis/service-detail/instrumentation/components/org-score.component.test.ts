import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockProvider } from '@ngneat/spectator/jest';

import { ServiceInstrumentationService } from '../service-instrumentation.service';
import { OrgScoreComponent } from './org-score.component';

describe('OrgScoreComponent', () => {
  let component: OrgScoreComponent;
  let fixture: ComponentFixture<OrgScoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrgScoreComponent],
      providers: [
        mockProvider(ServiceInstrumentationService, {
          getLabelForScore: () => 'label',
          getColorForScore: () => ({ dark: 'dark' })
        })
      ]
    });
    fixture = TestBed.createComponent(OrgScoreComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('assigns correct label for score', () => {
    expect(component.scoreLabel).toBe('label');
  });

  test('assigns correct color for score', () => {
    expect(component.scoreColor).toBe('dark');
  });
});

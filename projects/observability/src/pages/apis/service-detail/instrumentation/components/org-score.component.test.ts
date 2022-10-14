import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgScoreComponent } from './org-score.component';

describe('OrgScoreComponent', () => {
  let component: OrgScoreComponent;
  let fixture: ComponentFixture<OrgScoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrgScoreComponent]
    });
    fixture = TestBed.createComponent(OrgScoreComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('assigns correct label for score', () => {
    component.orgScore = 50.87;

    component.serviceScore = 60;
    expect(component.getScoreComment().text).toBe('The service score is above the org score');

    component.serviceScore = 50.68;
    expect(component.getScoreComment().text).toBe('The service score matches the org score');

    component.serviceScore = 40;
    expect(component.getScoreComment().text).toBe('The service score is below the org score');
  });

  test('assigns correct color for score', () => {
    component.orgScore = 50.87;

    component.serviceScore = 60;
    expect(component.getScoreComment().color).toBe('#3d9a50');

    component.serviceScore = 50.68;
    expect(component.getScoreComment().color).toBe('#3d9a50');

    component.serviceScore = 40;
    expect(component.getScoreComment().color).toBe('#dc3d43');
  });
});

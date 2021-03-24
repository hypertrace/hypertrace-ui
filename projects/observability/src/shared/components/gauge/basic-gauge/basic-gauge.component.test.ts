import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicGaugeComponent } from './basic-gauge.component';

describe('BasicGaugeComponent', () => {
  let component: BasicGaugeComponent;
  let fixture: ComponentFixture<BasicGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicGaugeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

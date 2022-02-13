import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeWidgetRendererComponent } from './iframe-widget-renderer.component';

describe('IframeWidgetRendererComponent', () => {
  let component: IframeWidgetRendererComponent;
  let fixture: ComponentFixture<IframeWidgetRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IframeWidgetRendererComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeWidgetRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationService } from '@hypertrace/common';
import { InputComponent } from '@hypertrace/components';
import { EditorApi } from '@hypertrace/hyperdash';
import { EDITOR_API } from '@hypertrace/hyperdash-angular';
import { mockProvider } from '@ngneat/spectator/jest';
import { DashboardPropertyEditorsModule } from '../dashboard-properties.module';
import { StringPropertyEditorComponent } from './string-property-editor.component';

describe('String property editor component', () => {
  let testFixture: ComponentFixture<StringPropertyEditorComponent>;
  let mockApi: Partial<EditorApi<string>>;

  const updateNativeInputValue = (newValue: string) => {
    const input = testFixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = newValue;
    input.dispatchEvent(new Event('input'));
  };

  const triggerInputEvent = (eventType: string) => {
    testFixture.debugElement.query(By.directive(InputComponent)).triggerEventHandler(eventType, {});
  };

  beforeEach(() => {
    mockApi = {
      value: 'initial',
      label: 'test label',
      valueChange: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [DashboardPropertyEditorsModule, NoopAnimationsModule],
      providers: [
        {
          provide: EDITOR_API,
          useValue: mockApi
        },
        mockProvider(NavigationService)
      ]
    });

    // Render directly (no host) because editors are instantiated dynamically
    testFixture = TestBed.createComponent(StringPropertyEditorComponent);
    testFixture.detectChanges();
  });

  test('to show provided label', () => {
    const rendered = testFixture.debugElement;
    expect(rendered.nativeElement.textContent).toContain('test label');
  });

  test('to initialize to provided value', () => {
    const input = testFixture.debugElement.query(By.directive(InputComponent))
      .componentInstance as InputComponent<string>;

    expect(input.value).toBe('initial');
  });

  test('should reflect changes to input values', () => {
    updateNativeInputValue('new value');
    testFixture.detectChanges();

    expect(testFixture.componentInstance.currentValue).toBe('new value');
  });

  test('should only propagate changes on enter or focusout', () => {
    updateNativeInputValue('new value');
    testFixture.detectChanges();

    expect(mockApi.valueChange).not.toHaveBeenCalled();

    triggerInputEvent('keyup.enter');
    expect(mockApi.valueChange).toHaveBeenCalledWith('new value');

    updateNativeInputValue('second value');

    triggerInputEvent('focusout');
    expect(mockApi.valueChange).toHaveBeenCalledWith('second value');
  });

  test('should only propagate changes if value has changed', () => {
    triggerInputEvent('keyup.enter');
    expect(mockApi.valueChange).not.toHaveBeenCalled();

    updateNativeInputValue('new value');
    triggerInputEvent('keyup.enter');
    expect(mockApi.valueChange).toHaveBeenCalledTimes(1);

    triggerInputEvent('keyup.enter');
    expect(mockApi.valueChange).toHaveBeenCalledTimes(1);

    updateNativeInputValue('second value');
    triggerInputEvent('keyup.enter');
    expect(mockApi.valueChange).toHaveBeenCalledTimes(2);
  });
});

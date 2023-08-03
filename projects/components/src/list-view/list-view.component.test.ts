import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dictionary, IsEmptyPipeModule, MemoizeModule, NavigationService } from '@hypertrace/common';
import { mockProvider } from '@ngneat/spectator/jest';
import { ListViewComponent, ListViewHeader, ListViewRecord } from './list-view.component';

describe('List View Component', () => {
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  @Component({
    selector: 'ht-test-host-component',
    template: `
      <ht-list-view [records]="this.records" [metadata]="this.metadata" [header]="this.header"></ht-list-view>
    `
  })
  class TestHostComponent {
    public records: ListViewRecord[] = [
      {
        key: 'Http status 1',
        value: 'Response 1'
      },
      {
        key: 'Http status 2',
        value: 'Response 2'
      }
    ];

    public header: ListViewHeader = {
      keyLabel: 'key',
      valueLabel: 'value'
    };

    public metadata: Dictionary<Dictionary<unknown>> = {
      'Http status 1': {
        key1: 'value1',
        key2: 'value2'
      }
    };
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let hostComp: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, ListViewComponent],
      imports: [CommonModule, IsEmptyPipeModule, MemoizeModule],
      providers: [mockProvider(NavigationService)]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    hostComp = fixture.componentInstance;
  });

  test('should display rows for each data and should display header', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const headerElement = element.querySelector<HTMLElement>('.header-row');
    expect(headerElement).not.toBeNull();

    const headerKeyLabelElement = element.querySelector<HTMLElement>('.header-key-label');
    expect(headerKeyLabelElement).not.toBeNull();
    expect(headerKeyLabelElement?.textContent).toEqual(hostComp.header.keyLabel);

    const headerValueLabelElement = element.querySelector<HTMLElement>('.header-value-label');
    expect(headerValueLabelElement).not.toBeNull();
    expect(headerValueLabelElement?.textContent).toEqual(hostComp.header.valueLabel);

    const rowElements = element.querySelectorAll<HTMLElement>('.data-row');
    expect(rowElements).not.toBeNull();
    expect(rowElements.length).toBe(2);

    const metadataElements = element.querySelectorAll<HTMLDivElement>('.metadata-row');
    expect(metadataElements).not.toBeNull();
    expect(metadataElements.length).toBe(3);
    expect(metadataElements[0].getAttribute('data-key')).toEqual('Http status 1');
    expect(metadataElements[0].textContent).toEqual('Metadata :');
    expect(metadataElements[1].textContent).toEqual('key1 :value1');
    expect(metadataElements[1].getAttribute('data-key')).toEqual('Http status 1');
    expect(metadataElements[2].textContent).toEqual('key2 :value2');
    expect(metadataElements[2].getAttribute('data-key')).toEqual('Http status 1');

    // Match rendered label values with data
    rowElements.forEach((rowElement, index) => {
      const keyElement = rowElement.querySelector('.key');
      const valueElement = rowElement.querySelector('.value');

      expect(keyElement).not.toBeNull();
      expect(keyElement!.textContent).toEqual(hostComp.records[index].key);

      expect(valueElement).not.toBeNull();
      expect(valueElement!.textContent).toEqual(hostComp.records[index].value);
    });
  });
});

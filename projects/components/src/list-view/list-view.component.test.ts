import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListViewComponent, ListViewHeader, ListViewRecord } from './list-view.component';

describe('List View Component', () => {
  @Component({
    selector: 'ht-test-host-component',
    template: ` <ht-list-view [records]="this.records" [header]="this.header"></ht-list-view> `
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
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let hostComp: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, ListViewComponent],
      imports: [CommonModule]
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

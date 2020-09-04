import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListViewComponent, ListViewRecord } from './list-view.component';

describe('List View Component', () => {
  @Component({
    selector: 'htc-test-host-component',
    template: ` <htc-list-view [records]="this.records"></htc-list-view> `
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

  test('should display rows for each data', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

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

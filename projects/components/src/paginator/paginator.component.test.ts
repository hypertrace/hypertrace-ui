import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { LabelComponent } from '../label/label.component';
import { SelectComponent } from '../select/select.component';
import { PaginatorComponent } from './paginator.component';

describe('Paginator component', () => {
  const totalResults = 202;
  const defaultPageSize = 50;

  const createHost = createHostFactory({
    component: PaginatorComponent,
    shallow: true,
    declarations: [MockComponent(SelectComponent), MockComponent(LabelComponent)],
    providers: [mockProvider(NavigationService)]
  });

  test('should notify when page size selection changes', () => {
    const onPageChangeSpy = jest.fn();
    const spectator = createHost(
      `<ht-paginator [totalItems]="totalItems" (pageChange)="onPageChange($event)"></ht-paginator>`,
      {
        hostProps: {
          totalItems: totalResults,
          onPageChange: onPageChangeSpy
        }
      }
    );
    expect(spectator.component.pageSize).toBe(defaultPageSize);

    spectator.query(SelectComponent)!.selectedChange.emit(25);

    expect(onPageChangeSpy).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 25
    });
  });

  test('should have the correct number of pages for the provided page size and total items', () => {
    const spectator = createHost(`<ht-paginator [totalItems]="totalItems"></ht-paginator>`, {
      hostProps: {
        totalItems: totalResults
      }
    });

    expect(spectator.query(LabelComponent)!.label).toEqual('1-50 of 202');

    const nextPageElement = spectator.query('.next-button')!;

    // Page 2
    spectator.click(nextPageElement);
    expect(spectator.component.hasNextPage()).toBe(true);
    expect(spectator.query(LabelComponent)?.label).toEqual('51-100 of 202');

    // Page 3
    spectator.click(nextPageElement);
    expect(spectator.component.hasNextPage()).toBe(true);
    expect(spectator.query(LabelComponent)?.label).toEqual('101-150 of 202');

    // Page 4
    spectator.click(nextPageElement);
    expect(spectator.component.hasNextPage()).toBe(true);
    expect(spectator.query(LabelComponent)?.label).toEqual('151-200 of 202');

    // Page 5
    spectator.click(nextPageElement);
    expect(spectator.component.hasNextPage()).toBe(false);
    expect(spectator.query(LabelComponent)?.label).toEqual('201-202 of 202');

    // Should stop at the last page when trying to go to a higher page than available
    spectator.click(nextPageElement);
    expect(spectator.query(LabelComponent)?.label).toEqual('201-202 of 202');
  });

  test('should stop at the first page when trying to go to a lower page than available', () => {
    const spectator = createHost(`<ht-paginator [totalItems]="totalItems"></ht-paginator>`, {
      hostProps: {
        totalItems: totalResults
      }
    });

    expect(spectator.query(LabelComponent)?.label).toEqual('1-50 of 202');
    expect(spectator.component.hasPrevPage()).toBe(false);

    const previousPageElement = spectator.query('.previous-button')!;

    spectator.click(previousPageElement);
    expect(spectator.query(LabelComponent)?.label).toEqual('1-50 of 202');
    expect(spectator.component.hasPrevPage()).toBe(false);
  });

  test('should navigate to first page when totalItems is changed', () => {
    const spectator = createHost(`<ht-paginator [totalItems]="totalItems"></ht-paginator>`, {
      hostProps: {
        totalItems: totalResults
      }
    });

    const nextPageElement = spectator.query('.next-button')!;

    // Page 2
    spectator.click(nextPageElement);
    expect(spectator.component.hasNextPage()).toBe(true);
    expect(spectator.query(LabelComponent)?.label).toEqual('51-100 of 202');

    // Change the totalItems
    spectator.setHostInput({ totalItems: 50 });

    expect(spectator.query(LabelComponent)?.label).toEqual('1-50 of 50');
    expect(spectator.component.hasNextPage()).toBe(false);
  });

  test('should hide the paginator when totalItems is less than the pageSizeOptions options', () => {
    const spectator = createHost(`<ht-paginator [totalItems]="totalItems"></ht-paginator>`, {
      hostProps: {
        totalItems: 20
      }
    });

    const paginator = spectator.query('.paginator')!;
    expect(paginator).toBeNull();
  });
});

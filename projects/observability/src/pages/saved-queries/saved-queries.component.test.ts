import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { SavedQueriesModule } from '@hypertrace/observability';
import { ScopeQueryParam } from '../explorer/explorer.component';
import { SavedQueriesComponent } from './saved-queries.component';

describe('SavedQueriesComponent', () => {
  let component: SavedQueriesComponent;
  let fixture: ComponentFixture<SavedQueriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SavedQueriesComponent],
      imports: [RouterTestingModule, SavedQueriesModule],
      providers: [
        {
          provide: GRAPHQL_OPTIONS,
          useValue: {
            uri: '/graphql',
            batchSize: 2
          }
        }
      ]
    });
    fixture = TestBed.createComponent(SavedQueriesComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  test('should be created successfully', () => {
    expect(component).toBeDefined();
  });

  test('should contain not found text when no saved queries are available', () => {
    const debugElement = fixture.debugElement;
    const p = debugElement.query(By.css('.not-found-text')).nativeElement;
    expect(p.textContent).toContain("You haven't saved any queries! Go to Explorer page to save a query.");
  });

  test('renames a query successfully', () => {
    component.savedQueries = [{ name: 'Query 1', scopeQueryParam: ScopeQueryParam.Spans, filters: [] }];
    window.prompt = jest.fn().mockReturnValue('Query 2');

    component.onRename(0);
    expect(component.savedQueries[0].name).toBe('Query 2');
  });

  test('deletes a query successfully', () => {
    component.savedQueries = [{ name: 'Query 1', scopeQueryParam: ScopeQueryParam.Spans, filters: [] }];
    window.confirm = jest.fn().mockReturnValue(true);

    component.onDelete(0);
    expect(component.savedQueries.length).toBe(0);
  });
});

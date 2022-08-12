import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { mockProvider } from '@ngneat/spectator/jest';
import { BehaviorSubject, of } from 'rxjs';

import { USER_PREFERENCES_OPTIONS } from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { SavedQueriesModule } from '@hypertrace/observability';
import { ScopeQueryParam } from '../explorer/explorer.types';
import { SavedQueriesComponent } from './saved-queries.component';
import { SavedQueryPayload } from './saved-queries.service';

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
        },
        {
          provide: USER_PREFERENCES_OPTIONS,
          useValue: {
            uri: '/user-preferences'
          }
        },
        mockProvider(HttpClient, {
          get: () => of({ payload: [] }),
          put: () => of({}),
          delete: () => of({ success: true })
        }),
        mockProvider(HttpHandler)
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
    component.savedQueriesSubject = new BehaviorSubject<SavedQueryPayload[]>([
      {
        createdAt: 3,
        updatedAt: 4,
        deletedAt: 0,
        ownerID: 2,
        id: 1,
        data: { name: 'Query 1', scopeQueryParam: ScopeQueryParam.Spans, filters: [] }
      }
    ]);
    window.prompt = jest.fn().mockReturnValue('Query 2');

    component.onRename(1);
    expect(component.savedQueriesSubject.getValue()[0].data.name).toBe('Query 2');
  });

  test('deletes a query successfully', () => {
    component.savedQueriesSubject = new BehaviorSubject<SavedQueryPayload[]>([
      {
        createdAt: 3,
        updatedAt: 4,
        deletedAt: 0,
        ownerID: 2,
        id: 1,
        data: { name: 'Query 1', scopeQueryParam: ScopeQueryParam.Spans, filters: [] }
      }
    ]);
    window.confirm = jest.fn().mockReturnValue(true);

    component.onDelete(1);
    expect(component.savedQueriesSubject.getValue().length).toBe(0);
  });
});

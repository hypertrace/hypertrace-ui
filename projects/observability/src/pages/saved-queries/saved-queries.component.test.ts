import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { SavedQueriesModule } from '@hypertrace/observability';
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

  it('should contain not found text when no saved queries are available', () => {
    const debugElement = fixture.debugElement;
    const p = debugElement.query(By.css('.not-found-text')).nativeElement;
    expect(p.textContent).toContain("You haven't saved any queries! Go to Explorer page to save a query.");
  });
});

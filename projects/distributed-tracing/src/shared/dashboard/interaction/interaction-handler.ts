import { Observable } from 'rxjs';

export interface InteractionHandler {
  // TODO: parameter specification needs more thought
  execute(data: unknown): Observable<void>;
}

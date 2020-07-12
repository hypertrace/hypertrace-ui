import { BehaviorSubject, Observable } from 'rxjs';

export class Step {
  public constructor(
    private _name: string = '',
    private _state: StepState = StepState.Incomplete,
    private _subSteps: SubStep[] = []
  ) {}

  private readonly changeSubject: BehaviorSubject<true> = new BehaviorSubject(true);
  public readonly changes$: Observable<boolean> = this.changeSubject.asObservable();

  public get name(): string {
    return this._name;
  }

  public set name(name: string) {
    this._name = name;
    this.changeSubject.next(true);
  }

  private get state(): StepState {
    return this._state;
  }

  private set state(state: StepState) {
    this._state = state;
    this.changeSubject.next(true);
  }

  public get subSteps(): SubStep[] {
    return this._subSteps;
  }

  public set subSteps(subSteps: SubStep[]) {
    this._subSteps = subSteps;
    this.changeSubject.next(true);
  }

  public markCompleted(): void {
    this.state = StepState.Completed;
  }

  public markIncomplete(): void {
    this.state = StepState.Incomplete;
  }

  public markReadyForCompletion(): void {
    this.state = StepState.Ready;
  }

  public isIncomplete(): boolean {
    return this.state === StepState.Incomplete;
  }

  public isReadyForCompletion(): boolean {
    return this.state === StepState.Ready;
  }

  public isCompleted(): boolean {
    return this.state === StepState.Completed;
  }
}

export const enum StepState {
  Incomplete = 'incomplete',
  Ready = 'ready',
  Completed = 'completed'
}

export interface SubStep {
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  status$: Observable<boolean>;
}

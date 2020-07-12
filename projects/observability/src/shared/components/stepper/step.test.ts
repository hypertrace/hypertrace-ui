import { Step } from './step';

describe('Step Api', () => {
  test('check if step api updates correctly', () => {
    const step = new Step('Test Name');

    expect(step.name).toBe('Test Name');
    expect(step.isIncomplete()).toBeTruthy();
    expect(step.isCompleted()).toBeFalsy();
    expect(step.isReadyForCompletion()).toBeFalsy();

    // Mark Step ready for completion
    step.markReadyForCompletion();
    expect(step.isIncomplete()).toBeFalsy();
    expect(step.isCompleted()).toBeFalsy();
    expect(step.isReadyForCompletion()).toBeTruthy();

    // Mark Step completed
    step.markCompleted();
    expect(step.isIncomplete()).toBeFalsy();
    expect(step.isCompleted()).toBeTruthy();
    expect(step.isReadyForCompletion()).toBeFalsy();

    // Mark Step Incomplete
    step.markIncomplete();
    expect(step.isIncomplete()).toBeTruthy();
    expect(step.isCompleted()).toBeFalsy();
    expect(step.isReadyForCompletion()).toBeFalsy();
  });
});

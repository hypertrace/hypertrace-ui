import { GreetingLabelComponent } from '@hypertrace/components';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';

describe('Greeting Label component', () => {
  let spectator: Spectator<GreetingLabelComponent>;

  const createHost = createHostFactory({
    shallow: true,
    component: GreetingLabelComponent
  });

  test('should render interpolated string correctly for morning', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(8);
    spectator = createHost(`<htc-greeting-label [suffixLabel]="templateString"></htc-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Morning, here's your report");
  });

  test('should render interpolated string correctly for afternoon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(13);
    spectator = createHost(`<htc-greeting-label [suffixLabel]="templateString"></htc-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Afternoon, here's your report");
  });

  test('should render interpolated string correctly for evening', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(1);
    spectator = createHost(`<htc-greeting-label [suffixLabel]="templateString"></htc-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Evening, here's your report");
  });
});

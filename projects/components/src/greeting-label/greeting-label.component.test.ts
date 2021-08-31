import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { GreetingLabelComponent } from './greeting-label.component';

describe('Greeting Label component', () => {
  let spectator: Spectator<GreetingLabelComponent>;

  const createHost = createHostFactory({
    shallow: true,
    component: GreetingLabelComponent
  });

  test('should render interpolated string correctly for morning', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    spectator = createHost(`<ht-greeting-label [suffixLabel]="templateString"></ht-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Morning, here's your report");
  });

  test('should render interpolated string correctly for afternoon', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(13);
    spectator = createHost(`<ht-greeting-label [suffixLabel]="templateString"></ht-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Afternoon, here's your report");
  });

  test('should render interpolated string correctly for evening', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(1);
    spectator = createHost(`<ht-greeting-label [suffixLabel]="templateString"></ht-greeting-label>`, {
      hostProps: {
        templateString: ", here's your report"
      }
    });

    expect(spectator.query('.greeting-label')).toContainText("Good Evening, here's your report");
  });
});

import { CustomDashboardStoreService, PanelData } from './custom-dashboard-store.service';

describe('CustomDashboardStoreService', () => {
  let service: CustomDashboardStoreService;
  beforeEach(() => {
    service = new CustomDashboardStoreService();
  });

  test('set and get dashboard data', () => {
    service.set('1', { id: '2', name: 'd1', panels: [] });
    expect(service.get('1').name).toBe('d1');
  });

  test('hasKey', () => {
    expect(service.hasKey('1')).toBeFalsy();
    service.set('1', { id: '2', name: 'd1', panels: [] });
    expect(service.hasKey('1')).toBeTruthy();
  });

  test('addPanel and getPanel', () => {
    service.set('1', { id: '2', name: 'd1', panels: [] });
    expect(service.getPanel('1', '3')).toBeUndefined();

    service.addPanel('1', { id: '3', name: 'panel1' } as PanelData); // tslint:disable-line: no-object-literal-type-assertion
    expect(service.getPanel('1', '3')?.name).toBe('panel1');
  });
});

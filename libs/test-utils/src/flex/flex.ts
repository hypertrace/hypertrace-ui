import { StaticProvider } from '@angular/core';
import { StyleUtils, ɵMockMatchMediaProvider } from '@angular/flex-layout';

export const getMockFlexLayoutProviders = (): StaticProvider[] => [
  {
    provide: StyleUtils,
    useValue: {
      getFlowDirection: jest.fn(() => ['row', '']),
      applyStyleToElement: jest.fn(),
      applyStyleToElements: jest.fn()
    }
  },
  ɵMockMatchMediaProvider // TODO fix this, it's now internal but no clear way to mock
];

/*
 * Public API Surface of test-utils
 */

export { getTestFilterAttribute, getAllTestFilterAttributes } from './attributes/attributes';
export { getMockFlexLayoutProviders } from './flex/flex';
export { patchRouterNavigateForTest } from './router/router';
export { runFakeRxjs, recordObservable, expectSingleEmissisonFromCallback } from './rxjs/rxjs';
export { addWidthAndHeightToSvgElForTest } from './svg/svg';

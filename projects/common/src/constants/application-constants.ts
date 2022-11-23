/* tslint:disable:variable-name */
export const ApplicationFeature = {
  PageTimeRange: 'ui.page-time-range',
  SavedQueries: 'ui.saved-queries',
  CustomDashboards: 'ui.custom-dashboards',
  InstrumentationQuality: 'ui.instrumentation-quality',
  DeploymentMarkers: 'ui.deployment-markers'
} as const;

export type ApplicationFeatureKeys = keyof typeof ApplicationFeature;
export type ApplicationFeatureValues = typeof ApplicationFeature[ApplicationFeatureKeys];

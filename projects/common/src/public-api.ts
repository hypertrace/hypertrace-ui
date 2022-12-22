/*
 * Public API Surface of common
 */

// Angular
export * from './utilities/angular/angular-utils';
export * from './utilities/angular/pipes';
export { DynamicComponentService } from './utilities/angular/dynamic-component.service';

// Browser
export { CookieService } from './utilities/browser/cookies/cookie.service';
export { LocalStorage } from './utilities/browser/storage/local-storage';
export { SessionStorage } from './utilities/browser/storage/session-storage';
export * from './utilities/browser/storage/abstract-storage';

// Coercers
export * from './utilities/coercers/boolean-coercer';
export * from './utilities/coercers/coercer';
export * from './utilities/coercers/date-coercer';
export * from './utilities/coercers/noop-coercer';
export * from './utilities/coercers/number-coercer';

// Color
export * from './color/color.service';
export * from './color/color';

// Constants
export * from './constants/application-constants';

// Custom Error
export * from './custom-error/custom-error';

// DOM
export { DomElementMeasurerService } from './utilities/dom/dom-element-measurer.service';
export { DomElementScrollIntoViewService } from './utilities/dom/dom-element-scroll-into-view.service';
export * from './utilities/dom/dom-utilities';

// External
export * from './external/external-url-navigator';

// Feature
export { FeatureGuard } from './feature/feature.guard';
export { FeatureStateResolver } from './feature/state/feature-state.resolver';
export { FeatureFlagValue } from './feature/state/feature-state.resolver';
export { FeatureState } from './feature/state/feature.state';

// Formatters
export * from './utilities/formatters/date/date-formatter';
export * from './utilities/formatters/date/display-date.pipe';
export * from './utilities/formatters/time/display-time-ago.pipe';
export * from './utilities/formatters/duration/duration-formatter';
export * from './utilities/formatters/duration/display-duration.pipe';
export * from './utilities/formatters/ordinal/ordinal.pipe';
export * from './utilities/formatters/ordinal/ordinal-formatter';
export * from './utilities/formatters/formatting.module';
export * from './utilities/formatters/numeric/display-number.pipe';
export * from './utilities/formatters/numeric/numeric-formatter';
export * from './utilities/formatters/string/string-formatter';
export * from './utilities/formatters/string/highlight.pipe';
export * from './utilities/formatters/enum/display-string-enum.pipe';
export * from './utilities/formatters/enum/display-string-enum';

// Http Param Encoder
export { HttpParamEncoder } from './utilities/http/http-param-encoder';

// Input
export * from './utilities/input/key';
export * from './utilities/input/mouse-button';

// Lang
export * from './utilities/lang/lang-utils';

// Layout change
export { LayoutChangeService } from './layout/layout-change.service';

// Logger
export * from './logger/logger.service';

// Math
export * from './utilities/math/math-utilities';

// Memoize
export * from './utilities/memoize/memoize.module';
export * from './utilities/memoize/memoize.pipe';

// Navigation
export * from './navigation/breadcrumb';
export * from './navigation/navigation.service';
export * from './navigation/ht-route-data';
export * from './navigation/ht-route';

// Operations
export * from './utilities/operations/operation-utilities';

// Preferences
export * from './preference/preference.service';

// RxJS
export * from './utilities/rxjs/rxjs-utils';
export * from './utilities/rxjs/subscription-lifeycle.service';

// Special Types
export * from './utilities/types/angular-change-object';
export * from './utilities/types/types';

// Telemetry
export * from './telemetry/user-telemetry.module';
export * from './telemetry/track/user-telemetry-tracking.module';
export * from './telemetry/track/track.directive';
export * from './telemetry/user-telemetry.service';
export * from './telemetry/telemetry';
export { FullStoryTelemetry } from './telemetry/providers/fullstory/full-story-provider';
export { FreshPaintTelemetry } from './telemetry/providers/freshpaint/freshpaint-provider';
export { MixPanelTelemetry } from './telemetry/providers/mixpanel/mixpanel-provider';
export { RudderStackTelemetry } from './telemetry/providers/rudderstack/rudderstack-provider';
export { TrackDirective } from './telemetry/track/track.directive';

// Time
export * from './time/fixed-time-range';
export * from './time/interval-duration.service';
export * from './time/relative-time-range';
export * from './time/time-duration.service';
export * from './time/time-duration';
export * from './time/time-range';
export * from './time/time-range.service';
export * from './time/time-range.type';
export * from './time/time-unit.type';
export * from './time/time';
export * from './time/page-time-range-preference.service';

// Validators
export * from './utilities/validators';

// Color Palette
export * from './color/color-palette';

// Global header height provider
export * from './global-header-height/global-header-height-provider.service';

// Key codes
export * from './key-codes/key-code';

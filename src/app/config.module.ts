import { NgModule } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import {
  ALTERNATE_COLOR_PALETTES,
  APP_TITLE,
  DEFAULT_COLOR_PALETTE,
  EXTERNAL_URL_CONSTANTS,
  externalUrlConstants
} from '@hypertrace/common';
import { GRAPHQL_OPTIONS } from '@hypertrace/graphql-client';
import { ENTITY_METADATA, RED_COLOR_PALETTE } from '@hypertrace/observability';
import { environment } from '../environments/environment';
import { entityMetadata } from './entity-metadata';
import { FeatureResolverModule } from './shared/feature-resolver/feature-resolver.module';

@NgModule({
  imports: [FeatureResolverModule],
  providers: [
    {
      provide: GRAPHQL_OPTIONS,
      useValue: {
        uri: environment.graphqlUri,
        batchSize: 5
      }
    },
    {
      provide: DEFAULT_COLOR_PALETTE,
      useValue: {
        key: 'default',
        colors: ['#001429', '#003149', '#005163', '#007374', '#30947B', '#70B47C', '#B4D17E', '#FFEA8A']
      }
    },
    {
      provide: ALTERNATE_COLOR_PALETTES,
      multi: true,
      useValue: {
        key: RED_COLOR_PALETTE,
        colors: ['#EEC200', '#F7902D', '#E8654B', '#C44660', '#923768', '#5B2F60', '#27244A', '#001429']
      }
    },
    {
      provide: ENTITY_METADATA,
      useValue: entityMetadata
    },
    {
      provide: APP_TITLE,
      useValue: environment.appTitle
    },
    {
      provide: MATERIAL_SANITY_CHECKS,
      useValue: {
        doctype: true,
        theme: false,
        version: true
      }
    },
    {
      provide: EXTERNAL_URL_CONSTANTS,
      useValue: externalUrlConstants
    }
  ]
})
export class ConfigModule {}

import { NgModule } from '@angular/core';
import { ALTERNATE_COLOR_PALETTES, DEFAULT_COLOR_PALETTE, GLOBAL_HEADER_HEIGHT } from '@hypertrace/common';
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
      provide: GLOBAL_HEADER_HEIGHT,
      useValue: '56px'
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
    }
  ]
})
export class ConfigModule {}

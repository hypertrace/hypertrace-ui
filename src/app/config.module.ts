import { NgModule } from '@angular/core';
import { ALTERNATE_COLOR_PALETTES, DEFAULT_COLOR_PALETTE, GLOBAL_HEADER_HEIGHT } from '@hypertrace/common';
import { GRAPHQL_URI } from '@hypertrace/graphql-client';
import { ENTITY_METADATA, GRAY_COLOR_PALETTE, RED_COLOR_PALETTE } from '@hypertrace/observability';
import { environment } from '../environments/environment';
import { entityMetadata } from './entity-metadata';
import { FeatureResolverModule } from './shared/feature-resolver/feature-resolver.module';

@NgModule({
  imports: [FeatureResolverModule],
  providers: [
    {
      provide: GRAPHQL_URI,
      useValue: environment.graphqlUri
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
      provide: ALTERNATE_COLOR_PALETTES,
      multi: true,
      useValue: {
        key: GRAY_COLOR_PALETTE,
        colors: ['#3F474A', '#565F62', '#6C767A', '#828D91', '#97A3A7', '#ACB9BD', '#C1CFD4', '#D6E5EA']
      }
    },
    {
      provide: ENTITY_METADATA,
      useValue: entityMetadata
    }
  ]
})
export class ConfigModule {}

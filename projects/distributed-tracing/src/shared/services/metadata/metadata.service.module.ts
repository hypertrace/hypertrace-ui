import { NgModule } from '@angular/core';
import { GraphQlModule } from '@hypertrace/graphql-client';
import { MetadataGraphQlQueryHandlerService } from './handler/metadata-graphql-query-handler.service';

@NgModule({
  imports: [GraphQlModule.withHandlerProviders([MetadataGraphQlQueryHandlerService])]
})
export class MetadataServiceModule {}

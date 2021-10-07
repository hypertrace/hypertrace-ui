import { SpanGraphQlQueryHandlerService } from '../../../graphql/request/handlers/spans/span-graphql-query-handler.service';
import { SpansGraphQlQueryHandlerService } from '../../../graphql/request/handlers/spans/spans-graphql-query-handler.service';
import { ExportSpansGraphQlQueryHandlerService } from '../../../graphql/request/handlers/traces/export-spans-graphql-query-handler.service';
import { TraceGraphQlQueryHandlerService } from '../../../graphql/request/handlers/traces/trace-graphql-query-handler.service';
import { TracesGraphQlQueryHandlerService } from '../../../graphql/request/handlers/traces/traces-graphql-query-handler.service';
import { MetadataGraphQlQueryHandlerService } from '../../../services/metadata/handler/metadata-graphql-query-handler.service';

export const GRAPHQL_DATA_SOURCE_HANDLER_PROVIDERS = [
  ExportSpansGraphQlQueryHandlerService,
  TracesGraphQlQueryHandlerService,
  TraceGraphQlQueryHandlerService,
  SpansGraphQlQueryHandlerService,
  SpanGraphQlQueryHandlerService,
  MetadataGraphQlQueryHandlerService
];

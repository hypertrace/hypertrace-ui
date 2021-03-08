import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconLibraryModule } from '@hypertrace/assets-library';
import { ObservabilityIconType } from './observability-icon-type';

const iconsRootPath = 'assets/icons';

@NgModule({
  imports: [
    MatIconModule,
    IconLibraryModule.withIcons([
      { key: ObservabilityIconType.Api, url: `${iconsRootPath}/api.svg` },
      { key: ObservabilityIconType.Apigee, url: `${iconsRootPath}/apigee.svg` },
      { key: ObservabilityIconType.ApplicationFlow, url: `${iconsRootPath}/application-flow.svg` },
      { key: ObservabilityIconType.AWS, url: `${iconsRootPath}/aws.svg` },
      { key: ObservabilityIconType.AWSRDS, url: `${iconsRootPath}/aws-rds.svg` },
      { key: ObservabilityIconType.Backend, url: `${iconsRootPath}/backend.svg` },
      { key: ObservabilityIconType.Cassandra, url: `${iconsRootPath}/cassandra.svg` },
      { key: ObservabilityIconType.Elastic, url: `${iconsRootPath}/elastic.svg` },
      { key: ObservabilityIconType.Edge, url: `${iconsRootPath}/edge.svg` },
      { key: ObservabilityIconType.Gateway, url: `${iconsRootPath}/gateway.svg` },
      { key: ObservabilityIconType.Helm, url: `${iconsRootPath}/helm.svg` },
      { key: ObservabilityIconType.HTTP, url: `${iconsRootPath}/http.svg` },
      { key: ObservabilityIconType.JDBC, url: `${iconsRootPath}/jdbc.svg` },
      { key: ObservabilityIconType.Kafka, url: `${iconsRootPath}/backend.svg` },
      { key: ObservabilityIconType.Kong, url: `${iconsRootPath}/kong.svg` },
      { key: ObservabilityIconType.Kubernetes, url: `${iconsRootPath}/kubernetes.svg` },
      { key: ObservabilityIconType.MicrosoftAzure, url: `${iconsRootPath}/microsoft-azure.svg` },
      { key: ObservabilityIconType.MicrosoftSqlServer, url: `${iconsRootPath}/microsoft-sql-server.svg` },
      { key: ObservabilityIconType.Mongo, url: `${iconsRootPath}/mongo.svg` },
      { key: ObservabilityIconType.Mysql, url: `${iconsRootPath}/mysql.svg` },
      { key: ObservabilityIconType.Nginx, url: `${iconsRootPath}/nginx.svg` },
      { key: ObservabilityIconType.Node, url: `${iconsRootPath}/node.svg` },
      { key: ObservabilityIconType.Oracle, url: `${iconsRootPath}/oracle.svg` },
      { key: ObservabilityIconType.PostgreSQL, url: `${iconsRootPath}/postgre-sql.svg` },
      { key: ObservabilityIconType.RabbitMQ, url: `${iconsRootPath}/rabbit-mq.svg` },
      { key: ObservabilityIconType.Redis, url: `${iconsRootPath}/redis.svg` },
      { key: ObservabilityIconType.Serverless, url: `${iconsRootPath}/serverless.svg` },
      { key: ObservabilityIconType.Service, url: `${iconsRootPath}/service.svg` },
      { key: ObservabilityIconType.ServicesList, url: `${iconsRootPath}/services_list.svg` },
      { key: ObservabilityIconType.SQS, url: `${iconsRootPath}/backend.svg` },
      { key: ObservabilityIconType.Tyk, url: `${iconsRootPath}/tyk.svg` }
    ])
  ]
})
export class ObservabilityIconLibraryModule {}

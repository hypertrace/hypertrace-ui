// Use symbols so we can decorate this info without worrying about existing fields
export const entityIdKey = Symbol('entityId');
export const entityTypeKey = Symbol('entityType');

export interface Entity<T extends EntityType = EntityType> {
  [key: string]: unknown;
  [entityIdKey]: string;
  [entityTypeKey]: T;
}

export type EntityType = string;

export const enum ObservabilityEntityType {
  Api = 'API',
  Service = 'SERVICE',
  Backend = 'BACKEND'
}

export interface Interaction {
  neighbor: Entity;
  [key: string]: unknown;
}

export const INTERACTION_SCOPE = 'INTERACTION';

export const enum BackendType {
  Apigee = 'APIGEE',
  AWS = 'AWS',
  AWSRDS = 'AWS_RDS',
  Cassandra = 'CASSANDRA',
  Elastic = 'ELASTIC',
  Helm = 'HELM',
  HTTP = 'HTTP',
  Kong = 'KONG',
  Kubernetes = 'KUBERNETES',
  MicrosoftAzure = 'MICROSOFT_Azure',
  MicrosoftSqlServer = 'MICROSOFT_SQL_Server',
  Mongo = 'MONGO',
  Mysql = 'MYSQL',
  Oracle = 'ORACLE',
  PostgreSQL = 'POSTGRE_SQL',
  RabbitMQ = 'RABBIT_MQ',
  Redis = 'REDIS',
  Tyk = 'TYK',
  JDBC = 'JDBC'
}
